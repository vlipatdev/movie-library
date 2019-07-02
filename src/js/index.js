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
    fillerAnchor: document.querySelector('.filler-anchor'),
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

// axios function
const axiosFn = (url) => {
    console.log(url);
    axios.get(url)
        .then((data) => {
            // stop showing spinner if there's no more results
            if (data.data.page >= data.data.total_pages) {
                elements.spinner.style.display = 'none';
            }

            const { results } = data.data;
            results.forEach((movie) => {
                elements.fillerAnchor.insertAdjacentHTML('beforebegin', `
                    <article class="movie">
                        <img class="movie__poster" src="https://image.tmdb.org/t/p/w154/${movie.poster_path}">
                        <div class="movie__title-container">
                            <p class="movie__title">${movie.original_title} (${movie.release_date.slice(0, 4)})</p>
                        </div>
                    </article>
                `);
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
    axiosFn(url);
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
    axiosFn(url);

    // set intersection observer
    const observer = new IntersectionObserver(loadNextPage);
    const target = elements.spinner;
    observer.observe(target);
};

init();

// search tab click listener
elements.searchInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        clearMovies();
        prevSelected.classList.remove('selected');
        elements.heading.textContent = `Results for "${e.target.value}"`;

        isSearch = true;
        searchValue = e.target.value;
        url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${searchValue}&vote_count.gte=1000&page=${curPage}`;
        axiosFn(url);
    }
});

// trending tab click listener
elements.trending.addEventListener('click', () => {
    clearMovies();
    elements.heading.textContent = 'Trending';
    elements.trendSelect.style.display = 'block';
    prevSelected.classList.remove('selected');
    elements.trending.classList.add('selected');

    isTrending = true;
    elements.trendSelect.value = 'day';
    trendValue = 'day';
    url = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
    axiosFn(url);

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
        axiosFn(url);

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
    axiosFn(url);

    return trendValue;
});

// update discover on select change;
elements.discoverSelect.addEventListener('change', (e) => {
    clearMovies();
    elements.discoverLabel.style.display = 'block';

    isDiscover = true;
    discoverValue = e.target.value;
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_genres=${genreId}&sort_by=${discoverValue}&vote_count.gte=1000&page=${curPage}`;
    axiosFn(url);

    return discoverValue;
});
