# CivicPulse

**A civic education web app that helps Chicago residents understand local government, their elected officials, and public spending — powered by live data and AI.**

🌐 **Live Site:** [civicpulsetemp.netlify.app](https://civicpulsetemp.netlify.app)

---

## What It Does

CivicPulse is a zipcode-driven civic information platform. A resident enters their Chicago zip code and instantly sees:

- **Who represents them** — every elected official at the city, state, and federal level, with contact information and official links
- **AI-generated plain-language summaries** — a single click generates a neutral, factual summary of each official using the Claude AI API
- **Where their tax dollars go** — an interactive budget visualization showing city spending by department *(in development)*
- **What's on their ballot** — election calendar and candidate profiles *(planned)*

The guiding design principle: **complexity should illuminate, not intimidate.** Every data point shows its source, a link, and a last-verified timestamp.

---

## Why I Built This

No existing civic platform combines local tax data, government structure education, and AI-generated candidate summaries in one place. Ballotpedia, BallotReady, and VoteSmart each solve one piece of the puzzle. CivicPulse is designed to solve all of them — starting with Chicago, built to scale.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | HTML, CSS, Vanilla JavaScript | UI, zip validation, card rendering |
| **Serverless Functions** | Netlify Functions (Node.js) | Secure API proxies — keys never touch the frontend |
| **AI Integration** | Anthropic Claude API (Haiku) | Plain-language summaries of elected officials |
| **Legislative Data** | OpenStates API | Live Illinois and federal legislator data |
| **Geocoding** | Zippopotam.us | Zip code → latitude/longitude conversion |
| **Hosting & CI/CD** | Netlify | Auto-deploy on every GitHub push (30–60s) |
| **Version Control** | GitHub | Full commit history, branch-based workflow |
| **Database** | Supabase (PostgreSQL) | Planned — candidate profiles and caching |
| **Charts** | Chart.js | Budget pie chart visualization (in development) |
| **Future** | React / Next.js | Phase 4 migration for performance and scale |

---

## Architecture

CivicPulse uses a **serverless proxy pattern** — the frontend never calls any third-party API directly. Every external data source is fronted by a dedicated Netlify serverless function that handles authentication and keeps API keys server-side.

```
User (Browser)
      │
      ▼
  index.html + script.js
      │
      ├──▶ /.netlify/functions/representatives  ──▶  OpenStates API
      │                                         ──▶  Zippopotam.us
      │
      └──▶ /.netlify/functions/ai-summary       ──▶  Anthropic Claude API
```

**Why this matters:** This pattern is production-grade security practice. No API key is ever exposed in client-side code, browser network tabs, or the GitHub repository. Keys are stored exclusively as Netlify environment variables.

---

## Key Features Built

### ✅ Zip Code Validation & Routing
- Validates against all ~56 Chicago zip codes
- Converts zip to coordinates server-side for API calls
- Graceful error handling for invalid or out-of-range zips

### ✅ Live Representative Cards
- Pulls real-time data from the OpenStates API
- Displays name, office, chamber, party, email, and official website
- Correctly maps `org_classification` (`upper`/`lower`) to human-readable chamber labels (Senate/House)
- Handles edge cases: missing emails, missing links, null fields

### ✅ AI-Powered Official Summaries
- Each rep card has a **"Get AI Summary"** button
- On click: sends the official's name, role, and party to a serverless function
- The function calls the **Anthropic Claude API** with a carefully engineered prompt
- Returns a 3-sentence, neutral, plain-language summary within seconds
- UX details: button disables during load, pulses to show activity, updates to ✅ on success
- Cost-efficient: uses Claude Haiku (~$0.0003 per summary); lazy-loaded so API is only called on demand

### ✅ Secure Serverless API Layer
- All external API calls routed through Netlify Functions
- API keys stored as encrypted Netlify environment variables
- `https` Node.js native module used for reliability (no `fetch` dependency issues)
- Timeout handling and graceful error responses on every endpoint

---

## Project Phases

| Phase | Theme | Status |
|---|---|---|
| **Phase 1** | Static foundation — HTML/CSS/JS, Netlify deploy, zip validation | ✅ Complete |
| **Phase 2** | Live data — OpenStates API, real rep cards, serverless functions | ✅ Complete |
| **Phase 3a** | AI integration — Claude API summaries on every official | ✅ Complete |
| **Phase 3b** | Election engine — reliability scoring, election calendar, candidate profiles | 🔧 In Progress |
| **Phase 4** | Scale — React/Next.js migration, all 77 Chicago community areas, mobile app | 🔜 Planned |

---

## Repository Structure

```
civicpulse/
├── index.html                        # Main app entry point
├── netlify.toml                      # Netlify build + function configuration
├── css/
│   └── style.css                     # All styling, including AI summary components
├── js/
│   └── script.js                     # App logic, API calls, card rendering, AI button
└── netlify/
    └── functions/
        ├── representatives.js        # Proxies OpenStates + geocoding APIs
        └── ai-summary.js            # Proxies Anthropic Claude API
```

---

## Engineering Decisions Worth Noting

**Lazy-loaded AI calls** — Summaries are only generated when a user clicks the button. Auto-loading would call the Claude API for every representative on every search, multiplying cost with no user benefit. The button pattern is both better UX and better economics.

**Native `https` module over `fetch`** — Netlify's Node.js runtime does not reliably support the `fetch` API. Using Node's built-in `https` module ensures consistent behavior across all deployment environments without adding package dependencies.

**Prompt engineering for neutrality** — The Claude API prompt explicitly instructs the model to be nonpartisan, avoid speculation, and acknowledge uncertainty. This is a deliberate editorial choice aligned with CivicPulse's core value of neutrality.

**Staged build approach** — Each feature is broken into independently shippable slices (e.g., public chart before personalization form). This ships value sooner and keeps debugging surface area small.

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/civicpulse.git
cd civicpulse

# Install Netlify CLI
npm install -g netlify-cli

# Add environment variables
# Create a .env file or use netlify dev --live
OPENSTATES_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Run locally with Netlify's dev server (supports serverless functions)
netlify dev
```

---

## Roadmap

- [ ] Tax Allocation page — interactive pie chart of Chicago city budget by department
- [ ] Personalized tax calculator — "Here is your estimated annual contribution to each department"
- [ ] Election calendar — upcoming Chicago and Illinois elections
- [ ] Candidate profiles — sourced from official campaign platforms
- [ ] AI Reliability Score — rates how faithfully an AI summary reflects source material
- [ ] React / Next.js migration
- [ ] Expand to all 77 Chicago community areas
- [ ] Illinois state layer
- [ ] Mobile app via React Native or Capacitor

---

## Data Sources

| Source | Data Provided | License |
|---|---|---|
| [OpenStates API](https://openstates.org/api/) | Illinois and federal legislators | Open public data |
| [Anthropic Claude API](https://www.anthropic.com) | AI-generated summaries | Commercial API |
| [Zippopotam.us](https://www.zippopotam.us) | Zip code geocoding | Free public API |
| [Chicago Data Portal](https://data.cityofchicago.org) | City budget, ordinances | Open public data |

*CivicPulse aggregates public data. We do not create it.*

---

## About

Built by **Ethan Jackson** as an independent civic tech project.

CivicPulse is designed to be nonpartisan, transparent, and educational. It has no advertising, no political affiliation, and no editorial opinion. Every data point links to its original source.

*Funding strategy: Knight Foundation, Democracy Fund, and Mozilla Foundation grants. Eventual 501(c)(3) nonprofit structure.*
