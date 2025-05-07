document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInput = document.getElementById("apiKeyInput");
    const saveKeyBtn = document.getElementById("saveKeyBtn");
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const genreFilter = document.getElementById("genreFilter");
    const movieDetails = document.getElementById("movieDetails");
    const watchLaterList = document.getElementById("watchLaterList");
    const backBtn = document.getElementById("backBtn");
    const backBtnContainer = document.getElementById("backBtnContainer");
    const suggestions = document.getElementById("suggestions");
  
    let apiKey = sessionStorage.getItem("omdbApiKey") || "";
    if (apiKey) apiKeyInput.value = apiKey;
  
    saveKeyBtn.addEventListener("click", () => {
      apiKey = apiKeyInput.value.trim();
      if (apiKey) sessionStorage.setItem("omdbApiKey", apiKey);
      alert("API key saved!");
    });
  
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      const genre = genreFilter.value.trim();
      if (query && apiKey) searchMovie(query, genre);
    });
  
    searchInput.addEventListener("input", () => {
      const text = searchInput.value.trim();
      if (text.length < 2 || !apiKey) return;
      fetch(`https://www.omdbapi.com/?s=${text}&apikey=${apiKey}`)
        .then(res => res.json())
        .then(data => {
          if (data.Search) {
            suggestions.innerHTML = "";
            data.Search.forEach(movie => {
              const opt = document.createElement("option");
              opt.value = movie.Title;
              suggestions.appendChild(opt);
            });
          }
        });
    });
  
    function searchMovie(title, genre) {
      movieDetails.innerHTML = "";
      fetch(`https://www.omdbapi.com/?t=${title}&apikey=${apiKey}`)
        .then(res => res.json())
        .then(data => {
          if (data.Response === "True") {
            if (!genre || data.Genre.includes(genre)) {
              displayMovie(data);
            } else {
              movieDetails.innerHTML = "<p>No match for selected genre.</p>";
            }
          } else {
            movieDetails.innerHTML = "<p>Movie not found.</p>";
          }
        });
    }
  
    function displayMovie(data) {
      movieDetails.innerHTML = `
        <h3>${data.Title} (${data.Year})</h3>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Director:</strong> ${data.Director}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
        <img src="${data.Poster !== "N/A" ? data.Poster : ""}" alt="Poster"/>
        <br><a href="https://www.imdb.com/title/${data.imdbID}/" target="_blank">🔗 View on IMDb</a>
        <br><button onclick="addToWatchLater('${data.Title}', '${data.imdbID}')">➕ Watch Later</button>
      `;
      backBtnContainer.style.display = "block";
    }
  
    window.addToWatchLater = (title, imdbID) => {
      const saved = JSON.parse(localStorage.getItem("watchLater") || "[]");
      if (!saved.find(m => m.imdbID === imdbID)) {
        saved.push({ title, imdbID });
        localStorage.setItem("watchLater", JSON.stringify(saved));
        loadWatchLater();
      }
    };
  
    function loadWatchLater() {
      watchLaterList.innerHTML = "";
      const saved = JSON.parse(localStorage.getItem("watchLater") || "[]");
      if (saved.length === 0) {
        watchLaterList.innerHTML = "<p>No saved movies.</p>";
        return;
      }
      saved.forEach(m => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="https://www.imdb.com/title/${m.imdbID}/" target="_blank">${m.title}</a>`;
        watchLaterList.appendChild(li);
      });
    }
  
    backBtn.addEventListener("click", () => {
      movieDetails.innerHTML = "";
      backBtnContainer.style.display = "none";
    });
  
    loadWatchLater();
  });
  
