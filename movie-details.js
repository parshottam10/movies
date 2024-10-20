const API_KEY = 'd682ecdf3fc12e08c3c77fd10094dec4';

async function fetchMovieDetails(movieId) {
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=en-US`;
    const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}&language=en-US`;

    try {
        const [detailsResponse, creditsResponse] = await Promise.all([
            fetch(detailsUrl),
            fetch(creditsUrl)
        ]);

        if (!detailsResponse.ok || !creditsResponse.ok) {
            throw new Error('Failed to fetch movie details or credits.');
        }

        const movieDetails = await detailsResponse.json();
        const credits = await creditsResponse.json();

        return { movieDetails, credits };
    } catch (error) {
        console.error('Error fetching movie details or credits:', error);
        return null;
    }
}

function displayCastAndCrew(credits) {
    const director = credits.crew.find(member => member.job === 'Director');
    const cast = credits.cast.slice(0, 6);
    let castHTML = '<h3>Cast</h3><div class="row">';
    cast.forEach(member => {
        const profilePath = member.profile_path
            ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
            : 'https://via.placeholder.com/185x278?text=No+Image';

        castHTML += `
            <div class="col-md-2 text-center">
                <img src="${profilePath}" class="img-fluid rounded mb-2" alt="${member.name}">
                <p>${member.name}</p>
            </div>
        `;
    });
    castHTML += '</div>';

    const directorHTML = director
        ? `<h3>Director</h3><p>${director.name}</p>`
        : '<p>No director information available.</p>';

    return { castHTML, directorHTML };
}

async function displayMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const data = await fetchMovieDetails(movieId);

    if (data) {
        const { movieDetails, credits } = data;
        const { castHTML, directorHTML } = displayCastAndCrew(credits);

        const movieHTML = `
            <div class="col-md-4">
                <img src="https://image.tmdb.org/t/p/w500${movieDetails.poster_path}" 
                    class="img-fluid rounded" alt="${movieDetails.title}">
            </div>
            <div class="col-md-8">
                <h1>${movieDetails.title}</h1>
                <p><strong>Rating:</strong> ${movieDetails.vote_average}</p>
                <p><strong>Release Date:</strong> ${movieDetails.release_date}</p>
                <p><strong>Overview:</strong> ${movieDetails.overview}</p>
                ${directorHTML}
                ${castHTML}
            </div>
        `;

        document.getElementById('movieDetails').innerHTML = movieHTML;
    } else {
        document.getElementById('movieDetails').innerHTML = '<p class="text-white">Unable to load movie details. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', displayMovieDetails);
