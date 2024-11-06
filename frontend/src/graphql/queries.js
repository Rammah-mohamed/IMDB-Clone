import { gql } from '@apollo/client';

export const GET_TRENDING = gql`
  query {
    trendingAll {
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

export const GET_UPCOMING_MOVIES = gql`
  query {
    upcomingMovies {
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
  query {
    popularMovies {
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
  query {
    tvAiring {
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

export const GET_TV_Popular = gql`
  query {
    tvPopular {
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
