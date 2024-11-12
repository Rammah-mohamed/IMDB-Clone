import { useEffect, useRef, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import {
  GET_POPULAR_MOVIES,
  GET_RECOMMEND_MOVIES,
  GET_SIMILAR_MOVIES,
  GET_TRENDING,
  GET_TV_AIRING,
  GET_TV_POPULAR,
  GET_TV_RECOMMEND,
  GET_TV_SIMILAR,
  GET_UPCOMING_MOVIES,
} from '../graphql/queries';
import { Media } from '../types/media';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';

type ListProps = {
  id?: number;
  title: string;
  mediaType?: string;
};

const MediaList: React.FC<ListProps> = ({ id, title, mediaType }) => {
  const [data, setData] = useState<Media[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLDivElement>(null);
  const {
    loading: trendingLoading,
    error: trendingError,
    data: trendingData,
  } = useQuery(GET_TRENDING);
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
  const [
    getSimilarMovies,
    { loading: similarMoviesLoading, error: similarMoviesError, data: _movieSimlarData },
  ] = useLazyQuery(GET_SIMILAR_MOVIES);
  const [
    getRecommendMovies,
    { loading: recommendMoviesLoading, error: recommendMoviesError, data: _movieRecommendData },
  ] = useLazyQuery(GET_RECOMMEND_MOVIES);
  const {
    loading: tvAiringsLoading,
    error: tvAiringsError,
    data: tvAiringsData,
  } = useQuery(GET_TV_AIRING);
  const {
    loading: tvPopularLoading,
    error: tvPopularError,
    data: tvPopularData,
  } = useQuery(GET_TV_POPULAR);
  const [getTvSimilar, { loading: tvSimilarLoading, error: tvSimilarError, data: _tvSimilarData }] =
    useLazyQuery(GET_TV_SIMILAR);
  const [
    getTvRecommend,
    { loading: tvRecommendLoading, error: tvRecommendError, data: _tvRecommendData },
  ] = useLazyQuery(GET_TV_RECOMMEND);
  const navigate = useNavigate();
  const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';
  let count = 0;

  const handleData = (title: string): void => {
    if (title === 'Trendings') {
      setData(trendingData?.trendingAll);
    } else if (title === 'Upcomings Movies') {
      setData(upcomingsData?.upcomingMovies);
    } else if (title === 'Popular Movies') {
      setData(popularMoviesData?.popularMovies);
    } else if (title === 'TV Airings') {
      setData(tvAiringsData?.tvAiring);
    } else if (title === 'Popular TV Shows') {
      setData(tvPopularData?.tvPopular);
    }
    if (title === 'Similar') {
      if (mediaType === 'movie') {
        getSimilarMovies({ variables: { id: id } }).then((response) => {
          setData(response?.data?.movieSimilar);
        });
      } else {
        getTvSimilar({ variables: { id: id } }).then((response) => {
          setData(response?.data?.tvSimilar);
        });
      }
    }
    if (title === 'Recommend') {
      if (mediaType === 'movie') {
        getRecommendMovies({ variables: { id: id } }).then((response) => {
          setData(response?.data?.moviesRecommend);
        });
      } else {
        getTvRecommend({ variables: { id: id } }).then((response) => {
          setData(response?.data?.tvRecommend);
        });
      }
    }
  };

  useEffect(() => {
    if (
      trendingData &&
      upcomingsData &&
      popularMoviesData &&
      tvAiringsData &&
      tvPopularData &&
      count === 0
    ) {
      handleData(title);
    }
    count++;
  }, [trendingData, upcomingsData, popularMoviesData, tvAiringsData, tvPopularData]);

  const handleResize = (): void => {
    if (containerRef.current && heightRef.current) {
      setWidth(containerRef.current.getBoundingClientRect().width);
      setHeight(heightRef.current.getBoundingClientRect().height);
    }
  };

  //Get the feature container width and height when the app is mount or window gets resized
  useEffect(() => {
    if (data && containerRef.current && heightRef.current) {
      setWidth(containerRef.current.getBoundingClientRect().width);
      setHeight(heightRef.current.getBoundingClientRect().height);
      window.addEventListener('resize', handleResize);
    }
    return (): void => window.removeEventListener('resize', handleResize);
  }, [data]);

  const handleRight = (dataArray: Media[]): void => {
    setIndex((prev) => (prev !== dataArray.length - 6 ? prev + 1 : 0));
  };

  const handleLeft = (dataArray: Media[]): void => {
    setIndex((prev) => (prev !== 0 ? prev - 1 : dataArray.length - 6));
  };

  const handleDetails = (media: Media): void => {
    navigate('/mediaDetail', { state: media });
  };

  const queries = [
    { loading: trendingLoading, error: trendingError },
    { loading: upcomingsLoading, error: upcomingsError },
    { loading: popularMoviesLoading, error: popularMoviesError },
    { loading: similarMoviesLoading, error: similarMoviesError },
    { loading: recommendMoviesLoading, error: recommendMoviesError },
    { loading: tvAiringsLoading, error: tvAiringsError },
    { loading: tvPopularLoading, error: tvPopularError },
    { loading: tvSimilarLoading, error: tvSimilarError },
    { loading: tvRecommendLoading, error: tvRecommendError },
  ];

  for (const { loading, error } of queries) {
    if (loading) return <p className='text-white'>Trending Loading...</p>;
    if (error) return <p className='text-white'>Error: {error.message}</p>;
  }
  return (
    <div className='container flex flex-col gap-3 py-3'>
      <h1
        className={`${
          mediaType ? 'text-4xl text-black' : 'text-2xl text-white'
        } font-semibold pl-3 mt-10 border-l-4 border-primary`}
      >
        {title}
      </h1>
      <div className='relative group overflow-hidden'>
        {height !== 0 && (
          <>
            <button
              className={`absolute top-1/2 left-4 p-3 ${
                mediaType ? 'text-gray-200' : 'text-white'
              } hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block`}
              style={{ top: `${height / 2}px`, transform: 'translateY(-50%)' }}
              onClick={() => handleLeft(data)}
            >
              <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
            </button>
            <button
              className={`absolute top-1/2 right-4 p-3 ${
                mediaType ? 'text-gray-200' : 'text-white'
              } hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block`}
              style={{ top: `${height / 2}px`, transform: 'translateY(-50%)' }}
              onClick={() => handleRight(data)}
            >
              <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
            </button>
          </>
        )}
        <div
          className='flex items-center gap-4 transition-transform duration-500'
          style={{
            transform: `translateX(${-(width * index + 16 * index)}px)`,
          }}
        >
          {data?.map((m: Media) => (
            <div
              key={m?.id}
              ref={containerRef}
              className='flex flex-col cursor-pointer'
              onClick={(): void => handleDetails(m)}
            >
              <div
                ref={heightRef}
                className='relative group/item h-72 rounded-xl rounded-b-none overflow-hidden'
                style={{ width: '12.16rem' }}
              >
                <span className='group-hover/item:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                <AddIcon
                  className='absolute top-0 left-0 bg-black-transparent text-white'
                  style={{ fontSize: '2.5rem' }}
                />
                <img
                  src={TMDB_URL + m?.poster_path}
                  alt='poster'
                  loading='lazy'
                  className='object-cover w-full h-full'
                />
              </div>
              <div
                className={`flex flex-1 flex-col gap-3 p-4 ${
                  mediaType ? 'text-black bg-gray-200' : 'text-white bg-black-100'
                } rounded-xl rounded-t-none overflow-hidden`}
              >
                <div className='flex items-center gap-2'>
                  <div className='flex items-center'>
                    <StarIcon className='text-primary' />
                    <span>{m?.vote_average}</span>
                  </div>
                  <StarOutlineIcon />
                </div>
                <h1 className='text-base min-h-12'>{m?.title || m?.name}</h1>
                <button
                  className={`flex items-center justify-center gap-2 p-1 text-secondary ${
                    mediaType ? 'bg-gray-250' : 'bg-gray-400'
                  } rounded-2xl cursor-pointer`}
                >
                  <AddIcon />
                  <span>Watchlist</span>
                </button>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <PlayArrowIcon />
                    <span>Trailer</span>
                  </div>
                  <ErrorOutlineIcon />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaList;
