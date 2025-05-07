document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInput = document.getElementById("apiKeyInput");
    const saveKeyBtn = document.getElementById("saveKeyBtn");
    const searchBtn = document.getElementById("searchBtn");
    const movieInput = document.getElementById("movieInput");
    const genreFilter = document.getElementById("genreFilter");
    const movieInfo = document.getElementById("movieInfo");
    const watchLaterList = document.getElementById("watchLaterList");
    const backBtn = document.getElementById("backBtn");
    const suggestions = document.getElementById("suggestions");
  
    let apiKey = sessionStorage.getItem("omdbApiKey") || "";
    if (apiKey) apiKeyInput.value = apiKey;
  
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
      if (!title || !apiKey) return;
      fetchMovie(title, genre);
    });
  
    movieInput.addEventListener("input", () => {
      const query = movieInput.value.trim();
      if (query.length < 2 || !apiKey) return;
      fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`)
        .then(res => res.json())
        .then(data => {
          suggestions.innerHTML = "";
          if (data.Search) {
            data.Search.forEach(movie => {
              const option = document.createElement("option");
              option.value = movie.Title;
              suggestions.appendChild(option);
            });
          }
        });
    });
  
    function fetchMovie(title, genre) {
      fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`)
        .then(res => res.json())
        .then(data => {
          if (data.Response === "False") {
            movieInfo.innerHTML = "<p>Movie not found.</p>";
            return;
          }
          if (genre && !data.Genre.includes(genre)) {
            movieInfo.innerHTML = "<p>No match for selected genre.</p>";
            return;
          }
          displayMovie(data);
        });
    }
  
    function displayMovie(data) {
      movieInfo.innerHTML = `
        <h3>${data.Title} (${data.Year})</h3>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Director:</strong> ${data.Director}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
        <img src="${data.Poster}" alt="Poster for ${data.Title}"><br>
        <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank">🔗 View on IMDb</a><br><br>
        <button onclick="addToWatchLater('${data.Title}', '${data.imdbID}')">📌 Add to Watch Later</button>
      `;
      backBtn.style.display = "block";
    }
  
    window.addToWatchLater = (title, imdbID) => {
      const saved = JSON.parse(localStorage.getItem("watchLater")) || [];
      if (!saved.find(m => m.imdbID === imdbID)) {
        saved.push({ title, imdbID });
        localStorage.setItem("watchLater", JSON.stringify(saved));
        renderWatchLater();
      }
    };
  
    function renderWatchLater() {
      const saved = JSON.parse(localStorage.getItem("watchLater")) || [];
      watchLaterList.innerHTML = saved.map(m => `
        <li><a href="https://www.imdb.com/title/${m.imdbID}" target="_blank">${m.title}</a></li>
      `).join("");
    }
  
    backBtn.addEventListener("click", () => {
      movieInfo.innerHTML = "";
      backBtn.style.display = "none";
    });
  
    renderWatchLater();
  });
  
