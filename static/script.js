const lettersInput = document.getElementById("letters");
const resultsDiv = document.getElementById("results");
const resultsSection = document.getElementById("results-section");
const loading = document.getElementById("loading");

async function solve() {
    const letters = lettersInput.value.trim();

    if (!letters) {
        resultsDiv.innerHTML = "<div class='result'>Please enter letters.</div>";
        resultsSection.style.display = "block";
        return;
    }

    loading.style.display = "block";
    resultsDiv.innerHTML = "";
    resultsSection.style.display = "none";

    try {
        const response = await fetch(
            `/solve?letters=${encodeURIComponent(letters)}`
        );

        if (!response.ok) {
            resultsDiv.innerHTML = "<div class='result'>Error contacting server.</div>";
            resultsSection.style.display = "block";
            loading.style.display = "none";
            return;
        }

        const data = await response.json();

        if (typeof gtag === "function") {
            gtag("event", "anagram_search", {
                query_length: letters.length,
                result_count: data.results ? data.results.length : 0
            });
        }

        loading.style.display = "none";

        if (!data.results || data.results.length === 0) {
            resultsDiv.innerHTML = "<div class='result'>No matches found.</div>";
        } else {
            resultsDiv.innerHTML = data.results
                .map(word => `<div class="result">${escapeHtml(word)}</div>`)
                .join("");
        }

        resultsSection.style.display = "block";

    } catch (err) {
        loading.style.display = "none";
        resultsDiv.innerHTML = "<div class='result'>Network error.</div>";
        resultsSection.style.display = "block";
    }
}

function escapeHtml(text) {
    return text.replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[char]));
}

lettersInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        solve();
    }
});