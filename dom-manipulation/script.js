const API_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API for simulation

// Load quotes from local storage or initialize with default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { id: 2, text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { id: 3, text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" }
];

// Load last selected filter from local storage
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// Function to save quotes to local storage
function saveQuotesToLocalStorage() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to populate category dropdown dynamically
function populateCategoryDropdown() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];

    uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = selectedCategory;
}

// Function to filter quotes based on selected category
function filterQuotesByCategory() {
    selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem("selectedCategory", selectedCategory);
    displayQuotes();
}

// Function to display quotes
function displayQuotes() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = "";

    const filteredQuotes = selectedCategory === "all"
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = "<p>No quotes available in this category.</p>";
        return;
    }

    filteredQuotes.forEach(({ text, category }) => {
        const quoteElement = document.createElement("div");
        quoteElement.innerHTML = `
            <blockquote>"${text}"</blockquote>
            <p><strong>Category:</strong> ${category}</p>
        `;
        quoteDisplay.appendChild(quoteElement);
    });
}

// Function to show a new random quote
function showRandomQuote() {
    const filteredQuotes = "all"
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        alert("No quotes available in this category.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];

    document.getElementById("quoteDisplay").innerHTML = `
        <blockquote>"${randomQuote.text}"</blockquote>
        <p><strong>Category:</strong> ${randomQuote.category}</p>
    `;
}

// Attach event listener to "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Function to add a new quote
function addNewQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value.trim();
    const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (!newQuoteText || !newQuoteCategory) {
        alert("Please enter both a quote and a category.");
        return;
    }

    const newQuote = { id: Date.now(), text: newQuoteText, category: newQuoteCategory };

    quotes.push(newQuote);
    saveQuotesToLocalStorage();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    populateCategoryDropdown();
    displayQuotes();
}

// Function to export quotes to JSON
function exportQuotesToJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quotes));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "quotes.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

// Function to import quotes from JSON file
function importQuotesFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");

            quotes.push(...importedQuotes);
            saveQuotesToLocalStorage();
            alert("Quotes imported successfully!");
            populateCategoryDropdown();
            displayQuotes();
        } catch (error) {
            alert("Error importing quotes. Please use a valid JSON file.");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
    populateCategoryDropdown();
    displayQuotes();
});
