import '../sass/main.scss';
import axios from 'axios';
import { key } from './config';

const elements = {
    illustration: document.querySelector('.movie__no-results'),
    menu: document.querySelector('.topbar__menu'),
    searchInput: document.querySelector('.search__input'),
    searchIcon: document.querySelector('.search__icon'),
    nav: document.querySelector('.nav'),
    favoritesTab: document.querySelector('.nav__tab--favorites'),
    trendingTab: document.querySelector('.nav__tab--trending'),
    genresTab: document.querySelector('.nav__tab--genres'),
    genreIcon: document.querySelector('.nav__icon--chevron'),
    genreUl: document.querySelector('.nav__list'),
    genreList: document.querySelectorAll('.nav__list-item'),
    about: document.querySelector('.nav__tab--about'),
    tmdb: document.querySelector('.tmdb'),
    heading: document.querySelector('.heading'),
    trendingSelect: document.querySelector('.select__trend'),
    discoverLabel: document.querySelector('.label__discover'),
    discoverSelect: document.querySelector('.select__discover'),
    movieContainer: document.querySelector('.movie__container'),
    movieInfo: document.querySelector('.movie-info'),
    fillerAnchor: document.querySelector('.movie__filler-anchor'),
    loader: document.querySelector('.loader'),
    notification: document.querySelector('.notification__container')
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

/* =================================== FUNCTIONS ====================================== */

const hideIllustration = () => {
    elements.illustration.style.display = 'none';
};

const showIllustration = () => {
    elements.illustration.style.display = 'flex';
};

const resetPage = () => {
    curPage = 1;
};

let movieList;
const clearMovies = () => {
    movieList = document.querySelectorAll('.movie');
    movieList.forEach((movie) => {
        movie.remove();
    });
};

const hideLoader = () => {
    elements.loader.style.display = 'none';
};

const showLoader = () => {
    elements.loader.style.display = 'block';
};

const showMovieInfo = () => {
    elements.movieInfo.style.display = 'flex';
};

const clearUI = () => {
    hideIllustration();
    clearMovies();
    showLoader();
    elements.trendingSelect.style.display = 'none';
    elements.discoverLabel.style.display = 'none';
    isSearch = false;
    isDiscover = false;
    isTrending = false;
    isFavorites = false;
    resetPage();
};

/* =================================== DISPLAY MOVIE CARDS ====================================== */

// get movies function
let Y;
const getMovies = (url) => {
    axios.get(url)
        .then((data) => {
            const { results } = data.data;

            // show illustration if no results
            if (isSearch && data.data.total_results === 0) {
                showIllustration();
            }

            // stop showing loader if no more results
            if (data.data.page >= data.data.total_pages) {
                hideLoader();
            }

            // insert markup
            results.forEach((movie) => {
                elements.fillerAnchor.insertAdjacentHTML('beforebegin', `
                <div data-movieid="${movie.id}" class="movie">
                    <img class="movie__poster" src="https://image.tmdb.org/t/p/w154/${movie.poster_path}" alt="${movie.title}" onerror="this.onerror=null;this.src='img/poster-background.png';">
                    <div class="movie__title-container">
                        <p class="movie__title">${movie.title} (${movie.release_date.slice(0, 4)})</p>
                    </div>
                </div>
                `);
            });

            // add click listener to each movie
            movieList = document.querySelectorAll('.movie');
            movieList.forEach((movieEl) => {
                movieEl.addEventListener('click', (e) => {
                    Y = window.scrollY; // track scroll position
                    e.stopImmediatePropagation();
                    elements.movieContainer.style.display = 'none';
                    elements.heading.style.visibility = 'hidden';
                    elements.discoverLabel.style.visibility = 'hidden';
                    elements.trendingSelect.style.visibility = 'hidden';
                    hideLoader();
                    showMovieInfo();
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

// menu click listener
elements.menu.addEventListener('click', () => {
    elements.nav.classList.toggle('nav-active');
});

// search function
const search = (e, isInput) => {
    clearDetails();
    clearUI();
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

// search tab keydown listener
let isInput;
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

// favorites tab click listener
elements.favoritesTab.addEventListener('click', () => {
    getFavorites();
    prevSelected.classList.remove('selected');
    elements.favoritesTab.classList.add('selected');
    prevSelected = elements.favoritesTab;
});

// trending tab click listener
elements.trendingTab.addEventListener('click', () => {
    clearDetails();
    clearUI();
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

// about tab click listener
elements.about.addEventListener('click', () => {
    if (elements.tmdb.style.display !== 'none') {
        elements.tmdb.style.display = 'none';
    } else {
        elements.tmdb.style.display = 'block';
    }
});

// genres click listener
elements.genreList.forEach((genre) => {
    genre.addEventListener('click', (e) => {
        clearDetails();
        clearUI();
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
    clearUI();
    elements.trendingSelect.style.display = 'block';
    isTrending = true;
    trendValue = e.target.value;
    url = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
    getMovies(url);
    return trendValue;
});

// update discover on select change;
elements.discoverSelect.addEventListener('change', (e) => {
    clearUI();
    elements.discoverLabel.style.display = 'block';
    isDiscover = true;
    discoverValue = e.target.value;
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_genres=${genreId}&sort_by=${discoverValue}&vote_count.gte=1000&page=${curPage}`;
    getMovies(url);
    return discoverValue;
});

/* =================================== DISPLAY MOVIE DETAILS ====================================== */

// local storage
let favoritesArr;
if (localStorage.favorites) {
    favoritesArr = localStorage.favorites.split(', ');
} else {
    favoritesArr = [];
}

// display favorites count onload
const favoritesCount = document.querySelector('.nav__tab--favorites-count');
favoritesCount.textContent = (favoritesArr.length);
favoritesCount.style.display = 'inline';
if (favoritesArr.length === 0) {
    favoritesCount.style.display = 'none';
}

// get movie details
const getMovieDetails = (url) => {
    axios.get(url)
        .then((data) => {
            const movieData = data.data;
            elements.movieInfo.style.backgroundImage = `linear-gradient(to top, rgba(0, 0, 0, .9), rgba(0, 0, 0, .8)), url('https://image.tmdb.org/t/p/w780/${movieData.backdrop_path}')`;

            // insert markup
            elements.movieInfo.insertAdjacentHTML('beforeend', `
            <img class="movie-info__icon--close" src="img/x.svg" alt="">
            <div class="movie-info__details">
                <div class="movie-info__poster-container">
                    <img class="movie-info__poster" src="https://image.tmdb.org/t/p/w200/${movieData.poster_path}" alt="${movieData.title}" onerror="this.onerror=null;this.src='img/poster-background.png';">
                    <button class="btn movie-info__btn movie-info__btn--favorite" data-movieid="${movieData.id}">Add to Favorites</button>
                </div>
                <div>
                    <p class="movie-info__title">${movieData.title}</p>
                    <p class="movie-info__year">${movieData.release_date.slice(0, 4)}</p>
                    <p class="movie-info__genres"></p>
                    <div class="movie-info__stats">
                        <img class="movie-info__icon--star" src="img/star.svg" alt="">
                        <p class="movie-info__stat-value">${movieData.vote_average}</p>
                        <img class="movie-info__icon--clock" src="img/clock.svg" alt="">
                        <p class="movie-info__stat-value">${movieData.runtime} mins</p>
                    </div>
                    <p class="movie-info__overview">${movieData.overview}</p>
                    <a class="btn movie-info__btn movie-info__btn--external movie-info__btn--imdb" href="https://www.imdb.com/title/${movieData.imdb_id}/">View on IMDb</a>
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
                    elements.notification.textContent = `"${title}" added to Favorites.`;
                } else {
                    favoriteBtn.style.background = '#1565C0';
                    favoriteBtn.textContent = 'Add to Favorites';
                    elements.notification.textContent = `"${title}" removed from Favorites.`;
                }

                if (favoritesArr.includes(e.target.dataset.movieid)) {
                    const idx = favoritesArr.findIndex(el => el === e.target.dataset.movieid);
                    favoritesArr.splice(idx, 1);
                    localStorage.favorites = favoritesArr.join(', ');
                    favoritesCount.textContent = (favoritesArr.length);
                    if (favoritesArr.length === 0) {
                        favoritesCount.style.display = 'none';
                    }
                } else {
                    favoritesArr.push(e.target.dataset.movieid);
                    localStorage.favorites = favoritesArr.join(', ');
                    favoritesCount.textContent = (favoritesArr.length);
                    favoritesCount.style.display = 'inline';
                }

                // temporarily disable favorite button
                favoriteBtn.disabled = true;
                favoriteBtn.style.cursor = 'not-allowed';
                elements.notification.style.animation = 'slide-left 3s ease-in';
                setTimeout(() => {
                    favoriteBtn.disabled = false;
                    favoriteBtn.style.cursor = 'pointer';
                    elements.notification.style.animation = 'none';
                }, 3000);
                isFavorite = !isFavorite;
            });

            // hide imdb button if null
            const imdbBtn = document.querySelector('.movie-info__btn--imdb');
            if (movieData.imdb_id === null) {
                imdbBtn.style.display = 'none';
            }

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

            // show or hide trailer
            const movieTrailerContainer = document.querySelector('.movie-info__trailer');
            const movieTrailerVideo = document.querySelector('.movie-info__trailer-video');
            const trailerArr = movieData.videos.results.filter(video => (video.site === 'YouTube' && video.type === 'Trailer'));

            if (trailerArr.length === 0) {
                movieTrailerContainer.style.display = 'none';
            } else {
                const videoKey = trailerArr[0].key;
                movieTrailerVideo.setAttribute('src', `https://www.youtube.com/embed/${videoKey}`);
            }

            // add click listener to 'close' button
            const closeBtn = document.querySelector('.movie-info__icon--close');
            closeBtn.addEventListener('click', () => {
                clearDetails();
                // restore scroll
                window.scrollTo(0, Y);

                if (isFavorites) {
                    getFavorites();
                }
            });
        })
        .catch(error => alert(error));
};

// clear movie details function
const clearDetails = () => {
    elements.movieInfo.style.display = 'none';
    elements.movieInfo.innerHTML = '';
    elements.movieInfo.style.backgroundImage = 'linear-gradient(to top, rgba(0, 0, 0, .7), rgba(0, 0, 0, .8))';
    elements.heading.style.visibility = 'visible';
    elements.discoverLabel.style.visibility = 'visible';
    elements.trendingSelect.style.visibility = 'visible';
    elements.movieContainer.style.display = 'flex';
    showLoader();
};

/* =================================== DISPLAY FAVORITES ====================================== */

const getFavorites = () => {
    clearDetails();
    clearUI();
    isFavorites = true;
    elements.heading.textContent = 'My Favorites';
    if (favoritesArr.length === 0) {
        showIllustration();
    }

    favoritesArr.forEach(async (movieId) => {
        await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${key}`)
            .then((data) => {
                const movieData = data.data;
                elements.fillerAnchor.insertAdjacentHTML('beforebegin', `
                    <div data-movieid="${movieData.id}" class="movie">
                        <img class="movie__poster" src="https://image.tmdb.org/t/p/w154/${movieData.poster_path}" alt="${movieData.title}" onerror="this.onerror=null;this.src='img/poster-background.png';">
                        <div class="movie__title-container">
                            <p class="movie__title">${movieData.title} (${movieData.release_date.slice(0, 4)})</p>
                        </div>
                    </div>
                `);
            })
            .catch(error => console.log(error));
        const favoriteMovies = document.querySelectorAll('.movie');
        favoriteMovies.forEach((movie) => {
            movie.addEventListener('click', (e) => {
                Y = window.scrollY; // track scroll position
                e.stopImmediatePropagation();
                elements.movieContainer.style.display = 'none';
                elements.heading.style.visibility = 'hidden';
                elements.discoverLabel.style.visibility = 'hidden';
                elements.trendingSelect.style.visibility = 'hidden';
                hideLoader();
                showMovieInfo();
                getMovieDetails(`https://api.themoviedb.org/3/movie/${movie.dataset.movieid}?api_key=${key}&append_to_response=videos`);
                return Y;
            });
        });
    });
    hideLoader();
};

/* =================================== INITIALIZE ====================================== */

const init = () => {
    elements.genreUl.classList.toggle('expand');
    elements.genreIcon.classList.toggle('rotate');
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
    const target = elements.loader;
    observer.observe(target);
};

init();
