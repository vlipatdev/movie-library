import '../sass/main.scss';
import axios from 'axios';
import { key } from './config';

const elements = {
    searchInput: document.querySelector('.search__input'),
    trending: document.querySelector('.nav__text--trending'),
    genre: document.querySelector('.nav__text--genres'),
    genreIcon: document.querySelector('.nav__icon--chevron'),
    navList: document.querySelector('.nav__list'),
    genreList: document.querySelectorAll('.nav__list-item'),

    heading: document.querySelector('.heading'),
    trendSelect: document.querySelector('.select__trend'),
    discoverLabel: document.querySelector('.label__discover'),
    discoverSelect: document.querySelector('.select__discover'),
    fillerAnchor: document.querySelector('.movie__filler-anchor'),
    spinner: document.querySelector('.spinner'),
};

// track type of query
let isSearch;
let isTrending;
let isDiscover;

// track url values
let searchValue;
let trendValue;
let discoverValue;
let genreId;
let curPage;
let url;

// track previously selected element
let prevSelected;

// clear movies function
const clearMovies = () => {
    const movieList = document.querySelectorAll('.movie');
    movieList.forEach((movie) => {
        movie.remove();
    });

    elements.spinner.style.display = 'block';
    elements.trendSelect.style.display = 'none';
    elements.discoverLabel.style.display = 'none';

    isSearch = false;
    isDiscover = false;
    isTrending = false;

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
                        <img class="movie__poster" src="https://image.tmdb.org/t/p/w154/${movie.poster_path}">
                        <div class="movie__title-container">
                            <p class="movie__title">${movie.original_title} (${movie.release_date.slice(0, 4)})</p>
                        </div>
                    </article>
                `);
            });

            // add click listener to each movie
            const movieList = document.querySelectorAll('.movie');
            movieList.forEach((movieEl) => {
                movieEl.addEventListener('click', (e) => {
                    Y = window.scrollY; // track scroll position
                    e.stopImmediatePropagation();
                    movieContainer.style.display = 'none';
                    elements.heading.style.visibility = 'hidden';
                    elements.discoverLabel.style.visibility = 'hidden';
                    elements.trendSelect.style.visibility = 'hidden';
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
    }
    getMovies(url);
};

// onload
const init = () => {
    elements.navList.classList.add('expand');
    elements.genreIcon.classList.toggle('rotate');
    prevSelected = elements.trending;
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

// search tab keydown listener
elements.searchInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        clearDetails();
        clearMovies();
        prevSelected.classList.remove('selected');
        elements.heading.textContent = `Results for "${e.target.value}"`;

        isSearch = true;
        searchValue = e.target.value;
        url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${searchValue}&vote_count.gte=1000&page=${curPage}`;
        getMovies(url);
    }
});

// trending tab click listener
elements.trending.addEventListener('click', () => {
    clearDetails();
    clearMovies();
    elements.heading.textContent = 'Trending';
    elements.trendSelect.style.display = 'block';
    prevSelected.classList.remove('selected');
    elements.trending.classList.add('selected');

    isTrending = true;
    elements.trendSelect.value = 'day';
    trendValue = 'day';
    url = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
    getMovies(url);

    prevSelected = elements.trending;
    return trendValue;
});

// genre tab click listener
elements.genre.addEventListener('click', () => {
    elements.navList.classList.toggle('expand');
    elements.genreIcon.classList.toggle('rotate');
});

// genres click listener
elements.genreList.forEach((genre) => {
    genre.addEventListener('click', (e) => {
        clearDetails();
        clearMovies();
        elements.heading.textContent = e.target.textContent;
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
elements.trendSelect.addEventListener('change', (e) => {
    clearMovies();
    elements.trendSelect.style.display = 'block';

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

/* =========================================MOVIE DETAILS================================================ */

const movieInfo = document.querySelector('.movie-info');
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
                    <img class="movie-info__poster" src="https://image.tmdb.org/t/p/w200/${movieData.poster_path}">
                    <button class="btn movie-info__btn">Add to Favorites</button>
                </div>
                <div>
                    <p class="movie-info__title">${movieData.original_title}</p>
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

            // hide homepage button if null
            const homepageBtn = document.querySelector('.movie-info__btn--homepage');
            if (movieData.homepage === null) {
                homepageBtn.style.display = 'none';
            }

            // format genres
            const movieInfoGenres = document.querySelector('.movie-info__genres');
            const genreArr = [];
            movieData.genres.forEach((genre) => {
                genreArr.push(genre.name);
            });
            movieInfoGenres.textContent = genreArr.join(', ');

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
    movieInfo.style.backgroundImage = `linear-gradient(to top, rgba(0, 0, 0, .9), rgba(0, 0, 0, .8))`;
    elements.heading.style.visibility = 'visible';
    elements.discoverLabel.style.visibility = 'visible';
    elements.trendSelect.style.visibility = 'visible';
    movieContainer.style.display = 'flex';
    elements.spinner.style.display = 'block';
};

