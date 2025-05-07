let apiKey = sessionStorage.getItem("omdbApiKey");
if (!apiKey) {
  apiKey = prompt("Enter your OMDb API Key:");
  sessionStorage.setItem("omdbApiKey", apiKey);
}

const movieInput = document.getElementById('movieInput');
const searchBtn = document.getElementById('searchBtn');
const suggestions = document.getElementById('suggestions');
const movieDetails = document.getElementById('movieDetails');
const typeFilter = document.getElementById('typeFilter');
const watchLaterGrid = document.getElementById('watchLaterGrid');

searchBtn.addEventListener('click', () => {
  const title = movieInput.value.trim();
  if (title) fetchMovie(title);
});

movieInput.addEventListener('input', () => {
  const query = movieInput.value.trim();
  const type = typeFilter.value;
  if (query.length >= 3) {
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${query}${type ? `&type=${type}` : ''}`)
      .then(res => res.json())
      .then(data => {
        suggestions.innerHTML = '';
        if (data.Search) {
          data.Search.forEach(movie => {
            const li = document.createElement('li');
            li.textContent = movie.Title;
            li.onclick = () => {
              movieInput.value = movie.Title;
              suggestions.innerHTML = '';
              fetchMovie(movie.Title);
            };
            suggestions.appendChild(li);
          });
        }
      });
  } else {
    suggestions.innerHTML = '';
  }
});

function fetchMovie(title) {
  const type = typeFilter.value;
  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}${type ? `&type=${type}` : ''}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === 'True') {
        renderMovie(data);
        updateGenreFilter(data.Genre);
      } else {
        movieDetails.innerHTML = '<p>Movie not found.</p>';
      }
    });
}

function renderMovie(movie) {
  const ratingClass = getRatingClass(movie.imdbRating);

  movieDetails.innerHTML = `
    <h2>${movie.Title}</h2>
    <img src="${movie.Poster !== 'N/A' ? movie.Poster : ''}" alt="Poster" />
    <p><strong>Plot:</strong> ${movie.Plot}</p>
    <p><strong>Genre:</strong> ${movie.Genre}</p>
    <p><strong>Runtime:</strong> ${movie.Runtime}</p>
    <p><strong>Rating:</strong> <span class="${ratingClass}">${movie.imdbRating}</span></p>
    <button onclick="addToWatchLater('${movie.Title}', '${movie.Poster}', '${movie.imdbID}')">➕ Watch Later</button>
    <br/><br/>
    <a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank">
      🎥 View on IMDb
    </a>
  `;
}

function getRatingClass(rating) {
  const num = parseFloat(rating);
  if (num >= 8) return 'rating-high';
  if (num >= 5) return 'rating-medium';
  return 'rating-low';
}

function addToWatchLater(title, poster, imdbID) {
  let list = JSON.parse(localStorage.getItem('watchLater')) || [];
  if (!list.some(item => item.title === title)) {
    list.push({ title, poster, imdbID });
    localStorage.setItem('watchLater', JSON.stringify(list));
    renderWatchLater();
  }
}

function renderWatchLater() {
  let list = JSON.parse(localStorage.getItem('watchLater')) || [];
  watchLaterGrid.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'watch-card';
    card.innerHTML = `
      <img src="${item.poster !== 'N/A' ? item.poster : ''}" alt="${item.title}" />
      <p>${item.title}</p>
      <a href="https://www.imdb.com/title/${item.imdbID}" target="_blank">🔗 IMDb</a>
    `;
    watchLaterGrid.appendChild(card);
  });
}

function updateGenreFilter(genreStr) {
  const genreFilter = document.getElementById('genreFilter');
  const genres = genreStr.split(',').map(g => g.trim());
  genres.forEach(g => {
    if (![...genreFilter.options].some(opt => opt.value === g)) {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      genreFilter.appendChild(opt);
    }
  });
}

renderWatchLater();
