import axios from 'axios';
import '../sass/main.scss';
import { key } from './config';

const movieContainer = document.querySelector('.movie__container');
const spinner = document.querySelector('.spinner');

let curPage = 1;
let url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${key}&page=${curPage}`;

const axiosFn = () => {
    axios.get(url)
    .then(data => {
        const { results } = data.data
        results.forEach((el) => {
            movieContainer.insertAdjacentHTML('beforeend', `
                <article class="movie">
                    <img class="movie__poster" src="https://image.tmdb.org/t/p/w154/${el.poster_path}">
                    <div class="movie__title-container">
                        <p class="movie__title">${el.original_title} (${el.release_date.slice(0, 4)})</p>
                    </div>
                </article>
            `)
        });
    })
    .catch((error) => alert(error));
};

axiosFn();

const loadNextPage = () => {
    curPage += 1;
    url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${key}&page=${curPage}`;
    axiosFn();
};

// load new page when user scrolls to bottom
const observer = new IntersectionObserver(loadNextPage);
const target = spinner;
observer.observe(target);
