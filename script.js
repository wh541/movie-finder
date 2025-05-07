document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInput = document.getElementById("apiKeyInput");
    const saveKeyBtn = document.getElementById("saveKeyBtn");
    const searchBtn = document.getElementById("searchBtn");
    const movieInput = document.getElementById("movieInput");
    const genreSelect = document.getElementById("genreSelect");
    const resultsContainer = document.getElementById("results");
    const watchLaterList = document.getElementById("watchLaterList");
  
    // Save API key
    saveKeyBtn.addEventListener("click", () => {
      const key = apiKeyInput.value.trim();
      if (key) {
        sessionStorage.setItem("omdbKey", key);
        alert("API Key saved!");
      }
    });
  
    // Fetch and display movie
    searchBtn.addEventListener("click", async () => {
      const title = movieInput.value.trim();
      const genre = genreSelect.value;
      const apiKey = sessionStorage.getItem("omdbKey");
  
      if (!title) {
        alert("Please enter a movie title.");
        return;
      }
      if (!apiKey) {
        alert("Please enter and save your OMDb API key.");
        return;
      }
  
      try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}`);
        const data = await response.json();
  
        if (data.Response === "False") {
          resultsContainer.innerHTML = `<p>${data.Error}</p>`;
          return;
        }
  
        if (genre !== "All" && (!data.Genre || !data.Genre.includes(genre))) {
          resultsContainer.innerHTML = `<p>No ${genre} movie found with that title.</p>`;
          return;
        }
  
        resultsContainer.innerHTML = `
          <div class="movie-card">
            <h2>${data.Title} (${data.Year})</h2>
            <p><strong>Genre:</strong> ${data.Genre}</p>
            <p><strong>Director:</strong> ${data.Director}</p>
            <p><strong>Plot:</strong> ${data.Plot}</p>
            <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
            <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank">View on IMDb</a><br>
            <img src="${data.Poster !== "N/A" ? data.Poster : ""}" alt="${data.Title} Poster">
            <br>
            <button onclick='addToWatchLater(${JSON.stringify(data)})'>➕ Watch Later</button>
          </div>
        `;
      } catch (error) {
        console.error("Fetch error:", error);
        resultsContainer.innerHTML = `<p>Failed to fetch movie. Please try again.</p>`;
      }
    });
  
    // Add movie to Watch Later
    window.addToWatchLater = function (movie) {
      const watchLater = JSON.parse(localStorage.getItem("watchLater")) || [];
      if (!watchLater.find((m) => m.imdbID === movie.imdbID)) {
        watchLater.push({ Title: movie.Title, imdbID: movie.imdbID });
        localStorage.setItem("watchLater", JSON.stringify(watchLater));
        displayWatchLaterList();
      } else {
        alert("Already added to Watch Later.");
      }
    };
  
    // Display Watch Later list
    function displayWatchLaterList() {
      const watchLater = JSON.parse(localStorage.getItem("watchLater")) || [];
      watchLaterList.innerHTML = "";
      watchLater.forEach((movie) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = `https://www.imdb.com/title/${movie.imdbID}`;
        link.target = "_blank";
        link.textContent = movie.Title;
        li.appendChild(link);
        watchLaterList.appendChild(li);
      });
    }
  
    // Show saved list on page load
    displayWatchLaterList();
  });
  