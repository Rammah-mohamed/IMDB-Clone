const { gql } = require('apollo-server-express');

const typeDefs = gql`
  interface MotionPicture {
    backdrop_path: String
    genre_ids: [Int!]!
    id: Int!
    overview: String!
    popularity: Float!
    poster_path: String
    vote_average: String!
    vote_count: String!
  }

  interface Movies {
    release_date: String
    title: String
  }

  interface TVs {
    first_air_date: String
    name: String
  }

  type All implements MotionPicture & Movies & TVs {
    backdrop_path: String
    genre_ids: [Int!]!
    id: Int!
    overview: String!
    popularity: Float!
    poster_path: String
    vote_average: String!
    vote_count: String!
    media_type: String!
    release_date: String
    title: String
    first_air_date: String
    name: String
  }

  type Movie implements MotionPicture & Movies {
    backdrop_path: String
    genre_ids: [Int!]!
    id: Int!
    overview: String!
    popularity: Float!
    poster_path: String
    vote_average: String!
    vote_count: String!
    release_date: String
    title: String!
  }

  type MovieDetails {
    backdrop_path: String!
    budget: Int!
    id: Int!
    imdb_id: String!
    title: String!
    overview: String!
    poster_path: String!
    genres: [String!]!
    release_date: String!
    revenue: Int!
    runtime: Int!
    vote_average: String!
    vote_count: String!
  }

  type TV implements MotionPicture & TVs {
    backdrop_path: String
    genre_ids: [Int!]!
    id: Int!
    overview: String!
    popularity: Float!
    poster_path: String
    vote_average: String!
    vote_count: String!
    first_air_date: String!
    name: String!
  }

  type TVDetails {
    backdrop_path: String!
    episode_run_time: [Int]
    first_air_date: String!
    genres: [Genres]
    id: Int!
    last_air_date: String!
    last_episode_to_air: Episode
    name: String!
    next_episode_to_air: Episode
    number_of_episodes: Int!
    number_of_seasons: Int!
    overview: String!
    popularity: Int
    poster_path: String!
    seasons: [Season]!
    status: String!
    vote_average: Int
    vote_count: Int
  }

  type Season {
    air_date: String
    episode_count: Int
    id: Int!
    name: String!
    overview: String
    poster_path: String
    season_number: Int
    vote_average: Int
  }

  type SeasonDetail {
    air_date: String!
    episodes: [Episode]
    name: String!
    id: Int!
    overview: String
    poster_path: String
    season_number: Int
    vote_average: Int
  }

  type Crew {
    id: Int!
    name: String!
    job: String!
    gender: Int
    profile_path: String
  }

  type Guest {
    id: Int!
    name: String!
    character: String
    gender: Int
    profile_path: String
  }

  type Episode {
    id: Int!
    name: String!
    overview: String!
    crew: [Crew!]!
    guest_stars: [Guest!]
    vote_average: Int
    vote_count: Int
    air_date: String!
    episode_number: Int
    runtime: Int
    season_number: Int
    show_id: Int
    still_path: String
  }

  type People {
    id: Int!
    imdb_id: String!
    name: String!
    gender: Int
    biography: String
    birthday: String
    deathday: String
    place_of_birth: String
    popularity: Float
    known_for_department: String!
    profile_path: String!
    known_for: [Movie]
  }

  type AuthorDetail {
    avatar_path: String
    rating: Int
  }

  type Review {
    author: String
    author_details: AuthorDetail
    content: String
    created_at: String
    updated_at: String
    url: String
  }

  type Genres {
    id: Int!
    name: String!
  }

  type Images {
    file_path: String!
  }

  type Videos {
    name: String!
    key: String!
    type: String!
    published_at: String!
  }

  type Query {
    trendingAll(time: String): [All]!
    searchMulti(query: String!, lang: String, page: String): [All]!
    trendingMovies(time: String): [Movie]!
    popularMovies: [Movie]!
    upcomingMovies: [Movie]!
    topMovies: [Movie]!
    movieDetail(id: Int!): MovieDetails
    movieSimilar(id: Int!, page: Int): [Movie]!
    movieReview(id: Int!, page: Int): [Review]
    movieImages(id: Int!): [Images!]
    movieVideos(id: Int!): [Videos!]
    movieGenres: [Genres!]!
    moviesRecommend(id: Int!): [Movie]!
    searchMovies(
      query: String!
      lang: String
      page: String
      year: String
    ): [Movie]
    trendingTV(time: String): [TV]!
    tvAiring(page: String): [TV!]!
    tvPopular(page: String): [TV!]!
    topTv(page: String): [TV!]!
    tvDetail(id: Int!): TVDetails
    tvSimilar(id: Int!, page: Int): [TV]!
    tvReview(id: Int!, page: Int): [Review]
    tvImages(id: Int!): [Images!]
    tvVideos(id: Int!): [Videos!]
    tvRecommend(id: Int!): [TV]!
    tvGenres: [Genres!]!
    searchTV(query: String!, lang: String, page: String, year: String): [TV!]!
    seasonDetail(id: Int!, number: Int!): SeasonDetail!
    seasonImages(id: Int!, number: Int!): [Images!]
    seasonVideos(id: Int!, number: Int!): [Videos!]
    episodeDetail(id: Int!, season: Int!, number: Int!): Episode!
    episodeImages(id: Int!, season: Int!, number: Int!): [Images!]
    episodeVideos(id: Int!, season: Int!, number: Int!): [Videos!]
    trendingPeople(time: String): [People]!
    popularPeople: [People!]!
    peopleDetail(id: Int!): People!
    peopleImages(id: Int!): [Images!]!
    searchPeople(query: String!, lang: String, page: String): [People]
  }
`;

module.exports = typeDefs;
