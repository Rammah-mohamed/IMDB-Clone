export type Multi = {
  id: number;
  name?: string;
  title?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  genre_ids?: number[];
  release_date?: string;
  first_air_date?: string;
  media_type: string;
  vote_average?: string;
  vote_count?: string;
  gender?: number;
  profile_path?: string;
  popularity?: number;
  known_for_department?: string;
  known_for?: [Media];
  __typename: string;
};

export type Media = {
  id: number;
  name?: string;
  title?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  genre_ids?: number[];
  release_date?: string;
  first_air_date?: string;
  media_type: string;
  popularity: number;
  vote_average: string;
  vote_count: string;
  isAdded: boolean;
  __typename: string;
  _id: string;
};

export type Details = {
  id: number;
  imdb_id: string;
  name?: string;
  title?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  genre_ids?: number[];
  genres: Genre[];
  release_date?: string;
  first_air_date?: string;
  last_air_date: string;
  media_type: string;
  popularity: number;
  vote_average: string;
  vote_count: string;
  isAdded: boolean;
  budget: string;
  revenue: number;
  runtime: number;
  seasons: Season[];
  episode_run_time: string;
  number_of_episodes: number;
  number_of_seasons: number;
  status: string;
  __typename: string;
  _id: string;
};

export type Movie = {
  id: number;
  name: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  popularity: number;
  vote_average: string;
  vote_count: string;
  release_date: string;
  genre_ids: number[];
  media_type: string;
  first_air_date: string;
  __typename: string;
};

export type TV = {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[];
  popularity: number;
  vote_average: string;
  vote_count: string;
  __typename: string;
};

type Season = {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  air_date: string;
  season_number: number;
  episode_count: string;
  vote_average: string;
};

export type Season_Details = {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  air_date: string;
  season_number: number;
  episodes: Episode[];
  vote_average: string;
};

export type Episode = {
  id: number;
  name: string;
  overview: string;
  show_id: string;
  still_path: string;
  vote_average: string;
  vote_count: string;
  runtime: string;
  season_number: number;
  episode_number: string;
  air_date: string;
  crew: Star;
  guest_stars: Star;
};

type Star = {
  id: number;
  name: string;
  job: string;
  profile_path: string;
  gender: string;
};

export type Genre = {
  id: number;
  name: string;
};

export type Trailer = {
  key: string;
  name: string;
  type: string;
};

export type Celebrity = {
  name: string;
  id: number;
  gender: number;
  profile_path: string;
  biography: string;
  birthday: string;
  deathday: string;
  place_of_birth: string;
  popularity: number;
  known_for_department: string;
  known_for: [Media];
};

export type Photo = {
  width: number;
  height: number;
  file_path: string;
};

export type Cast = {
  id: number;
  name: string;
  gender: number;
  popularity: number;
  known_for_department: string;
  profile_path: string;
  character: string;
  order: number;
};

export type Crew = {
  id: number;
  name: string;
  job: string;
  gender: number;
  profile_path: string;
};

export type CastState = {
  id: number;
  type: 'Movie' | 'TV';
  star: Cast[] | null;
  crew: Crew[] | null;
};

export type View = {
  details: boolean;
  grid: boolean;
  compact: boolean;
};

export type AuthorDetails = {
  avatar_path: string;
  rating: number;
};

export type Review = {
  author: string;
  author_details: AuthorDetails;
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
};

export type List = {
  name: string;
  description?: string;
  movies: Media[];
};
