import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ListIcon from '@mui/icons-material/List';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media, Movie, TV } from '../types/media';
import {
  GET_UPCOMING_MOVIES,
  GET_TV_AIRING,
  GET_POPULAR_MOVIES,
  GET_TV_POPULAR,
} from '../graphql/queries';

type Listprops = {
  title?: string;
  videoID?: string;
  poster?: string;
  listFor?: string;
  info?: Media;
  trending?: Media[];
  containerRef: React.RefObject<HTMLDivElement>;
  setWidth: React.Dispatch<React.SetStateAction<number>>;
};

const List: React.FC<Listprops> = ({
  title,
  listFor,
  containerRef,
  setWidth,
  info,
  trending,
  videoID,
  poster,
}) => {
  const {
    loading: upcomingsLoading,
    error: upcomingsError,
    data: upcomingsData,
  } = useQuery(GET_UPCOMING_MOVIES);
  const {
    loading: popularMoviesLoading,
    error: popularMoviesError,
    data: popularMoviesData,
  } = useQuery(GET_POPULAR_MOVIES);
  const {
    loading: tvAiringLoading,
    error: tvAiringError,
    data: tvAiringData,
  } = useQuery(GET_TV_AIRING);
  const {
    loading: tvPopularLoading,
    error: tvPopularError,
    data: tvPopularData,
  } = useQuery(GET_TV_POPULAR);
  const upcomings: Movie[] = upcomingsData?.upcomingMovies;
  const popularMovies: Movie[] = popularMoviesData?.popularMovies;
  const tvAirings: TV[] = tvAiringData?.tvAiring;
  const tvPopular: TV[] = tvPopularData?.tvPopular;
  const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';
  const navigate = useNavigate();
  let imageURL: any;
  const listData = (() => {
    switch (title) {
      case 'Upcomings Movies':
        return upcomings;
      case 'Popular Movies':
        return popularMovies;
      case 'TV Airings':
        return tvAirings;
      case 'Popular TV':
        return tvPopular;
    }
  })();

  //Get The Image For each List
  if (title === 'Upcomings Movies' && upcomings) {
    imageURL = TMDB_URL + upcomings[0]?.backdrop_path;
  } else if (title === 'TV Airings' && tvAirings) {
    imageURL = TMDB_URL + tvAirings[1]?.backdrop_path;
  } else if (title === 'Popular TV' && tvPopular) {
    imageURL = TMDB_URL + tvPopular[1]?.backdrop_path;
  } else if (title === 'Popular Movies' && popularMovies) {
    imageURL = TMDB_URL + popularMovies[1]?.backdrop_path;
  } else if (poster) {
    imageURL = TMDB_URL + poster;
  }

  const handleResize = (): void => {
    if (containerRef.current) {
      setWidth(containerRef.current.getBoundingClientRect().width);
    }
  };

  //Get the feature container width and height when the app is mount or window gets resized
  useEffect(() => {
    if ((upcomings && popularMovies && tvAirings && tvPopular) || info || poster) {
      if (containerRef.current) {
        setWidth(containerRef.current.getBoundingClientRect().width);
      }
      window.addEventListener('resize', handleResize);
    }
    return (): void => window.removeEventListener('resize', handleResize);
  }, [upcomings, popularMovies, tvAirings, tvPopular, info, poster]);

  const handleTrailer = (): void => {
    navigate('/videos', { state: { data: info, trending: trending, videoID: videoID } });
    window.scrollTo({ top: 0 });
  };

  const handleList = (): void => {
    navigate('/listDetails', { state: { data: listData, title: title } });
  };

  const handleClick = (): void => {
    if (listFor) {
      handleList();
    } else {
      handleTrailer();
    }
  };

  const queries = [
    { loading: upcomingsLoading, error: upcomingsError },
    { loading: popularMoviesLoading, error: popularMoviesError },
    { loading: tvAiringLoading, error: tvAiringError },
    { loading: tvPopularLoading, error: tvPopularError },
  ];

  for (const { loading, error } of queries) {
    if (loading) return <p className='text-white'>Trending Loading...</p>;
    if (error) return <p className='text-white'>Error: {error.message}</p>;
  }
  return (
    <div
      ref={containerRef}
      className='pl-4 cursor-pointer'
      style={{ flex: '0 0 33%' }}
      onClick={handleClick}
    >
      <div className='group/icon relative mb-3 rounded-2xl overflow-hidden'>
        <span className='group-hover/icon:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
        <img
          src={imageURL || TMDB_URL + info?.backdrop_path}
          alt='List Image'
          loading='lazy'
          className='object-cover w-full h-full'
        />
        {info || videoID ? (
          <PlayCircleOutlineIcon
            className='absolute left-1 bottom-1 text-white group-hover/icon:text-primary'
            style={{ fontSize: '2rem' }}
          />
        ) : (
          <ListIcon
            className='absolute left-1 bottom-1 text-white group-hover/icon:text-primary'
            style={{ fontSize: '2rem' }}
          />
        )}
      </div>
      <div>
        <h1 className='text-2xl text-white mb-3 hover:underline'>{title}</h1>
        {info && <p className='text-gray-300'>{info.overview?.slice(0, 90)}...</p>}
      </div>
    </div>
  );
};

export default List;
