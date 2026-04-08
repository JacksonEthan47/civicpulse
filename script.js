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

    //the main function that runs when someone clicks Look up
    function handleSearch() {
        const zip = zipcodeInput.value.trim();

        //Hde any previous error or results
        errorMsg.classList.add("hidden");
        resultsSection.classList.add("hidden");

        //validate: must be exactly 5 digits and a chicago zipcode
        if (zip.length !== 5 || !chicagoZipcodes.includes(zip)) {
            errorMsg.classList.remove("hidden");
            return;
        }

        //validate zipcode - show the results section
        resultsSection.classList.remove("hidden");
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