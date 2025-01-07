import { gql } from '@apollo/client';

export const GET_TRENDING = gql`
  query ($time: String) {
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
  query ($query: String!, $page: String, $lang: String) {
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

export const GET_LIST_MEDIA = gql`
  query ($page: Int, $time: String) {
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

export const GET_MEDIA = gql`
  query ($id: Int!) {
    movieVideos(id: $id) {
      key
      name
      type
    }

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

    moviesCrew(id: $id) {
      id
      name
      job
      gender
      profile_path
    }

    movieImages(id: $id) {
      file_path
      width
      height
    }

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

    tvVideos(id: $id) {
      key
      name
      type
    }

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

    moviesCrew(id: $id) {
      id
      name
      job
      gender
      profile_path
    }

    tvImages(id: $id) {
      file_path
      width
      height
    }

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

export const GET_UPCOMING_MOVIES = gql`
  query ($page: Int) {
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
  query ($page: Int) {
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
  query ($time: String) {
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
  query ($page: Int) {
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
  query ($id: Int!) {
    movieSimilar(id: $id) {
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
  query ($id: Int!) {
    moviesRecommend(id: $id) {
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
  query ($query: String!, $page: String, $lang: String, $year: String) {
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

export const GET_MOVIE_DETAILS = gql`
  query ($id: Int!) {
    movieDetail(id: $id) {
      id
      imdb_id
      title
      overview
      poster_path
      backdrop_path
      genres {
        id
        name
      }
      budget
      release_date
      revenue
      runtime
      vote_average
      vote_count
    }
  }
`;

export const GET_TV_AIRING = gql`
  query ($page: Int) {
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
  query ($time: String) {
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
  query ($page: Int) {
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
  query ($page: Int) {
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
  query ($id: Int!) {
    tvSimilar(id: $id) {
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
  query ($id: Int!) {
    tvRecommend(id: $id) {
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

export const GET_TV_Details = gql`
  query ($id: Int!) {
    tvDetail(id: $id) {
      id
      name
      overview
      poster_path
      backdrop_path
      first_air_date
      last_air_date
      episode_run_time
      number_of_episodes
      number_of_seasons
      popularity
      status
      vote_average
      vote_count
      genres {
        id
        name
      }
      seasons {
        id
        name
        overview
        poster_path
        air_date
        season_number
        episode_count
        vote_average
      }
    }
  }
`;

export const GET_SEASON_DETAILS = gql`
  query ($id: Int!, $number: Int!) {
    seasonDetail(id: $id, number: $number) {
      id
      name
      overview
      poster_path
      air_date
      season_number
      episodes {
        id
        name
        overview
        show_id
        still_path
        vote_average
        vote_count
        runtime
        season_number
        episode_number
        air_date
        crew {
          id
          name
          job
          profile_path
          gender
        }
        guest_stars {
          id
          name
          character
          profile_path
          gender
        }
      }
      vote_average
    }
  }
`;

export const SEARCH_TV = gql`
  query ($query: String!, $page: String, $lang: String, $year: String) {
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

export const GET_GENRES = gql`
  query {
    movieGenres {
      id
      name
    }
    tvGenres {
      id
      name
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

export const GET_CELEBRITY = gql`
  query ($id: Int!) {
    celebrityDetail(id: $id) {
      id
      imdb_id
      biography
      birthday
      deathday
      place_of_birth
    }
    celebrityImages(id: $id) {
      width
      height
      file_path
    }
  }
`;

export const SEARCH_CELEBRITY = gql`
  query ($query: String!, $page: String, $lang: String) {
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
