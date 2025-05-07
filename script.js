let apiKey = sessionStorage.getItem("apiKey") || "";

document.getElementById("saveKeyBtn").addEventListener("click", () => {
  apiKey = document.getElementById("apiKeyInput").value.trim();
  sessionStorage.setItem("apiKey", apiKey);
  alert("API key saved!");
});

const movieInput = document.getElementById("movieInput");
const genreSelect = document.getElementById("genreSelect");
const searchBtn = document.getElementById("searchBtn");
const movieInfoDiv = document.getElementById("movieInfo");
const watchLaterDiv = document.getElementById("watchLaterList");

searchBtn.addEventListener("click", () => {
  const title = movieInput.value.trim();
  const genre = genreSelect.value;

  if (!title || !apiKey) return alert("Please enter a movie and API key.");

  fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "False") return alert("Movie not found.");
      displayMovie(data, genre);
    });
});

function displayMovie(data, genreFilter) {
  const genreMatches = genreFilter === "All Genres" || data.Genre.includes(genreFilter);
  if (!genreMatches) return alert("This movie doesn't match the selected genre.");

  movieInfoDiv.innerHTML = `
    <div class="card">
      <h2>${data.Title} (${data.Year})</h2>
      <p><strong>Genre:</strong> ${data.Genre}</p>
      <p><strong>Director:</strong> ${data.Director}</p>
      <p><strong>Plot:</strong> ${data.Plot}</p>
      <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
      <img src="${data.Poster}" alt="Poster for ${data.Title}" />
      <br />
      <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank">IMDb Page</a>
      <br /><br />
      <button onclick="addToWatchLater('${data.imdbID}', '${data.Title}')">📌 Add to Watch Later</button>
    </div>
  `;
}

function addToWatchLater(imdbID, title) {
  const saved = JSON.parse(localStorage.getItem("watchLater") || "[]");
  if (!saved.some(m => m.id === imdbID)) {
    saved.push({ id: imdbID, title });
    localStorage.setItem("watchLater", JSON.stringify(saved));
    renderWatchLater();
  }
}

function renderWatchLater() {
  const saved = JSON.parse(localStorage.getItem("watchLater") || "[]");
  watchLaterDiv.innerHTML = saved.length
    ? saved.map(m => `<a href="https://www.imdb.com/title/${m.id}" target="_blank">${m.title}</a>`).join("<br>")
    : "<em>No movies saved.</em>";
}

window.addEventListener("DOMContentLoaded", renderWatchLater);
