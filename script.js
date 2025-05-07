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
        <button onclick='addToWatchLater(${JSON.stringify({ title: data.Title, imdbID: data.imdbID })})'>📌 Add to Watch Later</button>
      `;
      backBtn.style.display = "block";
    }
  
    window.addToWatchLater = function(movie) {
      const saved = JSON.parse(localStorage.getItem("watchLater")) || [];
      if (!saved.find(m => m.imdbID === movie.imdbID)) {
        saved.push(movie);
        localStorage.setItem("watchLater", JSON.stringify(saved));
        renderWatchLaterList();
      }
    };
  
    function renderWatchLaterList() {
      const saved = JSON.parse(localStorage.getItem("watchLater")) || [];
      watchLaterList.innerHTML = "";
  
      saved.forEach(movie => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.marginBottom = "4px";
  
        const removeBtn = document.createElement("span");
        removeBtn.textContent = "❌";
        removeBtn.style.cursor = "pointer";
        removeBtn.style.color = "#00bcd4";
        removeBtn.style.marginRight = "8px";
        removeBtn.title = "Remove from Watch Later";
  
        removeBtn.addEventListener("click", () => {
          const updatedList = saved.filter(m => m.imdbID !== movie.imdbID);
          localStorage.setItem("watchLater", JSON.stringify(updatedList));
          renderWatchLaterList();
        });
  
        const link = document.createElement("a");
        link.href = `https://www.imdb.com/title/${movie.imdbID}`;
        link.target = "_blank";
        link.textContent = movie.title;
        link.style.color = "#00bcd4";
        link.style.textDecoration = "none";
  
        li.appendChild(removeBtn);
        li.appendChild(link);
        watchLaterList.appendChild(li);
      });
    }
  
    backBtn.addEventListener("click", () => {
      movieInfo.innerHTML = "";
      backBtn.style.display = "none";
    });
  
    renderWatchLaterList();
  });
  