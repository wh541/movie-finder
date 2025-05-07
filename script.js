function getApiKey() {
    return sessionStorage.getItem('omdbApiKey');
  }
  
  function saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (key) {
      sessionStorage.setItem('omdbApiKey', key);
      alert('API key saved!');
    }
  }
  
  function searchMovie() {
    const title = document.getElementById('movieInput').value.trim();
    const genreFilter = document.getElementById('genreSelect').value;
    const apiKey = getApiKey();
  
    if (!apiKey) {
      alert('Please enter your OMDb API key first.');
      return;
    }
  
    if (!title) {
      alert('Please enter a movie title.');
      return;
    }
  
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}`;
  
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const infoDiv = document.getElementById('movieInfo');
        if (data.Response === "False") {
          infoDiv.innerHTML = `<p>❌ Movie not found.</p>`;
          return;
        }
  
        if (genreFilter && !data.Genre.toLowerCase().includes(genreFilter.toLowerCase())) {
          infoDiv.innerHTML = `<p>❌ Genre does not match filter.</p>`;
          return;
        }
  
        const imdbLink = `https://www.imdb.com/title/${data.imdbID}`;
        infoDiv.innerHTML = `
          <h3>${data.Title} (${data.Year})</h3>
          <p><strong>Genre:</strong> ${data.Genre}</p>
          <p><strong>Director:</strong> ${data.Director}</p>
          <p><strong>Plot:</strong> ${data.Plot}</p>
          <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
          <a href="${imdbLink}" target="_blank">🔗 View on IMDb</a><br><br>
          <img src="${data.Poster}" alt="${data.Title} Poster"/>
          <br><br><button onclick='addToWatchLater("${data.Title}", "${data.imdbID}")'>📌 Watch Later</button>
        `;
      })
      .catch(err => {
        console.error(err);
        alert('Error fetching movie data.');
      });
  }
  
  function addToWatchLater(title, imdbID) {
    const stored = JSON.parse(localStorage.getItem('watchLater') || '[]');
    if (!stored.find(m => m.imdbID === imdbID)) {
      stored.push({ title, imdbID });
      localStorage.setItem('watchLater', JSON.stringify(stored));
      displayWatchLater();
    }
  }
  
  function displayWatchLater() {
    const list = document.getElementById('watchLaterList');
    const stored = JSON.parse(localStorage.getItem('watchLater') || '[]');
    list.innerHTML = '';
  
    stored.forEach(movie => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank">${movie.title}</a>`;
      list.appendChild(li);
    });
  }
  
  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    displayWatchLater();
  });
  