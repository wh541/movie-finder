document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInput = document.getElementById("apiKeyInput");
    const saveKeyBtn = document.getElementById("saveKeyBtn");
    const movieInput = document.getElementById("movieInput");
    const genreSelect = document.getElementById("genreSelect");
    const searchBtn = document.getElementById("searchBtn");
    const results = document.getElementById("results");
    const watchLaterList = document.getElementById("watchLaterList");
  
    // Load stored key and watch list
    apiKeyInput.value = sessionStorage.getItem("omdbApiKey") || "";
    let watchLater = JSON.parse(localStorage.getItem("watchLater")) || [];
    renderWatchLater();
  
    saveKeyBtn.addEventListener("click", () => {
      const key = apiKeyInput.value.trim();
      if (key) {
        sessionStorage.setItem("omdbApiKey", key);
        alert("API key saved!");
      }
    });
  
    searchBtn.addEventListener("click", async () => {
      const query = movieInput.value.trim();
      const genre = genreSelect.value;
      const apiKey = sessionStorage.getItem("omdbApiKey");
      if (!query || !apiKey) return alert("Enter movie title and API key.");
      results.innerHTML = "🔍 Searching...";
  
      try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(query)}`);
        const movie = await res.json();
  
        if (movie.Response === "False") {
          results.innerHTML = "❌ Movie not found.";
          return;
        }
  
        // Filter by genre if selected
        if (genre !== "All" && !movie.Genre.includes(genre)) {
          results.innerHTML = "🎬 No match for selected genre.";
          return;
        }
  
        results.innerHTML = `
          <h2>${movie.Title} (${movie.Year})</h2>
          <p><strong>Genre:</strong> ${movie.Genre}</p>
          <p><strong>Director:</strong> ${movie.Director}</p>
          <p><strong>Plot:</strong> ${movie.Plot}</p>
          <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
          <img src="${movie.Poster !== "N/A" ? movie.Poster : ""}" alt="${movie.Title}" height="300">
          <div>
            <a href="https://www.imdb.com/title/${movie.imdbID}/" target="_blank">🔗 View on IMDb</a>
          </div>
          <button id="watchLaterBtn">📌 Add to Watch Later</button>
        `;
  
        document.getElementById("watchLaterBtn").onclick = () => {
          if (!watchLater.includes(movie.Title)) {
            watchLater.push(movie.Title);
            localStorage.setItem("watchLater", JSON.stringify(watchLater));
            renderWatchLater();
          }
        };
      } catch (err) {
        results.innerHTML = "⚠️ Error fetching movie data.";
        console.error(err);
      }
    });
  
    function renderWatchLater() {
      watchLaterList.innerHTML = "";
      watchLater.forEach(title => {
        const item = document.createElement("li");
        item.innerHTML = `<a href="https://www.imdb.com/find?q=${encodeURIComponent(title)}" target="_blank">${title}</a>`;
        watchLaterList.appendChild(item);
      });
    }
  });
  