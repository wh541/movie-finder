function saveApiKey() {
    const key = document.getElementById("apiKey").value;
    sessionStorage.setItem("omdbApiKey", key);
    alert("API key saved!");
  }
  
  function getApiKey() {
    return sessionStorage.getItem("omdbApiKey");
  }
  
  function searchMovie() {
    const query = document.getElementById("movieInput").value;
    const genreFilter = document.getElementById("genreFilter").value;
    const apiKey = getApiKey();
  
    if (!apiKey) {
      alert("Please enter and save your OMDb API key.");
      return;
    }
  
    if (!query) return;
  
    fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.Response === "False") {
          document.getElementById("movieDetails").innerHTML = `<p>Movie not found.</p>`;
          return;
        }
  
        // Filter by genre
        if (genreFilter && !data.Genre.toLowerCase().includes(genreFilter.toLowerCase())) {
          document.getElementById("movieDetails").innerHTML = `<p>No results for selected genre.</p>`;
          return;
        }
  
        const html = `
          <h2>${data.Title} (${data.Year})</h2>
          <p><strong>Genre:</strong> ${data.Genre}</p>
          <p><strong>Director:</strong> ${data.Director}</p>
          <p><strong>Plot:</strong> ${data.Plot}</p>
          <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
          <img src="${data.Poster !== "N/A" ? data.Poster : ""}" alt="${data.Title} Poster" />
          <br/>
          <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank">🎥 View on IMDb</a>
          <br/><br/>
          <button onclick='addToWatchLater("${data.Title}", "${data.imdbID}")'>➕ Add to Watch Later</button>
        `;
        document.getElementById("movieDetails").innerHTML = html;
      });
  }
  
  function addToWatchLater(title, imdbID) {
    const watchList = JSON.parse(localStorage.getItem("watchLaterList") || "[]");
    if (!watchList.find(m => m.imdbID === imdbID)) {
      watchList.push({ title, imdbID });
      localStorage.setItem("watchLaterList", JSON.stringify(watchList));
      renderWatchLater();
    }
  }
  
  function renderWatchLater() {
    const list = JSON.parse(localStorage.getItem("watchLaterList") || "[]");
    const ul = document.getElementById("watchLaterList");
    ul.innerHTML = "";
    list.forEach(movie => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank">${movie.title}</a>`;
      ul.appendChild(li);
    });
  }
  
  // Initial render
  renderWatchLater();
  