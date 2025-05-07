let apiKey = sessionStorage.getItem("omdbApiKey") || "";

const movieInput = document.getElementById("movieInput");
const searchBtn = document.getElementById("searchBtn");
const movieDetails = document.getElementById("movieDetails");
const watchLaterList = document.getElementById("watchLaterList");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const genreSelect = document.getElementById("genreSelect");

// Load saved key if available
if (!apiKey) {
  apiKeyInput.value = "";
} else {
  apiKeyInput.value = apiKey;
}

// Save API key to sessionStorage
saveKeyBtn.addEventListener("click", () => {
  apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    sessionStorage.setItem("omdbApiKey", apiKey);
    alert("API Key saved!");
  }
});

// Autocomplete Suggestions
const suggestionsList = document.createElement("ul");
suggestionsList.id = "suggestions";
document.querySelector(".search-box").appendChild(suggestionsList);

movieInput.addEventListener("input", async () => {
  const query = movieInput.value.trim();
  suggestionsList.innerHTML = "";

  if (query.length < 2 || !apiKey) return;

  const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Search) {
    data.Search.slice(0, 5).forEach(movie => {
      const li = document.createElement("li");
      li.textContent = movie.Title;
      li.addEventListener("click", () => {
        movieInput.value = movie.Title;
        suggestionsList.innerHTML = "";
      });
      suggestionsList.appendChild(li);
    });
  }
});

// Fetch Movie Details
searchBtn.addEventListener("click", async () => {
  const title = movieInput.value.trim();
  const selectedGenre = genreSelect.value;

  if (!title || !apiKey) {
    alert("Enter a movie title and make sure your API key is saved.");
    return;
  }

  const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Response === "False") {
    movieDetails.innerHTML = `<p>❌ Movie not found.</p>`;
    return;
  }

  // If genre selected, filter by it
  if (selectedGenre !== "All" && (!data.Genre || !data.Genre.includes(selectedGenre))) {
    movieDetails.innerHTML = `<p>🎭 This movie is not in the ${selectedGenre} genre.</p>`;
    return;
  }

  const html = `
    <h3>${data.Title} (${data.Year})</h3>
    <p><strong>Genre:</strong> ${data.Genre}</p>
    <p><strong>Director:</strong> ${data.Director}</p>
    <p><strong>Plot:</strong> ${data.Plot}</p>
    <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
    <img src="${data.Poster !== "N/A" ? data.Poster : ""}" alt="${data.Title} Poster" />
    <br/><br/>
    <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank">🎥 View on IMDb</a>
    <br/><br/>
    <button onclick="addToWatchLater('${data.Title}', '${data.imdbID}')">➕ Add to Watch Later</button>
  `;

  movieDetails.innerHTML = html;
});

// Add to Watch Later
function addToWatchLater(title, imdbID) {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = `https://www.imdb.com/title/${imdbID}`;
  link.target = "_blank";
  link.textContent = title;
  li.appendChild(link);
  watchLaterList.appendChild(li);
}
