const axios = require('axios');
const BASE_URL = 'https://api.themoviedb.org/3/';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhYmM1ZTczMzc2ZjI3OWNkMDM1NjEwMGY4MTgxNDQ0MyIsIm5iZiI6MTcyNzUzOTY1OC43ODcxNzIsInN1YiI6IjY2ZjgyN2RkZTdkMjRlYmIyYmEyMWQ5MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Rp7b-rgie5qrxql6CadpA1lenxkBhHSKOvQuFTUXvDQ',
  },
};

const resolvers = {
  Query: {
    trendingAll: async (_, { time }) => {
      try {
        const response = await fetch(
          BASE_URL + `trending/all/${time || 'week'}?language=en-US`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    searchMulti: async (_, { query, lang, page }) => {
      try {
        const response = await fetch(
          BASE_URL +
            `search/multi?query=${query}&include_adult=false&language=${
              lang || 'en-US'
            }&page=${page || '1'}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    trendingMovies: async (_, { time }) => {
      try {
        const response = await fetch(
          BASE_URL + `trending/movie/${time || 'week'}?language=en-US`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    popularMovies: async (_, { page }) => {
      try {
        const response = await fetch(
          BASE_URL + `movie/popular?language=en-US&page=${page || 1}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    upcomingMovies: async (_, { page }) => {
      try {
        const response = await fetch(
          BASE_URL + `movie/upcoming?language=en-US&page=${page || 1}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    topMovies: async (_, { page }) => {
      try {
        const response = await fetch(
          BASE_URL + `movie/top_rated?language=en-US&page=${page || 1}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    movieDetail: async (_, { id }) => {
      try {
        const response = await fetch(
          BASE_URL + `movie/${id}?language=en-US`,
          options
        );
        const data = await response.json();
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    movieSimilar: async (_, { id, page }) => {
      try {
        const response = await fetch(
          BASE_URL + `movie/${id}/similar?language=en-US&page=${page || '1'}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    movieReview: async (_, { id, page }) => {
      try {
        const response = await fetch(
          BASE_URL + `movie/${id}/reviews?language=en-US&page=${page || '1'}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    movieImages: async (_, { id }) => {
      try {
        const response = await fetch(BASE_URL + `movie/${id}/images`, options);
        const data = await response.json();
        return data.backdrops;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    movieVideos: async (_, { id }) => {
      try {
        const response = await fetch(
          BASE_URL + `movie/${id}/videos?language=en-US`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    movieGenres: async () => {
      try {
        const response = await fetch(
          BASE_URL + `genre/movie/list?language=en`,
          options
        );
        const data = await response.json();
        return data.genres;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    moviesRecommend: async (_, { id, page }) => {
      try {
        const response = await fetch(
          BASE_URL +
            `movie/${id}/recommendations?language=en-US&page=${page || 1}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    searchMovies: async (_, { query, lang, page, year }) => {
      try {
        const response = await fetch(
          BASE_URL +
            `search/movie?query=${query}&include_adult=false&language=${
              lang || 'en-US'
            }&page=${page || '1'}${year ? '&year=' + year : ''}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    trendingTV: async (_, { time }) => {
      try {
        const response = await fetch(
          BASE_URL + `trending/tv/${time || 'week'}?language=en-US`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    tvAiring: async (_, { page }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/airing_today?language=en-US&page=${page || '1'}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    tvPopular: async (_, { page }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/popular?language=en-US&page=${page || '1'}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    topTv: async (_, { page }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/top_rated?language=en-US&page=${page || '1'}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    tvDetail: async (_, { id }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/${id}?language=en-US`,
          options
        );
        const data = await response.json();
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    tvSimilar: async (_, { id, page }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/${id}/similar?language=en-US&page=${page || '1'}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    tvReview: async (_, { id, page }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/${id}/reviews?language=en-US&page=${page || '1'}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    tvImages: async (_, { id }) => {
      try {
        const response = await fetch(BASE_URL + `tv/${id}/images`, options);
        const data = await response.json();
        return data.backdrops;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    tvVideos: async (_, { id }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/${id}/videos?language=en-US`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    tvRecommend: async (_, { id, page }) => {
      try {
        const response = await fetch(
          BASE_URL +
            `tv/${id}/recommendations?language=en-US&page=${page || 1}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    tvGenres: async () => {
      try {
        const response = await fetch(
          BASE_URL + `genre/tv/list?language=en`,
          options
        );
        const data = await response.json();
        return data.genres;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    searchTV: async (_, { query, lang, page, year }) => {
      try {
        const response = await fetch(
          BASE_URL +
            `search/tv?query=${query}&include_adult=false&language=${
              lang || 'en-US'
            }&page=${page || '1'}${year ? '&year=' + year : ''}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    seasonDetail: async (_, { id, number }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/${id}/season/${number}?language=en-US`,
          options
        );
        const data = await response.json();
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    seasonImages: async (_, { id, number }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/${id}/season/${number}/images`,
          options
        );
        const data = await response.json();
        return data.posters;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    seasonVideos: async (_, { id, number }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/${id}/season/${number}/videos?language=en-US`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    episodeDetail: async (_, { id, season, number }) => {
      try {
        const response = await fetch(
          BASE_URL +
            `tv/${id}/season/${season}/episode/${number}?language=en-US`,
          options
        );
        const data = await response.json();
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    episodeImages: async (_, { id, season, number }) => {
      try {
        const response = await fetch(
          BASE_URL + `tv/${id}/season/${season}/episode/${number}/images`,
          options
        );
        const data = await response.json();
        return data.stills;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    episodeVideos: async (_, { id, season, number }) => {
      try {
        const response = await fetch(
          BASE_URL +
            `tv/${id}/season/${season}/episode/${number}/videos?language=en-US`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    trendingPeople: async (_, { time }) => {
      try {
        const response = await fetch(
          BASE_URL + `trending/person/${time || 'week'}?language=en-US`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    popularPeople: async (_, { page }) => {
      try {
        const response = await fetch(
          BASE_URL + `person/popular?language=en-US&page=${page || 1}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    peopleDetail: async (_, { id }) => {
      try {
        const response = await fetch(
          BASE_URL + `person/${id}?language=en-US`,
          options
        );
        const data = await response.json();
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    peopleImages: async (_, { id }) => {
      try {
        const response = await fetch(BASE_URL + `person/${id}/images`, options);
        const data = await response.json();
        return data.profiles;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    searchPeople: async (_, { query, lang, page }) => {
      try {
        const response = await fetch(
          BASE_URL +
            `search/person?query=${query}&include_adult=false&language=${
              lang || 'en-US'
            }&page=${page || '1'}`,
          options
        );
        const data = await response.json();
        return data.results;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  TVDetails: {
    genres: (TVDetails) => {
      return TVDetails.genres;
    },
    last_episode_to_air: (TVDetails) => {
      return TVDetails.last_episode_to_air;
    },
    next_episode_to_air: (TVDetails) => {
      return TVDetails.next_episode_to_air;
    },
    seasons: (TVDetails) => {
      return TVDetails.seasons;
    },
  },
  Review: {
    author_details: (review) => {
      return review.author_details;
    },
  },
  SeasonDetail: {
    episodes: (seasonDetail) => {
      return seasonDetail.episodes;
    },
  },
  Episode: {
    crew: (episode) => {
      return episode.crew;
    },
    guest_stars: (episode) => {
      return episode.guest_stars;
    },
  },
  People: {
    known_for: (people) => {
      return people.known_for;
    },
  },
};

module.exports = resolvers;
