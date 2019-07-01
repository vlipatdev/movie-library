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

// set current page
let curPage = 1;

// set urls
let trendUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${key}&page=${curPage}`;
let discoverUrl;

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

// call axios onload
axiosFn(trendUrl);

// clear movies
const clearMovies = () => {
    movieContainer.innerHTML = '';
};

let trendValue = 'day';
// update trending on select change
trendSelect.addEventListener('change', (e) => {
    spinner.style.display = 'block';
    trendValue = e.target.value;
    curPage = 1;
    clearMovies();
    trendUrl = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
    axiosFn(trendUrl);
    return trendValue;
});

let genreId;
let discoverValue = 'popularity.desc';
// update discover on select change;
discoverSelect.addEventListener('change', (e) => {
    spinner.style.display = 'block';
    discoverValue = e.target.value;
    curPage = 1;
    clearMovies();
    discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&page=${curPage}&with_genres=${genreId}&sort_by=${discoverValue}&vote_count.gte=500`;
    axiosFn(discoverUrl);
    return discoverValue;
});

// add event listeners on genres
let isDiscover;
let prevEl = genreList[0];
genreList.forEach((genre) => {
    genre.addEventListener('click', (e) => {
        spinner.style.display = 'block';
        trendSelect.style.display = 'none';
        discoverLabel.style.display = 'block';
        discoverSelect.value = 'popularity.desc';
        prevEl.classList.remove('selected');
        e.target.classList.add('selected');
        clearMovies();
        heading.textContent = e.target.textContent;
        curPage = 1;
        genreId = e.target.dataset.id;
        discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&page=${curPage}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=500`;
        axiosFn(discoverUrl);
        isDiscover = true;
        prevEl = e.target;
    });
});

// load new page when user scrolls to bottom
const loadNextPage = () => {
    curPage += 1;
    if (!isDiscover) {
        trendUrl = `https://api.themoviedb.org/3/trending/movie/${trendValue}?api_key=${key}&page=${curPage}`;
        axiosFn(trendUrl);
    } else {
        discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&page=${curPage}&with_genres=${genreId}&sort_by=${discoverValue}&vote_count.gte=500`;
        axiosFn(discoverUrl);
    }
};

// intersection observer
const observer = new IntersectionObserver(loadNextPage);
const target = spinner;
observer.observe(target);
