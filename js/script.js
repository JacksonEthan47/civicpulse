document.addEventListener("DOMContentLoaded", function () {
  const zipcodeInput = document.getElementById("zipcode-input");
  const searchBtn = document.getElementById("search-btn");
  const errorMsg = document.getElementById("error-msg");
  const resultsSection = document.getElementById("results-section");

  // Chicago zipcodes - we'll expand this as we grow
  const chicagoZipcodes = [
    "60601","60602","60603","60604","60605","60606","60607","60608",
    "60609","60610","60611","60612","60613","60614","60615","60616",
    "60617","60618","60619","60620","60621","60622","60623","60624",
    "60625","60626","60628","60629","60630","60631","60632","60633",
    "60634","60636","60637","60638","60639","60640","60641","60642",
    "60643","60644","60645","60646","60647","60649","60651","60652",
    "60653","60654","60655","60656","60657","60659","60660","60661"
  ];

  // fetch representatives from our Netlify function
  async function fetchRepresentatives(zip) {
    const response = await fetch(`/.netlify/functions/representatives?zip=${zip}`);
    if (!response.ok) {
      throw new Error("Failed to fetch representatives");
    }
    return response.json();
  }

  // build and inject representative cards into the page
  function renderRepresentatives(data) {
    const results = data.results;

    if (!results || results.length === 0) {
      resultsSection.innerHTML = "<p>No representatives found for this zip code.</p>";
      return;
    }

    resultsSection.innerHTML = results
      .map((rep, index) => {
        const role = rep.current_role;
        const chamberLabel = role?.org_classification === "upper" ? "Senate"
            : role?.org_classification === "lower" ? "House"
            : role?.org_classification || "";
        const office = role
          ? `${role.title}${chamberLabel ? " - " + chamberLabel : ""}`
          : "Office unknown";
        const party = rep.party || "N/A";
        const email = rep.email || null;
        const links = rep.links && rep.links.length > 0 ? rep.links[0].url : null;

        return `
            <div class="rep-card" id="card-${index}">
                <div class="rep-info">
                    <h3 class="rep-name">${rep.name}</h3>
                    <p class="rep-office">${office}</p>
                    <p class="rep-party">${party}</p>
                    ${email ? `<p class="rep-email">${email}</p>`: ""}
                    ${links ? `<a href="${links}" target="_blank" class="rep-link">Official Website</a>` : ""}
                </div>
                <div class="rep-ai-section">
                    <button
                        class="ai-suammry-btn"
                        data-name="${rep.name}"
                        data-role="${role && role.title ? role.title : "Official"}"
                        data-party="${party}"
                        data-index="${index}"
                        onclick="getAISummary(this)"
                    >
                        🤖 Get AI Summary
                    </button>
                    <div class="ai-summary-text hidden" id="summary-${index}"></div>
                </div>
            </div>
        `;
      })
      .join("");

    resultsSection.classList.remove("hidden");
  }

  // main function that runs when someone clicks Look Up
  async function handleSearch() {
    const zip = zipcodeInput.value.trim();

    // hide any previous errors or results
    errorMsg.classList.add("hidden");
    resultsSection.classList.add("hidden");

    // validate: must be exactly 5 digits and a Chicago zipcode
    if (zip.length !== 5 || !chicagoZipcodes.includes(zip)) {
      errorMsg.classList.remove("hidden");
      return;
    }

    // show loading state
    resultsSection.classList.remove("hidden");
    resultsSection.innerHTML = "<p>Loading your representatives...</p>";

    try {
      const data = await fetchRepresentatives(zip);
      renderRepresentatives(data);
    } catch (err) {
      resultsSection.innerHTML = "<p>Something went wrong. Please try again.</p>";
      console.error(err);
    }
  }

  // listen for button click
  searchBtn.addEventListener("click", handleSearch);

  // also allow pressing Enter in the input field
  zipcodeInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  });

  //AI Summary function - called when user clicks the button on a rep card
  async function getAISummary(button) {
    const name = button.getAttribute("data-name");
    const role = button.getAttribute("data-role");
    const party = button.getAttribute("data-party");
    const index = button.getAttribute("data-index");

    const summaryBox = document.getElementById(`summary-${index}`);

    //show loading state immediately so user knows something is happening
    button.disabled = true;
    button.textContent = "⏳ Loading summary...";
    summaryBox.classList.remove("hidden");
    summaryBox.textContent = "";

    try {
        const repsonse = await fetch(
            `/.netlify/functions/ai-summary?name=${encodeURIComponent(name)}&role=${encodeURIComponent(role)}&party=${encodeURIComponent(party)}`
        );

        if (!repsonse.ok) {
            throw new Error("Function returned an error");
        }

        const data = await repsonse.json();

        //display the summary and update the button
        summaryBox.textContent = data.summary;
        button.textContent = "✅ AI Summary loaded";
    } catch (err) {
        summaryBox.textContent = "Sorry, couldnt load a summary right now. Please try again.";
        button.textContent = "🤖 Get AI Summary";
        button.disabled = false;
        console.error("AI summary error:", err);
    }
  }

  //expose to global scope so the oncick in the card HTML can reach it
  window.getAISummary = getAISummary;
});