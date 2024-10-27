import { useLazyQuery, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import {
  GET_MOVIE_GENRES,
  GET_MOVIE_TRAILER,
  GET_TV_GENRES,
  GET_TV_TRAILER,
} from '../graphql/queries';
import ReactPlayer from 'react-player';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Lists from '../components/Lists';

type Video = {
  name?: string;
  title?: string;
  id: number;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  popularity: number;
  media_type: string;
  genre_ids: number[];
  first_air_date?: string;
};

type Genre = {
  id: number;
  name: string;
};

type Trailer = {
  key: string;
  name: string;
  type: string;
};

const Videos = () => {
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const {
    loading: tvGenresLoading,
    error: tvGenresError,
    data: tvGenresData,
  } = useQuery(GET_TV_GENRES);
  const {
    loading: movieGenresLoading,
    error: movieGenresError,
    data: movieGenresData,
  } = useQuery(GET_MOVIE_GENRES);
  const [
    getMovieTrailer,
    { loading: movieTrailerLoading, error: movieTrailerError, data: movieTrailerData },
  ] = useLazyQuery(GET_MOVIE_TRAILER);
  const [getTvTrailer, { loading: tvTrailerLoading, error: tvTrailerError, data: tvTrailerData }] =
    useLazyQuery(GET_TV_TRAILER);
  const movieGenres: Genre[] = movieGenresData?.movieGenres;
  const tvGenres: Genre[] = tvGenresData?.tvGenres;
  const movieTrailer: Trailer[] = movieTrailerData?.movieVideos;
  const tvTrailer: Trailer[] = tvTrailerData?.tvVideos;
  const YOUTUBE_URL = 'https://www.youtube.com/watch?v=';
  const TMDB_URL: String = 'https://image.tmdb.org/t/p/original';
  const location = useLocation();
  const data = location.state.data;
  const trending = location.state.trending;
  const videoID = location.state.videoID;
  const [videoData, setVideoData] = useState<Video | null>((): Video | null => {
    const savedData = localStorage.getItem('video') ?? '';
    return savedData ? JSON.parse(savedData) : null;
  });

  const getMovieGenras = (array: number[]): string[] => {
    for (let i = 0; i < array.length; i++) {
      movieGenres?.map((g) => (g.id === array[i] ? setGenres((prev) => [...prev, g.name]) : null));
    }
    return genres;
  };

  const getTVGenras = (array: number[]): string[] => {
    for (let i = 0; i < array.length; i++) {
      tvGenres?.map((g) => (g.id === array[i] ? setGenres((prev) => [...prev, g.name]) : null));
    }
    return genres;
  };

  useEffect(() => {
    if (data?.media_type === 'movie' || videoData?.media_type === 'movie') {
      genres.length === 0 && getMovieGenras(data?.genre_ids || videoData?.genre_ids);
    } else {
      genres.length === 0 && getTVGenras(data?.genre_ids || videoData?.genre_ids);
    }
  }, [movieGenres, tvGenres, data, videoData]);

  useEffect(() => {
    if (data) {
      localStorage.setItem('video', JSON.stringify(data));
      setVideoData(data);
    }
  }, [data]);

  const handleMovieTrailer = (id: number): void => {
    getMovieTrailer({ variables: { id: id } });
  };

  const handleTvTrailer = (id: number): void => {
    getTvTrailer({ variables: { id: id } });
  };

  //Set the trailer data depending on the trailer is it movie or tv show
  const getTrailer = (): void => {
    if (movieTrailer) {
      movieTrailer.forEach(
        (t) => t.type === 'Trailer' && setTrailer({ key: t.key, name: t.name, type: t.type })
      );
    } else if (tvTrailer) {
      tvTrailer.forEach(
        (t) => t.type === 'Trailer' && setTrailer({ key: t.key, name: t.name, type: t.type })
      );
    }
  };

  //Get Media videos data depending of it's type movie or tv show
  useEffect(() => {
    if (data) {
      data.media_type === 'movie' ? handleMovieTrailer(data.id) : handleTvTrailer(data.id);
    } else if (videoData) {
      videoData.media_type === 'movie'
        ? handleMovieTrailer(videoData.id)
        : handleTvTrailer(videoData.id);
    }
    getTrailer();
  }, [data, videoData, movieTrailer, tvTrailer]);

  if (movieTrailerLoading) return <p className="text-white">Movie Trailer Loading...</p>;
  if (movieTrailerError) return <p className="text-white">Error: {movieTrailerError.message}</p>;
  if (tvTrailerLoading) return <p className="text-white">TV Trailer Loading...</p>;
  if (tvTrailerError) return <p className="text-white">Error: {tvTrailerError.message}</p>;
  if (movieGenresLoading) return <p className="text-white">Movie Geres Loading...</p>;
  if (movieGenresError) return <p className="text-white">Error: {movieGenresError.message}</p>;
  if (tvGenresLoading) return <p className="text-white">TV Genres Loading...</p>;
  if (tvGenresError) return <p className="text-white">Error: {tvGenresError.message}</p>;
  return (
    <div className="bg-black">
      <Navbar />
      <div className="container flex gap-2 pt-8 mb-10 text-white" style={{ height: '85vh' }}>
        <div className="group relative flex-2 mb-4 rounded-2xl overflow-hidden">
          <Link
            to={'/'}
            className="absolute left-3 top-3 p-3 bg-black-100 rounded-full z-30  opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <CloseIcon style={{ fontSize: '2rem' }} />
          </Link>
          <ReactPlayer
            url={`${YOUTUBE_URL}${videoID ? videoID : trailer?.key}`}
            width={'100%'}
            height={'100%'}
            controls={true}
            playing={true}
          />
        </div>
        <div className="flex-1 flex flex-col gap-6 p-5 mb-4 bg-black-100 rounded-2xl">
          <div className="relative flex gap-2 pb-6 border-b-2 border-gray-300">
            <div className="group relative w-24 h-36 overflow-hidden rounded-xl cursor-pointer">
              <span className="group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20"></span>
              <AddIcon
                className="absolute top-0 left-0 bg-black-transparent "
                style={{ fontSize: '1.5rem' }}
              />
              <img
                src={TMDB_URL + (data?.poster_path || videoData?.poster_path)}
                alt={
                  data?.media_type === 'movie' || (videoData && videoData?.media_type === 'movie')
                    ? 'Movie Poster'
                    : 'TV Show Poster'
                }
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col gap-2 font-semibold">
              <h2>
                {data?.media_type === 'movie' || (videoData && videoData?.media_type === 'movie')
                  ? data?.title || videoData?.title
                  : data?.name || videoData?.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                {genres.map((g: string, index: number) => (
                  <p key={index}>{g}</p>
                ))}
              </div>
            </div>
            <KeyboardArrowRightIcon className="absolute right-3 top-0" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{trailer?.name}</h1>
            <p className="text-gray-200">{data?.overview || videoData?.overview}</p>
          </div>
        </div>
      </div>
      <Lists title={'Featured Videos'} data={trending} />
      <Lists
        title={'Related Videos'}
        data={trending}
        relatedVideos={movieTrailer || tvTrailer}
        poster={data?.backdrop_path || videoData?.backdrop_path}
      />
    </div>
  );
};

export default Videos;
