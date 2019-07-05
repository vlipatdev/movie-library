import '../sass/main.scss';
import axios from 'axios';
import { key } from './config';

const elements = {
    searchInput: document.querySelector('.search__input'),
    searchIcon: document.querySelector('.search__icon'),
    favoritesTab: document.querySelector('.nav__text--favorites'),
    trendingTab: document.querySelector('.nav__text--trending'),
    genresTab: document.querySelector('.nav__text--genres'),
    genreIcon: document.querySelector('.nav__icon--chevron'),
    genreUl: document.querySelector('.nav__list--genre'),
    genreList: document.querySelectorAll('.nav__list-item'),
    // about: document.querySelector('.nav__text--about'),
    // tmdb: document.querySelector('.tmdb'),

    heading: document.querySelector('.heading'),
    trendingSelect: document.querySelector('.select__trend'),
    discoverLabel: document.querySelector('.label__discover'),
    discoverSelect: document.querySelector('.select__discover'),
    fillerAnchor: document.querySelector('.movie__filler-anchor'),
    spinner: document.querySelector('.spinner'),
};

// track type of query
let isSearch;
let isTrending;
let isDiscover;
let isFavorites;

// track url values
let searchValue;
let trendValue;
let discoverValue;
let genreId;
let curPage;
let url;

// track previously selected element
let prevSelected;

let movieList;
// clear movies function
const clearMovies = () => {
    movieList = document.querySelectorAll('.movie');
    movieList.forEach((movie) => {
        movie.remove();
    });

    elements.spinner.style.display = 'block';
    elements.trendingSelect.style.display = 'none';
    elements.discoverLabel.style.display = 'none';

    isSearch = false;
    isDiscover = false;
    isTrending = false;
    isFavorites = false;

    curPage = 1;
};

let Y; // scroll y
const movieContainer = document.querySelector('.movie__container');

// get movies function
const getMovies = (url) => {
    axios.get(url)
        .then((data) => {
            // stop showing spinner if no more results
            if (data.data.page >= data.data.total_pages) {
                elements.spinner.style.display = 'none';
            }

            // insert markup
            const { results } = data.data;
            results.forEach((movie) => {
                elements.fillerAnchor.insertAdjacentHTML('beforebegin', `
                    <article data-movieid="${movie.id}" class="movie">
                        <img class="movie__poster" src="https://image.tmdb.org/t/p/w154/${movie.poster_path}" onerror="this.onerror=null;this.src='img/poster-background.png';">
                        <div class="movie__title-container">
                            <p class="movie__title">${movie.title} (${movie.release_date.slice(0, 4)})</p>
                        </div>
                    </article>
                `);
            });

            // add click listener to each movie
            movieList = document.querySelectorAll('.movie');
            movieList.forEach((movieEl) => {
                movieEl.addEventListener('click', (e) => {
                    Y = window.scrollY; // track scroll position
                    e.stopImmediatePropagation();
                    movieContainer.style.display = 'none';
                    elements.heading.style.visibility = 'hidden';
                    elements.discoverLabel.style.visibility = 'hidden';
                    elements.trendingSelect.style.visibility = 'hidden';
                    elements.spinner.style.display = 'none';
                    movieInfo.style.display = 'flex';
                    getMovieDetails(`https://api.themoviedb.org/3/movie/${movieEl.dataset.movieid}?api_key=${key}&append_to_response=videos`);
                    return Y;
                });
            });
        })
        .catch(error => alert(error));
};

// load new page when user scrolls to bottom
const loadNextPage = () => {
    curPage += 1;
    if (isSearch) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${searchValue}&vote_count.gte=1000&page=${curPage}`;
    } else if (isDiscover) {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_genres=${genreId}&sort_by=${discoverValue}&vote_count.gte=1000&page=${curPage}`;
    } else if (isTrending) {
        url = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
    } else if (isFavorites) {
        return;
    }
    getMovies(url);
};

// onload
const init = () => {
    prevSelected = elements.trendingTab;
    prevSelected.classList.add('selected');

    isTrending = true;
    trendValue = 'day';
    discoverValue = 'popularity.desc';
    curPage = 1;
    url = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
    getMovies(url);

    // set intersection observer
    const observer = new IntersectionObserver(loadNextPage);
    const target = elements.spinner;
    observer.observe(target);
};

init();

// search function
const search = (e, isInput) => {
    clearDetails();
    clearMovies();
    prevSelected.classList.remove('selected');

    isSearch = true;
    if (isInput) {
        elements.heading.textContent = `Search results for "${e.target.value}"`;
        searchValue = e.target.value;
    } else {
        elements.heading.textContent = `Search results for "${e.target.previousElementSibling.value}"`;
        searchValue = e.target.previousElementSibling.value;
    }
    url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${searchValue}&vote_count.gte=1000&page=${curPage}`;
    getMovies(url);
};

let isInput;
// search tab keydown listener
elements.searchInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        isInput = true;
        search(e, isInput);
    }
});

// search icon click listener
elements.searchIcon.addEventListener('click', (e) => {
    isInput = false;
    search(e, isInput);
});

// trending tab click listener
elements.trendingTab.addEventListener('click', () => {
    clearDetails();
    clearMovies();
    elements.heading.textContent = 'Trending Movies';
    elements.trendingSelect.style.display = 'block';
    prevSelected.classList.remove('selected');
    elements.trendingTab.classList.add('selected');

    isTrending = true;
    elements.trendingSelect.value = 'day';
    trendValue = 'day';
    url = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
    getMovies(url);

    prevSelected = elements.trendingTab;
    return trendValue;
});

// genre tab click listener
elements.genresTab.addEventListener('click', () => {
    elements.genreUl.classList.toggle('expand');
    elements.genreIcon.classList.toggle('rotate');
});

// genres click listener
elements.genreList.forEach((genre) => {
    genre.addEventListener('click', (e) => {
        clearDetails();
        clearMovies();
        elements.heading.textContent = `${e.target.textContent} Movies`;
        elements.discoverLabel.style.display = 'block';
        prevSelected.classList.remove('selected');
        e.target.classList.add('selected');

        isDiscover = true;
        elements.discoverSelect.value = 'popularity.desc';
        discoverValue = 'popularity.desc';
        genreId = e.target.dataset.id;
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_genres=${genreId}&sort_by=${discoverValue}&vote_count.gte=1000&page=${curPage}`;
        getMovies(url);

        prevSelected = e.target;
        return prevSelected;
    });
});

// update trending on select change
elements.trendingSelect.addEventListener('change', (e) => {
    clearMovies();
    elements.trendingSelect.style.display = 'block';

    isTrending = true;
    trendValue = e.target.value;
    url = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
    getMovies(url);

    return trendValue;
});

// update discover on select change;
elements.discoverSelect.addEventListener('change', (e) => {
    clearMovies();
    elements.discoverLabel.style.display = 'block';

    isDiscover = true;
    discoverValue = e.target.value;
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_genres=${genreId}&sort_by=${discoverValue}&vote_count.gte=1000&page=${curPage}`;
    getMovies(url);

    return discoverValue;
});

/* ======================================== MOVIE DETAILS =============================================== */

const movieInfo = document.querySelector('.movie-info');
let favoritesArr;
if (localStorage.favorites) {
    favoritesArr = localStorage.favorites.split(', ');
} else {
    favoritesArr = [];
}

const favoriteCount = document.querySelector('.nav__text--favorites-count');
favoriteCount.textContent = (favoritesArr.length);
favoriteCount.style.display = 'inline';
if (favoritesArr.length === 0) {
    favoriteCount.style.display = 'none';
}

// get movie details function
const getMovieDetails = (url) => {
    axios.get(url)
        .then((data) => {
            const movieData = data.data;
            movieInfo.style.backgroundImage = `linear-gradient(to top, rgba(0, 0, 0, .9), rgba(0, 0, 0, .8)), url('https://image.tmdb.org/t/p/w780/${movieData.backdrop_path}')`;

            // insert markup
            movieInfo.insertAdjacentHTML('beforeend', `
            <img class="movie-info__icon--close" src="img/x.svg">
            <div class="movie-info__details">
                <div class="movie-info__poster-container">
                    <img class="movie-info__poster" src="https://image.tmdb.org/t/p/w200/${movieData.poster_path}" onerror="this.onerror=null;this.src='img/poster-background.png';">
                    <button class="btn movie-info__btn movie-info__btn--favorite" data-movieid="${movieData.id}">Add to Favorites</button>
                </div>
                <div>
                    <p class="movie-info__title">${movieData.title}</p>
                    <p class="movie-info__year">${movieData.release_date.slice(0, 4)}</p>
                    <p class="movie-info__genres"></p>
                    <div class="movie-info__stats">
                        <img class="movie-info__icon--star"src="img/star.svg" alt="">
                        <p class="movie-info__stat-value">${movieData.vote_average}</p>
                        <img class="movie-info__icon--clock"src="img/clock.svg" alt="">
                        <p class="movie-info__stat-value">${movieData.runtime} mins</p>
                    </div>
                    <p class="movie-info__overview">${movieData.overview}</p>
                    <a class="btn movie-info__btn movie-info__btn--external" href="https://www.imdb.com/title/${movieData.imdb_id}/">View on IMDb</a>
                    <a class="btn movie-info__btn movie-info__btn--external movie-info__btn--homepage" href="${movieData.homepage}">View Homepage</a>
                </div>
            </div>
            <div class="movie-info__trailer">
                <p class="movie-info__trailer-title">Trailer</p>
                <iframe class="movie-info__trailer-video" width="560" height="315" frameborder="0" allowfullscreen></iframe>
            </div>
            `);

            /* =========================== FAVORITE BUTTON ============================== */
            const favoriteBtn = document.querySelector('.movie-info__btn--favorite');
            const notification = document.querySelector('.notification__container');
            let isFavorite;

            if (favoritesArr.includes(favoriteBtn.dataset.movieid)) {
                favoriteBtn.style.background = '#d32f2f';
                favoriteBtn.textContent = 'Remove from Favorites';
                isFavorite = true;
            } else {
                favoriteBtn.style.background = '#1565C0';
                favoriteBtn.textContent = 'Add to Favorites';
                isFavorite = false;
            }

            favoriteBtn.addEventListener('click', (e) => {
                const title = e.target.parentNode.nextElementSibling.children[0].textContent;
                if (!isFavorite) {
                    favoriteBtn.style.background = '#d32f2f';
                    favoriteBtn.textContent = 'Remove from Favorites';
                    notification.textContent = `"${title}" added to Favorites.`;
                } else {
                    favoriteBtn.style.background = '#1565C0';
                    favoriteBtn.textContent = 'Add to Favorites';
                    notification.textContent = `"${title}" removed from Favorites.`;
                }

                if (favoritesArr.includes(e.target.dataset.movieid)) {
                    const idx = favoritesArr.findIndex(el => el === e.target.dataset.movieid);
                    favoritesArr.splice(idx, 1);
                    localStorage.favorites = favoritesArr.join(', ');
                    favoriteCount.textContent = (favoritesArr.length);
                    if (favoritesArr.length === 0) {
                        favoriteCount.style.display = 'none';
                    }
                } else {
                    favoritesArr.push(e.target.dataset.movieid);
                    localStorage.favorites = favoritesArr.join(', ');
                    favoriteCount.textContent = (favoritesArr.length);
                    favoriteCount.style.display = 'inline';
                }

                favoriteBtn.disabled = true;
                favoriteBtn.style.cursor = 'not-allowed';
                notification.style.animation = 'slide-left 2s ease-in';
                setTimeout(() => {
                    favoriteBtn.disabled = false;
                    favoriteBtn.style.cursor = 'pointer';
                    notification.style.animation = 'none';
                }, 2000);
                isFavorite = !isFavorite;
            });

            // hide homepage button if null
            const homepageBtn = document.querySelector('.movie-info__btn--homepage');
            if (movieData.homepage === null) {
                homepageBtn.style.display = 'none';
            }

            // format genres
            const movieInfoGenres = document.querySelector('.movie-info__genres');
            const genresArr = [];
            movieData.genres.forEach((genre) => {
                genresArr.push(genre.name);
            });
            movieInfoGenres.textContent = genresArr.join(', ');

            // format trailer
            const movieInfoTrailer = document.querySelector('.movie-info__trailer-video');
            const trailerArr = movieData.videos.results.filter(video => (video.site === 'YouTube' && video.type === 'Trailer'));

            const movieTrailerContainer = document.querySelector('.movie-info__trailer');
            if (trailerArr.length === 0) {
                movieTrailerContainer.style.display = 'none'; // hide trailer if non-existent
            } else {
                const videoKey = trailerArr[0].key;
                movieInfoTrailer.setAttribute('src', `https://www.youtube.com/embed/${videoKey}`);
            }

            // add click listener to 'close' button
            const closeBtn = document.querySelector('.movie-info__icon--close');
            closeBtn.addEventListener('click', () => {
                clearDetails();
                window.scrollTo(0, Y);
            });
        })

        .catch(error => alert(error));
};

// clear movie details function
const clearDetails = () => {
    movieInfo.style.display = 'none';
    movieInfo.innerHTML = '';
    movieInfo.style.backgroundImage = 'linear-gradient(to top, rgba(0, 0, 0, .9), rgba(0, 0, 0, .8))';
    elements.heading.style.visibility = 'visible';
    elements.discoverLabel.style.visibility = 'visible';
    elements.trendingSelect.style.visibility = 'visible';
    movieContainer.style.display = 'flex';
    elements.spinner.style.display = 'block';
};

/* ======================================== FAVORITES =============================================== */

elements.favoritesTab.addEventListener('click', () => {
    getFavorites();
    prevSelected.classList.remove('selected');
    elements.favoritesTab.classList.add('selected');
    prevSelected = elements.favoritesTab;
});

const getFavorites = () => {
    clearDetails();
    clearMovies();
    isFavorites = true;
    elements.heading.textContent = 'My Favorites';
    favoritesArr.forEach((movieId) => {
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${key}`)
            .then((data) => {
                const movieData = data.data;
                elements.fillerAnchor.insertAdjacentHTML('beforebegin', `
                    <article data-movieid="${movieData.id}" class="movie">
                        <img class="movie__poster" src="https://image.tmdb.org/t/p/w154/${movieData.poster_path}" onerror="this.onerror=null;this.src='img/poster-background.png';">
                        <div class="movie__title-container">
                            <p class="movie__title">${movieData.title} (${movieData.release_date.slice(0, 4)})</p>
                        </div>
                    </article>
                `);
            })
            .catch(error => console.log(error));
    });
    elements.spinner.style.display = 'none';
};
