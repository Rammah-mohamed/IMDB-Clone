const { gql } = require('apollo-server-express');

const typeDefs = gql`
  interface MotionPicture {
    id: Int!
    overview: String
    poster_path: String
    backdrop_path: String
    genre_ids: [Int]!
    popularity: Float!
    vote_average: String!
    vote_count: String!
  }

  interface Movies {
    title: String
    release_date: String
  }

  interface TVs {
    first_air_date: String
    name: String
  }

  type All implements MotionPicture & Movies & TVs {
    id: Int!
    title: String
    overview: String
    name: String
    poster_path: String
    backdrop_path: String
    release_date: String
    first_air_date: String
    genre_ids: [Int]!
    media_type: String!
    popularity: Float!
    vote_average: String!
    vote_count: String!
  }

  type Movie implements MotionPicture & Movies {
    id: Int!
    title: String!
    overview: String!
    poster_path: String
    backdrop_path: String
    release_date: String
    genre_ids: [Int!]!
    popularity: Float!
    vote_average: String!
    vote_count: String!
  }

  type MovieDetails {
    id: Int!
    imdb_id: String!
    title: String!
    overview: String!
    poster_path: String!
    backdrop_path: String!
    genres: [String!]!
    release_date: String!
    budget: Int
    revenue: Int
    runtime: Int
    vote_average: String!
    vote_count: String!
  }

  type TV implements MotionPicture & TVs {
    id: Int!
    name: String!
    overview: String!
    poster_path: String
    backdrop_path: String
    first_air_date: String
    genre_ids: [Int!]!
    popularity: Float!
    vote_average: String!
    vote_count: String!
  }

  type TVDetails {
    id: Int!
    name: String!
    overview: String!
    poster_path: String
    backdrop_path: String
    first_air_date: String!
    genres: [Genres]
    popularity: Int
    seasons: [Season]!
    last_air_date: String!
    last_episode_to_air: Episode
    next_episode_to_air: Episode
    episode_run_time: [Int]
    number_of_episodes: Int!
    number_of_seasons: Int!
    status: String!
    vote_average: Int
    vote_count: Int
  }

  type Season {
    id: Int!
    name: String!
    overview: String
    poster_path: String
    air_date: String
    episode_count: Int
    season_number: Int
    vote_average: Int
  }

  type SeasonDetail {
    id: Int!
    name: String!
    poster_path: String
    overview: String
    air_date: String!
    episodes: [Episode]
    season_number: Int
    vote_average: Int
  }

  type Cast {
    id: Int!
    name: String!
    gender: Int
    profile_path: String
    known_for_department: String
    character: String
    order: Int
    popularity: Float
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
    show_id: Int
    name: String!
    overview: String!
    still_path: String
    crew: [Crew!]!
    guest_stars: [Guest]
    air_date: String
    season_number: Int!
    episode_number: Int!
    runtime: Int
    vote_average: Int
    vote_count: Int
  }

  type Celebrity {
    id: Int!
    imdb_id: String
    name: String!
    gender: Int
    profile_path: String
    known_for_department: String
    known_for: [All]
    biography: String
    birthday: String
    deathday: String
    place_of_birth: String
    popularity: Float
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
    width: Int
    height: Int
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
    moviesCast(id: Int!): [Cast!]
    moviesCrew(id: Int!): [Crew!]
    searchMovies(query: String!, lang: String, page: String, year: String): [Movie]
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
    tvCast(id: Int!): [Cast!]
    tvCrew(id: Int!): [Crew!]
    tvGenres: [Genres!]!
    searchTV(query: String!, lang: String, page: String, year: String): [TV!]!
    seasonDetail(id: Int!, number: Int!): SeasonDetail!
    seasonImages(id: Int!, number: Int!): [Images!]
    seasonVideos(id: Int!, number: Int!): [Videos!]
    episodeDetail(id: Int!, season: Int!, number: Int!): Episode!
    episodeImages(id: Int!, season: Int!, number: Int!): [Images!]
    episodeVideos(id: Int!, season: Int!, number: Int!): [Videos!]
    trendingCelebrity(time: String): [Celebrity]!
    popularCelebrity: [Celebrity!]!
    celebrityDetail(id: Int!): Celebrity!
    celebrityImages(id: Int!): [Images!]!
    searchCelebrity(query: String!, lang: String, page: String): [Celebrity]
  }
`;

module.exports = typeDefs;
