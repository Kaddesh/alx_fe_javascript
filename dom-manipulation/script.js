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

// Function to populate categories dropdown dynamically
function populateCategories() {  
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

// Function to create the Add Quote Form dynamically
function createAddQuoteForm() {
    const formContainer = document.createElement("div");
    formContainer.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button onclick="addNewQuote()">Add Quote</button>
    `;
    document.body.appendChild(formContainer);
}

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

    populateCategories(); 
    displayQuotes();

    syncQuotes(newQuote);
}

// Function to sync with mock API
async function syncQuotes(newQuote) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(newQuote),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to sync with server");

        console.log("Quotes synced with server!"); 
    } catch (error) {
        console.error("Error syncing quote:", error);
    }
}

// Function to export quotes to JSON using Blob
function exportQuotesToJson() {
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" }); 
    const downloadUrl = URL.createObjectURL(blob);
    
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = downloadUrl;
    downloadAnchor.download = "quotes.json";
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
            populateCategories();
            displayQuotes();
        } catch (error) {
            alert("Error importing quotes. Please use a valid JSON file.");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() { // ✅ Fixed function name
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch quotes from server");

        const serverQuotes = await response.json();

        const formattedQuotes = serverQuotes.slice(0, 5).map(q => ({
            id: q.id,
            text: q.title,
            category: "General"
        }));

        mergeQuotes(formattedQuotes);
        saveQuotesToLocalStorage();
        displayQuotes();
        console.log("Synced with server!");
    } catch (error) {
        console.error("Error fetching server quotes:", error);
    }
}

// Function to merge local and server quotes
function mergeQuotes(serverQuotes) {
    let hasConflict = false;

    serverQuotes.forEach(serverQuote => {
        const existingQuote = quotes.find(q => q.id === serverQuote.id);

        if (!existingQuote) {
            quotes.push(serverQuote);
        } else if (existingQuote.text !== serverQuote.text) {
            hasConflict = true;
            existingQuote.text = serverQuote.text;
        }
    });

    if (hasConflict) {
        alert("Conflicts detected: Some quotes were updated from the server.");
    }
}

// Periodically fetch updates from the server
setInterval(fetchQuotesFromServer, 10000); // ✅ Fixed function call

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
    populateCategories(); 
    displayQuotes();
    createAddQuoteForm();
});
