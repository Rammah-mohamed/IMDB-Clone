export type Media = {
  id: number;
  name?: string;
  title?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  genre_ids: number[];
  release_date?: string;
  first_air_date?: string;
  media_type: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  __typename: string;
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
  vote_average: number;
  vote_count: number;
  __typename: string;
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
