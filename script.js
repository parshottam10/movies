const API_KEY = 'd682ecdf3fc12e08c3c77fd10094dec4';

async function fetchMoviesByQuery(query) {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.results) {
        return searchData.results.filter(movie => movie.poster_path && movie.vote_average > 0);
    } else {
        console.error('No movies found for query:', query);
        return [];
    }
}

async function fetchMoviesByGenre(genreId) {
    const genreUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;
    const response = await fetch(genreUrl);
    const data = await response.json();
    return data.results.filter(movie => movie.poster_path && movie.vote_average > 0);
}

function displayMovies(movies, element) {
    element.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = `
            <div class="col-md-3 movie-card">
                <div class="card">
                    <a href="movie-details.html?id=${movie.id}" class="card-link">
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text">Rating: ${movie.vote_average}</p>
                            <p class="card-text">Release Date: ${movie.release_date}</p>
                        </div>
                    </a>
                </div>
            </div>
        `;
        element.innerHTML += movieCard;
    });
}

async function loadTopRatedMovies() {
    const topRatedUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`;
    const response = await fetch(topRatedUrl);
    const data = await response.json();
    displayMovies(data.results, document.getElementById('topRatedMovies'));
}

document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        const searchResults = await fetchMoviesByQuery(query);
        if (searchResults.length > 0) {
            displayMovies(searchResults, document.getElementById('topRatedMovies'));
        } else {
            document.getElementById('topRatedMovies').innerHTML = '<p class="text-white">No movies found. Please try another search.</p>';
        }
    }
});

document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', async (event) => {
        const category = event.target.getAttribute('data-category');
        let genreId;

        switch (category) {
            case 'Comedy':
                genreId = 35;
                break;
            case 'Horror':
                genreId = 27;
                break;
            case 'Romance':
                genreId = 10749;
                break;
            case 'Action':
                genreId = 28;
                break;
            case 'Suspense':
                genreId = 53;
                break;
            case 'Thriller':
                genreId = 53;
                break;
            case 'Adventure':
                genreId = 12;
                break;
            default:
                return;
        }

        const movies = await fetchMoviesByGenre(genreId);
        displayMovies(movies, document.getElementById('topRatedMovies'));
    });
});

document.addEventListener('DOMContentLoaded', loadTopRatedMovies);
