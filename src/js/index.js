import axios from 'axios';
import '../sass/main.scss';
import { key } from './config';

const movieContainer = document.querySelector('.movie__container');
const spinner = document.querySelector('.spinner');
const genreList = document.querySelectorAll('.genre');
const heading = document.querySelector('.heading');
const trendSelect = document.querySelector('.trend-select');
const discoverLabel = document.querySelector('.discover-label');
const discoverSelect = document.querySelector('.discover-select');
const searchInput = document.querySelector('.search__input');

// set current page
let curPage = 1;

// set urls
let trendUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${key}&page=${curPage}`;
let discoverUrl;
let searchUrl;

// axios function
const axiosFn = (url) => {
    axios.get(url)
        .then((data) => {
            if (data.data.page >= data.data.total_pages) {
                spinner.style.display = 'none';
            }
            const { results } = data.data;
            results.forEach((el) => {
                movieContainer.insertAdjacentHTML('beforeend', `
                    <article class="movie">
                        <img class="movie__poster" src="https://image.tmdb.org/t/p/w154/${el.poster_path}">
                        <div class="movie__title-container">
                            <p class="movie__title">${el.original_title} (${el.release_date.slice(0, 4)})</p>
                        </div>
                    </article>
                `);
            });
        })
        .catch(error => alert(error));
};

// render movies onload
axiosFn(trendUrl);

// clear movies function
const clearMovies = () => {
    movieContainer.innerHTML = '';
    spinner.style.display = 'block';
    curPage = 1;
};

let trendValue = 'day';
// update trending on select change
trendSelect.addEventListener('change', (e) => {
    clearMovies();
    trendValue = e.target.value;
    trendUrl = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
    axiosFn(trendUrl);
    return trendValue;
});

let genreId;
let discoverValue = 'popularity.desc';
// update discover on select change;
discoverSelect.addEventListener('change', (e) => {
    clearMovies();
    discoverValue = e.target.value;
    discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&page=${curPage}&with_genres=${genreId}&sort_by=${discoverValue}&vote_count.gte=500`;
    axiosFn(discoverUrl);
    return discoverValue;
});

// add event listeners on genres
let isDiscover;
let prevEl = genreList[0];
genreList.forEach((genre) => {
    genre.addEventListener('click', (e) => {
        clearMovies();
        trendSelect.style.display = 'none';
        discoverLabel.style.display = 'block';
        discoverSelect.value = 'popularity.desc';
        prevEl.classList.remove('selected');
        e.target.classList.add('selected');
        heading.textContent = e.target.textContent;
        genreId = e.target.dataset.id;
        discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&page=${curPage}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=500`;
        axiosFn(discoverUrl);
        isSearch = false;
        isDiscover = true;
        prevEl = e.target;
    });
});

let isSearch;
let searchValue;
searchInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        heading.textContent = `Results for "${e.target.value}"`;
        trendSelect.style.display = 'none';
        discoverLabel.style.display = 'none';
        clearMovies();
        searchValue = e.target.value;
        searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${key}&page=${curPage}&query=${searchValue}&vote_count.gte=500`;
        axiosFn(searchUrl);
        isDiscover = false;
        isSearch = true;
    }
});

// load new page when user scrolls to bottom
const loadNextPage = () => {
    curPage += 1;
    if (isDiscover) {
        discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&page=${curPage}&with_genres=${genreId}&sort_by=${discoverValue}&vote_count.gte=500`;
        axiosFn(discoverUrl);
    } else if (isSearch) {
        searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${key}&page=${curPage}&query=${searchValue}&vote_count.gte=500`;
        axiosFn(searchUrl);
    } else {
        trendUrl = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
        axiosFn(trendUrl);
    }
};

// intersection observer
const observer = new IntersectionObserver(loadNextPage);
const target = spinner;
observer.observe(target);
