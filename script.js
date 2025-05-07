const searchBtn = document.getElementById("searchBtn");
const movieInput = document.getElementById("movieInput");
const movieInfo = document.getElementById("movieInfo");
const watchLaterList = document.getElementById("watchLaterList");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const genreFilter = document.getElementById("genreFilter");
const suggestions = document.getElementById("suggestions");

let apiKey = sessionStorage.getItem("omdbApiKey") || "";

if (apiKey) {
  apiKeyInput.value = apiKey;
}

saveKeyBtn.addEventListener("click", () => {
  apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    sessionStorage.setItem("omdbApiKey", apiKey);
    alert("API key saved!");
  }
});

searchBtn.addEventListener("click", () => {
  const title = movieInput.value.trim();
  const genre = genreFilter.value;
  if (!apiKey) return alert("Please enter and save your OMDb API key.");
  if (!title) return alert("Please enter a movie title.");

  fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "False") return alert("Movie not found.");
      if (genre && !data.Genre.toLowerCase().includes(genre.toLowerCase())) {
        movieInfo.innerHTML = `<p>No ${genre} genre match found for that movie.</p>`;
        return;
      }

      movieInfo.innerHTML = `
        <h2>${data.Title} (${data.Year})</h2>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Director:</strong> ${data.Director}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
        <img src="${data.Poster}" alt="${data.Title} poster"/>
        <p><a href="https://www.imdb.com/title/${data.imdbID}" target="_blank">View on IMDb</a></p>
        <button onclick="addToWatchLater('${data.Title}', '${data.imdbID}')">Add to Watch Later</button>
      `;
    })
    .catch(err => {
      console.error(err);
      alert("An error occurred while fetching movie data.");
    });
});

function addToWatchLater(title, imdbID) {
  const saved = JSON.parse(localStorage.getItem("watchLater")) || [];
  if (!saved.find(movie => movie.imdbID === imdbID)) {
    saved.push({ title, imdbID });
    localStorage.setItem("watchLater", JSON.stringify(saved));
    displayWatchLater();
  }
}

function displayWatchLater() {
  const saved = JSON.parse(localStorage.getItem("watchLater")) || [];
  watchLaterList.innerHTML = saved
    .map(movie => `<li><a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank">${movie.title}</a></li>`)
    .join("");
}

function autocompleteSuggestions(query) {
  if (!apiKey || query.length < 1) return;
  fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.Search) {
        suggestions.innerHTML = "";
        data.Search.slice(0, 5).forEach(movie => {
          const option = document.createElement("option");
          option.value = movie.Title;
          suggestions.appendChild(option);
        });
      }
    })
    .catch(err => console.error(err));
}

movieInput.addEventListener("input", () => {
  autocompleteSuggestions(movieInput.value.trim());
});

displayWatchLater();
