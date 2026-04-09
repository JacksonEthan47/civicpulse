// grab references to our page elements
document.addEventListener("DOMContentLoaded", function () {
    const zipcodeInput = document.getElementById("zipcode-input");
    const searchBtn = document.getElementById("search-btn");
    const errorMsg = document.getElementById("error-msg");
    const resultsSection = document.getElementById("results-section");

    //Chicago zipcodes - we'll expand this as we grow
    const chicagoZipcodes = [
        "60601","60602","60603","60604","60605","60606","60607","60608",
    "60609","60610","60611","60612","60613","60614","60615","60616",
    "60617","60618","60619","60620","60621","60622","60623","60624",
    "60625","60626","60628","60629","60630","60631","60632","60633",
    "60634","60636","60637","60638","60639","60640","60641","60642",
    "60643","60644","60645","60646","60647","60649","60651","60652",
    "60653","60654","60655","60656","60657","60659","60660","60661"
    ];

    //fetch real representative data from our Netlify function
    async function fetchRepresentatives(zip) {
        const response = await fetch(`/.netlify/functions/representatives?zip=${zip}`);
        if (!response.ok) {
            throw new Error("Failed to fetch representatives");
        }
        return response.json();
    }

    //build and inject the representative cards into the
    function renderRepresentatives(data) {
        const container = document.getElementById("results-section");

        const officials = data.officials.map((official, index) => {
            const office = data.officesfind(
                (o) => officials.officialIndices && officials.officialIndices.includes(index)
            );
            return {
                name: official.name,
                office: office ? office.name : "Unknown Office",
                party: official.party || "N/A",
                photo: official.photoUrl || null,
                website: official.url ? official.urls[0] : null,
                phone: official.phones ? official.phones[0] : null,
            };
        });

        //build the HTML cards
        container.innerHTML = officials
            .map(
                (rep) => `
                <div class="rep-card">
                    ${rep.photo ? `<img src="${rep.photo}" alt="${rep.name}" class="rep-photo"/>` : ""}
                    <div class="rep-info">
                        <h3 class="rep-name">${rep.name}</h3>
                        <p class="rep-office">${rep.office}<p/>
                        <p class="rep-party">${rep.party}</p>
                        ${rep.phone ? `<p class="rep-phone">${rep.phone}<p/>` : ""}
                        ${rep.website ? `<a href="${rep.website}" target="_blank" class="rep-link">Official Website</a>` : ""}
                    </div>
                </div>
            `
            )
            .join("");
        container.classList.remove("hidden");
    }

    //main function that runs when someone clicks Look Up
    async function handleSearch() {
        const zip = zipcodeInput.value.trim();

        //hide any previous error or results
        errorMsg.classList.add("hidden");
        resultsSection.classList.add("hidden");

        //validate: must be exactly 5 digits and a chicago zipcode
        if (zip.length !== 5 || !chicagoZipcodes.includes(zip)) {
            errorMsg.classList.remove("hidden");
            return;
        }

        //show a loading state while we fetch
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

    //listen for button click
    searchBtn.addEventListener("click", handleSearch);

    //also allow pressing enter in the input field
    zipcodeInput.addEventListener("keydown", function (event){
    if (event.key === "Enter") {
            handleSearch();
        }
    });
});