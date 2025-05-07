let apiKey = sessionStorage.getItem("apiKey") || "";

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const movieInput = document.getElementById("movieInput");
  const genreSelect = document.getElementById("genreSelect");
  const movieDetails = document.getElementById("movieDetails");
  const suggestionsList = document.getElementById("suggestions");
  const saveKeyBtn = document.getElementById("saveKeyBtn");
  const apiKeyInput = document.getElementById("apiKeyInput");

  // Load stored API key if available
  if (apiKey) apiKeyInput.value = apiKey;

  saveKeyBtn.addEventListener("click", () => {
    apiKey = apiKeyInput.value.trim();
    sessionStorage.setItem("apiKey", apiKey);
    alert("API key saved!");
  });

  // Live search suggestions
  movieInput.addEventListener("input", async () => {
    const query = movieInput.value.trim();
    if (query.length < 2 || !apiKey) {
      suggestionsList.innerHTML = "";
      return;
    }

    const res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`);
    const data = await res.json();
    if (data.Search) {
      suggestionsList.innerHTML = "";
      data.Search.slice(0, 5).forEach((movie) => {
        const li = document.createElement("li");
        li.textContent = movie.Title;
        li.onclick = () => {
          movieInput.value = movie.Title;
          suggestionsList.innerHTML = "";
        };
        suggestionsList.appendChild(li);
      });
    }
  });

  // Movie search
  searchBtn.addEventListener("click", async () => {
    const title = movieInput.value.trim();
    const genreFilter = genreSelect.value;

    if (!title || !apiKey) {
      alert("Please enter a movie title and API key.");
      return;
    }

    const res = await fetch(`https://www.omdbapi.com/?t=${title}&apikey=${apiKey}`);
    const data = await res.json();

    if (data.Response === "False") {
      movieDetails.innerHTML = `<p>Movie not found. Try a different title.</p>`;
      return;
    }

    if (genreFilter !== "All" && !data.Genre.includes(genreFilter)) {
      movieDetails.innerHTML = `<p>No results for that genre. Try a different filter.</p>`;
      return;
    }

    movieDetails.innerHTML = `
      <div class="movie-card">
        <h2>${data.Title} (${data.Year})</h2>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Director:</strong> ${data.Director}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
        <img src="${data.Poster}" alt="${data.Title} poster" />
        <div class="movie-actions">
          <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank">🎬 IMDb Page</a>
          <button onclick='addToWatchLater(${JSON.stringify({
            title: data.Title,
            imdbID: data.imdbID
          })})'>📌 Add to Watch Later</button>
          <button onclick="scrollToTop()">🔙 Back to Top</button>
        </div>
      </div>
    `;
  });

  showWatchLater();
});

function addToWatchLater(movie) {
  if (!movie.title || !movie.imdbID) return;

  const watchList = JSON.parse(localStorage.getItem("watchLater")) || [];
  const alreadyExists = watchList.some(m => m.imdbID === movie.imdbID);

  if (!alreadyExists) {
    watchList.push(movie);
    localStorage.setItem("watchLater", JSON.stringify(watchList));
    showWatchLater();
  }
}

function showWatchLater() {
  const list = JSON.parse(localStorage.getItem("watchLater")) || [];
  const section = document.getElementById("watchLaterList");
  section.innerHTML = "";

  if (list.length === 0) {
    section.innerHTML = "<p>No movies added yet.</p>";
    return;
  }

  list.forEach(movie => {
    const item = document.createElement("p");
    item.innerHTML = `<a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank">${movie.title}</a>`;
    section.appendChild(item);
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
