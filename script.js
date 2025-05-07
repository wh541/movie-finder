const searchBtn = document.getElementById("searchBtn");
const titleInput = document.getElementById("movieTitle");
const genreFilter = document.getElementById("genreFilter");
const movieInfoDiv = document.getElementById("movieInfo");
const watchLaterList = document.getElementById("watchLaterList");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
const backBtn = document.getElementById("backBtn");

// Load API Key from storage
let apiKey = sessionStorage.getItem("omdbKey") || "";

if (apiKey) {
  apiKeyInput.value = apiKey;
}

saveApiKeyBtn.addEventListener("click", () => {
  apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    sessionStorage.setItem("omdbKey", apiKey);
    alert("API Key saved!");
  }
});

searchBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const genre = genreFilter.value;
  if (!apiKey || !title) return;
  fetchMovie(title, genre);
});

function fetchMovie(title, selectedGenre) {
  movieInfoDiv.innerHTML = "";
  backBtn.style.display = "none";
  fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "False") {
        movieInfoDiv.innerHTML = `<p>Movie not found.</p>`;
        return;
      }

      // Filter by genre if selected
      if (selectedGenre !== "All" && !data.Genre.includes(selectedGenre)) {
        movieInfoDiv.innerHTML = `<p>No movie found in that genre.</p>`;
        return;
      }

      const info = `
        <h2>${data.Title} (${data.Year})</h2>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Director:</strong> ${data.Director}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
        <img src="${data.Poster}" alt="Poster" style="max-width:200px; margin:10px 0;"/>
        <br>
        <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank">🔗 View on IMDb</a><br><br>
        <button onclick="addToWatchLater('${data.Title}', '${data.imdbID}')">📌 Add to Watch Later</button>
      `;
      movieInfoDiv.innerHTML = info;
      backBtn.style.display = "block";
    });
}

// Autocomplete suggestions
titleInput.addEventListener("input", () => {
  const val = titleInput.value.trim();
  if (!val || !apiKey) return;

  fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(val)}&apikey=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.Search) {
        const datalist = document.getElementById("suggestions") || document.createElement("datalist");
        datalist.id = "suggestions";
        datalist.innerHTML = "";
        data.Search.forEach(movie => {
          const opt = document.createElement("option");
          opt.value = movie.Title;
          datalist.appendChild(opt);
        });
        titleInput.setAttribute("list", "suggestions");
        document.body.appendChild(datalist);
      }
    });
});

// Watch Later
function addToWatchLater(title, imdbID) {
  const watchList = JSON.parse(localStorage.getItem("watchLater")) || [];
  if (!watchList.find(movie => movie.imdbID === imdbID)) {
    watchList.push({ title, imdbID });
    localStorage.setItem("watchLater", JSON.stringify(watchList));
    showWatchLater();
  }
}

function showWatchLater() {
  const watchList = JSON.parse(localStorage.getItem("watchLater")) || [];
  watchLaterList.innerHTML = "";
  watchList.forEach(movie => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank">${movie.title}</a>`;
    watchLaterList.appendChild(li);
  });
}

showWatchLater();

backBtn.addEventListener("click", () => {
  movieInfoDiv.innerHTML = "";
  titleInput.value = "";
  genreFilter.value = "All";
  backBtn.style.display = "none";
});

