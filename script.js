const apiKey = 'b9476797'; // Replace with your OMDb key
const movieInput = document.getElementById('movieInput');
const searchBtn = document.getElementById('searchBtn');
const suggestions = document.getElementById('suggestions');
const movieDetails = document.getElementById('movieDetails');
const watchLaterList = document.getElementById('watchLaterList');
const genreFilter = document.getElementById('genreFilter');

searchBtn.addEventListener('click', () => {
  const title = movieInput.value.trim();
  if (title) {
    fetchMovie(title);
  }
});

movieInput.addEventListener('input', () => {
  const query = movieInput.value.trim();
  if (query.length >= 3) {
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`)
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
  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${title}`)
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
    <button onclick="addToWatchLater('${movie.Title}')">➕ Watch Later</button>
  `;
}

function getRatingClass(rating) {
  const num = parseFloat(rating);
  if (num >= 8) return 'rating-high';
  if (num >= 5) return 'rating-medium';
  return 'rating-low';
}

function addToWatchLater(title) {
  let list = JSON.parse(localStorage.getItem('watchLater')) || [];
  if (!list.includes(title)) {
    list.push(title);
    localStorage.setItem('watchLater', JSON.stringify(list));
    renderWatchLater();
  }
}

function renderWatchLater() {
  let list = JSON.parse(localStorage.getItem('watchLater')) || [];
  watchLaterList.innerHTML = '';
  list.forEach(title => {
    const li = document.createElement('li');
    li.textContent = title;
    watchLaterList.appendChild(li);
  });
}

function updateGenreFilter(genreStr) {
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

// Re-render watchlist on load
renderWatchLater();
