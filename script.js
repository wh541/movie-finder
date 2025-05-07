const searchBtn = document.getElementById("searchBtn");
const movieInput = document.getElementById("movieInput");
const movieDetails = document.getElementById("movieDetails");

searchBtn.addEventListener("click", () => {
  const title = movieInput.value.trim();
  const apiKey = "b9476797";

  if (!title) {
    movieDetails.innerHTML = "Please enter a movie title.";
    return;
  }

  fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "False") {
        movieDetails.innerHTML = `<p>Movie not found!</p>`;
        return;
      }

      movieDetails.innerHTML = `
        <h2>${data.Title} (${data.Year})</h2>
        <img src="${data.Poster}" alt="Poster for ${data.Title}" height="300">
        <p><strong>🎭 Genre:</strong> ${data.Genre}</p>
        <p><strong>📊 IMDB Rating:</strong> ${data.imdbRating}</p>
        <p><strong>📝 Plot:</strong> ${data.Plot}</p>
      `;
    })
    .catch(err => {
      movieDetails.innerHTML = "Something went wrong.";
      console.error(err);
    });
});
