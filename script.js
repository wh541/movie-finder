function saveApiKey() {
    const key = document.getElementById("apiKey").value;
    if (key) {
      sessionStorage.setItem("omdbApiKey", key);
      alert("API Key saved! You can now search for movies.");
    }
  }
  
  function searchMovie() {
    const title = document.getElementById("movieTitle").value;
    const apiKey = sessionStorage.getItem("omdbApiKey");
    const detailsDiv = document.getElementById("movieDetails");
    detailsDiv.innerHTML = "";
  
    if (!apiKey) {
      alert("Please enter your OMDb API key first.");
      return;
    }
  
    if (title.trim() === "") {
      alert("Please enter a movie title.");
      return;
    }
  
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.Response === "False") {
          detailsDiv.innerHTML = `<p>Movie not found. Try a different title.</p>`;
          return;
        }
  
        detailsDiv.innerHTML = `
          <h2>${data.Title} (${data.Year})</h2>
          <p><strong>Genre:</strong> ${data.Genre}</p>
          <p><strong>Director:</strong> ${data.Director}</p>
          <p><strong>Plot:</strong> ${data.Plot}</p>
          <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
          <img src="${data.Poster}" alt="${data.Title} Poster"/>
        `;
      })
      .catch(error => {
        detailsDiv.innerHTML = `<p>Error fetching movie data. Try again later.</p>`;
        console.error("Fetch error:", error);
      });
  }
  