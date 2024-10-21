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

export const GET_POPULAR_PEOPLE = gql`
  query {
    popularPeople {
      name
      id
      gender
      biography
      birthday
      deathday
      profile_path
      popularity
      place_of_birth
      known_for_department
      known_for {
        id
        overview
        poster_path
        backdrop_path
        popularity
        vote_average
        vote_count
        release_date
        genre_ids
        title
        name
        media_type
        first_air_date
      }
    }
  }
`;
