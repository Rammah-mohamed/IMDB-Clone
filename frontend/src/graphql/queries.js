import { gql } from '@apollo/client';

export const GET_TRENDING = gql`
  query ($time: String = null) {
    trendingAll(time: $time) {
      name
      title
      id
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      release_date
      popularity
      media_type
      genre_ids
      first_air_date
    }
  }
`;

export const SEARCH_MEDIA = gql`
  query ($query: String!, $page: String = null, $lang: String = null) {
    searchMulti(query: $query, page: $page, lang: $lang) {
      name
      title
      id
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      release_date
      popularity
      media_type
      genre_ids
      first_air_date
      profile_path
      gender
      known_for_department
      known_for {
        id
        title
        name
        overview
        poster_path
        backdrop_path
        release_date
        first_air_date
        genre_ids
        media_type
        popularity
        vote_average
        vote_count
      }
    }
  }
`;

export const GET_UPCOMING_MOVIES = gql`
  query ($page: Int = null) {
    upcomingMovies(page: $page) {
      title
      id
      overview
      genre_ids
      vote_average
      vote_count
      release_date
      poster_path
      backdrop_path
      popularity
    }
  }
`;

export const GET_POPULAR_MOVIES = gql`
  query ($page: Int = null) {
    popularMovies(page: $page) {
      id
      title
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      release_date
      popularity
      genre_ids
    }
  }
`;

export const GET_TRENDING_MOVIES = gql`
  query ($time: String = null) {
    trendingMovies(time: $time) {
      id
      title
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      release_date
      popularity
      genre_ids
    }
  }
`;

export const GET_TOP_MOVIES = gql`
  query ($page: Int = null) {
    topMovies(page: $page) {
      id
      title
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      release_date
      popularity
      genre_ids
    }
  }
`;

export const GET_SIMILAR_MOVIES = gql`
  query ($id: Int!, $page: String = null) {
    movieSimilar(id: $id, page: $page) {
      id
      title
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      release_date
      popularity
      genre_ids
    }
  }
`;

export const GET_RECOMMEND_MOVIES = gql`
  query ($id: Int!, $page: String = null) {
    moviesRecommend(id: $id, page: $page) {
      id
      title
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      release_date
      popularity
      genre_ids
    }
  }
`;

export const SEARCH_MOVIES = gql`
  query ($query: String!, $page: String = null, $lang: String = null, $year: String = null) {
    searchMovies(query: $query, page: $page, lang: $lang, year: $year) {
      id
      title
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      release_date
      popularity
      genre_ids
    }
  }
`;

export const GET_MOVIE_TRAILER = gql`
  query GetMovieTrailer($id: Int!) {
    movieVideos(id: $id) {
      key
      name
      type
    }
  }
`;

export const GET_MOVIE_GENRES = gql`
  query {
    movieGenres {
      id
      name
    }
  }
`;

export const GET_MOVIE_CAST = gql`
  query getMovieCast($id: Int!) {
    moviesCast(id: $id) {
      id
      name
      gender
      popularity
      known_for_department
      profile_path
      popularity
      character
      order
    }
  }
`;

export const GET_MOVIE_CREW = gql`
  query getMovieCrew($id: Int!) {
    moviesCrew(id: $id) {
      id
      name
      job
      gender
      profile_path
    }
  }
`;

export const GET_MOVIE_IMAGES = gql`
  query ($id: Int!) {
    movieImages(id: $id) {
      file_path
      width
      height
    }
  }
`;

export const GET_MOVIE_REVIEW = gql`
  query ($id: Int!) {
    movieReview(id: $id) {
      author
      author_details {
        avatar_path
        rating
      }
      content
      created_at
      updated_at
      url
    }
  }
`;

export const GET_TV_AIRING = gql`
  query ($page: Int = null) {
    tvAiring(page: $page) {
      id
      name
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      popularity
      genre_ids
      first_air_date
    }
  }
`;

export const GET_TRENDING_TV = gql`
  query ($time: String = null) {
    trendingTV(time: $time) {
      id
      name
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      popularity
      genre_ids
      first_air_date
    }
  }
`;

export const GET_TV_POPULAR = gql`
  query ($page: Int = null) {
    tvPopular(page: $page) {
      id
      name
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      popularity
      genre_ids
      first_air_date
    }
  }
`;

export const GET_TOP_TV = gql`
  query ($page: Int = null) {
    topTv(page: $page) {
      id
      name
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      popularity
      genre_ids
      first_air_date
    }
  }
`;

export const GET_TV_SIMILAR = gql`
  query ($id: Int!, $page: Int = null) {
    tvSimilar(id: $id, page: $page) {
      id
      name
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      popularity
      genre_ids
      first_air_date
    }
  }
`;
export const GET_TV_RECOMMEND = gql`
  query ($id: Int!, $page: Int = null) {
    tvRecommed(id: $id, page: $page) {
      id
      name
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      popularity
      genre_ids
      first_air_date
    }
  }
`;

export const SEARCH_TV = gql`
  query ($query: String!, $page: String = null, $lang: String = null, $year: String = null) {
    searchTV(query: $query, page: $page, lang: $lang, year: $year) {
      id
      name
      overview
      poster_path
      backdrop_path
      vote_average
      vote_count
      popularity
      genre_ids
      first_air_date
    }
  }
`;

export const GET_TV_TRAILER = gql`
  query GetTVTrailer($id: Int!) {
    tvVideos(id: $id) {
      key
      name
      type
    }
  }
`;

export const GET_TV_GENRES = gql`
  query {
    tvGenres {
      id
      name
    }
  }
`;

export const GET_TV_CAST = gql`
  query getTvCast($id: Int!) {
    tvCast(id: $id) {
      id
      name
      gender
      popularity
      known_for_department
      profile_path
      popularity
      character
      order
    }
  }
`;

export const GET_TV_CREW = gql`
  query getTvCrew($id: Int!) {
    moviesCrew(id: $id) {
      id
      name
      job
      gender
      profile_path
    }
  }
`;

export const GET_TV_IMAGES = gql`
  query ($id: Int!) {
    tvImages(id: $id) {
      file_path
      width
      height
    }
  }
`;

export const GET_TV_REVIEW = gql`
  query ($id: Int!) {
    tvReview(id: $id) {
      author
      author_details {
        avatar_path
        rating
      }
      content
      created_at
      updated_at
      url
    }
  }
`;

export const GET_POPULAR_CELEBRITY = gql`
  query {
    popularCelebrity {
      name
      id
      gender
      profile_path
      popularity
      known_for_department
      known_for {
        id
        name
        overview
        title
        poster_path
        backdrop_path
        popularity
        vote_average
        vote_count
        release_date
        genre_ids
        media_type
        first_air_date
      }
    }
  }
`;

export const GET_CELEBRITY_DETAILS = gql`
  query ($id: Int!) {
    celebrityDetail(id: $id) {
      id
      imdb_id
      biography
      birthday
      deathday
      place_of_birth
    }
  }
`;

export const GET_CELEBRITY_IMAGES = gql`
  query ($id: Int!) {
    celebrityImages(id: $id) {
      width
      height
      file_path
    }
  }
`;

export const SEARCH_CELEBRITY = gql`
  query ($query: String!, $page: String = null, $lang: String = null) {
    searchCelebrity(query: $query, page: $page, lang: $lang) {
      id
      name
      profile_path
      gender
      known_for_department
      known_for {
        id
        title
        name
        overview
        poster_path
        backdrop_path
        release_date
        first_air_date
        genre_ids
        media_type
        popularity
        vote_average
        vote_count
      }
      popularity
    }
  }
`;
