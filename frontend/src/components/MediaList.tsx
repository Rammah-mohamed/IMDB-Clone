import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useLazyQuery, useQuery } from '@apollo/client';
import { Media } from '../types/media';
import {
  GET_LIST_MEDIA,
  GET_RECOMMEND_MOVIES,
  GET_SIMILAR_MOVIES,
  GET_TV_RECOMMEND,
  GET_TV_SIMILAR,
} from '../graphql/queries';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import getImageUrl from '../utils/getImages';

// Type for Media list props
type ListProps = {
  id?: number;
  title: string;
  mediaType?: string;
};

//Types for each query's return value
interface QueryResult {
  fetch: (variables?: Record<string, any>) => Promise<any>;
  loading: boolean;
  error: any;
  data: any;
}

// Type for the accumulator object (queries)
interface Queries {
  [key: string]: QueryResult;
}

// GraphQL queries
const QUERY_CONFIG = {
  recommendMovies: GET_RECOMMEND_MOVIES,
  similarMovies: GET_SIMILAR_MOVIES,
  tvRecommend: GET_TV_RECOMMEND,
  tvSimilar: GET_TV_SIMILAR,
};

const MediaList: React.FC<ListProps> = React.memo(({ id, title, mediaType }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize state hooks
  const [data, setData] = useState<Media[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);

  // Initialize Ref hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLDivElement>(null);

  // Handle GraphQL query
  const {
    data: listMediaData,
    loading: listLoading,
    error: listError,
  } = useQuery(GET_LIST_MEDIA, {
    fetchPolicy: 'cache-first',
  });

  // Custom hook to Handle GraphQl Queries
  const useRecommendAndSimilarQueries = useCallback(() => {
    const queries: Queries = Object.entries(QUERY_CONFIG).reduce((acc, [key, query]) => {
      const [fetch, { loading, error, data }] = useLazyQuery(query);
      acc[key] = {
        fetch: async (variables?: Record<string, any>) => {
          const result = await fetch({ variables });
          return result;
        },
        loading,
        error,
        data,
      };
      return acc;
    }, {} as Queries);

    return queries;
  }, [QUERY_CONFIG]);

  const { recommendMovies, similarMovies, tvRecommend, tvSimilar } =
    useRecommendAndSimilarQueries();

  // Responsive container
  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch user Watchlist
  const fetchWatchlist = useCallback(async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_MONGODB_API}/lists/Your_Watchlist`, {
        withCredentials: true,
      });
      setData(data?.movies || []);
    } catch (error: any) {
      console.error(error?.response?.data || 'An error occurred while fetching the list');
    }
  }, []);

  useEffect(() => {
    if (user && title === 'From your watchlist') {
      fetchWatchlist();
    }
  }, [user, fetchWatchlist]);

  // Handle list Data
  const handleData = async (title: string): Promise<void> => {
    const mediaMappings: { [key: string]: any } = {
      Trendings: listMediaData?.trendingAll,
      'Upcomings Movies': listMediaData?.upcomingMovies,
      'Popular Movies': listMediaData?.popularMovies,
      'TV Airings': listMediaData?.tvAiring,
      'Popular TV Shows': listMediaData?.tvPopular,
    };

    // Handle direct mappings
    if (mediaMappings[title]) {
      setData(mediaMappings[title]);
      return;
    }

    // Handle API fetch cases
    if (title === 'Similar') {
      const fetchData =
        mediaType === 'movie' ? similarMovies.fetch({ id }) : tvSimilar.fetch({ id });

      const response = await fetchData;
      setData(mediaType === 'movie' ? response?.data?.movieSimilar : response?.data?.tvSimilar);
      return;
    }

    if (title === 'Recommend') {
      const fetchData =
        mediaType === 'movie' ? recommendMovies.fetch({ id }) : tvRecommend.fetch({ id });

      const response = await fetchData;
      setData(
        mediaType === 'movie' ? response?.data?.moviesRecommend : response?.data?.tvRecommend
      );
    }
  };

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (listMediaData && !hasInitialized.current) {
      handleData(title);
      hasInitialized.current = true;
    }
  }, [listMediaData, title]);

  // Handle list resizing
  const handleResize = useCallback((): void => {
    if (containerRef.current && heightRef.current) {
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const containerHeight = heightRef.current.getBoundingClientRect().height;
      setWidth(containerWidth);
      setHeight(containerHeight);
    }
  }, []);

  // Debounce function
  function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }

  useEffect(() => {
    if (data?.length !== 0) {
      handleResize();
      const debouncedResize = debounce(handleResize, 200);
      window.addEventListener('resize', debouncedResize);
      return () => window.removeEventListener('resize', debouncedResize);
    }
  }, [data, handleResize]);

  // Handle list Horizental scrolling
  const updateIndex = (direction: 'right' | 'left', dataArray: Media[]): void => {
    setIndex((prevIndex) => {
      const maxIndex = dataArray.length - 6;
      if (direction === 'right') {
        return prevIndex < maxIndex ? prevIndex + 1 : 0;
      }
      if (direction === 'left') {
        return prevIndex > 0 ? prevIndex - 1 : maxIndex;
      }
      return prevIndex; // Fallback for invalid direction
    });
  };

  const handleRight = (dataArray: Media[]): void => {
    updateIndex('right', dataArray);
  };

  const handleLeft = (dataArray: Media[]): void => {
    updateIndex('left', dataArray);
  };

  // Sync User watchlist in the database to the current list
  useEffect(() => {
    if (!user) return;
    const getUserMovies = async () => {
      try {
        const { data } = await axios.get<{ movies: Media[] }>(
          `${import.meta.env.VITE_MONGODB_API}/lists/Your_Watchlist`,
          { withCredentials: true }
        );

        setData((prevMovies) =>
          prevMovies?.map((movie) => {
            const isAdded = data.movies?.some(
              (watchlistMovie) => watchlistMovie.isAdded && Number(watchlistMovie.id) === movie.id
            );
            return isAdded ? { ...movie, isAdded: true } : movie;
          })
        );
      } catch (error: unknown) {
        console.error(
          'Error fetching user watchlist:',
          axios.isAxiosError(error) && error.response
            ? error.response.data
            : (error as Error).message
        );
      }
    };
    if (user) {
      getUserMovies();
    }
  }, [user]);

  //Add and delete to the watchlist
  const handleAddToWatchList = async (e: React.MouseEvent, media: Media) => {
    e.stopPropagation();

    if (!user) {
      navigate('/sign');
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_MONGODB_API}/lists/Your_Watchlist/${media.id}`;
      const config = { withCredentials: true };

      if (media.isAdded) {
        // Remove from watchlist
        const { data } = await axios.delete(apiUrl, config);
        console.log('Removed from Watchlist:', data);

        // Update state
        setData((prev) =>
          prev?.map((item) => (item.id === media.id ? { ...item, isAdded: false } : item))
        );
      } else {
        // Add to watchlist
        const { data: updatedData } = await axios.put(apiUrl, { ...media, isAdded: true }, config);
        console.log('Added to Watchlist:', updatedData);

        // Update state
        setData((prev) =>
          prev?.map((item) => (item.id === media.id ? { ...item, isAdded: true } : item))
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected Error:', (error as Error).message);
      }
    }
  };

  // Navigate to media details page
  const handleDetails = (e: React.MouseEvent, media: Media): void => {
    e.stopPropagation();
    navigate('/mediaDetail', { state: media });
    window.scrollTo({ top: 0 });
  };

  // Loading and error states
  if (listLoading)
    return (
      <div
        role='status'
        className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'
      ></div>
    );

  if (listError) return <div className='text-white text-sm'>Error: {listError?.message}</div>;
  return (
    data &&
    data?.length !== 0 && (
      <div
        className={`container flex flex-col gap-6 py-3 max-md:py-1 ${
          title === 'Popular TV Shows' ? 'max-lg:mb-20' : ''
        }  ${title === 'Popular TV Shows' && 'pb-36'}`}
        style={{ height: containerWidth > 768 ? '38rem' : '34rem' }}
      >
        <h1
          className={`${
            mediaType
              ? 'text-4xl max-lg:text-3xl max-md:text-2xl text-black'
              : 'text-2xl max-lg:text-xl max-md:text-lg text-white'
          } w-full h-10 font-semibold pl-3 mt-10 border-l-4 border-primary`}
        >
          {title}
        </h1>
        <div className='w-full h-full relative group overflow-hidden'>
          {height !== 0 && (
            <>
              <button
                className={`absolute top-1/2 left-4 p-3  max-md:p-1.5 ${
                  mediaType ? 'text-gray-200' : 'text-white'
                } hover:text-primary z-30 border-2 border-solid rounded-md hidden max-lg:block group-hover:block`}
                style={{ top: `${height / 2}px`, transform: 'translateY(-50%)' }}
                onClick={() => handleLeft(data)}
              >
                <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
              </button>
              <button
                className={`absolute top-1/2 right-4 p-3 max-md:p-1.5 ${
                  mediaType ? 'text-gray-200' : 'text-white'
                } hover:text-primary z-30 border-2 border-solid rounded-md hidden max-lg:block group-hover:block`}
                style={{ top: `${height / 2}px`, transform: 'translateY(-50%)' }}
                onClick={() => handleRight(data)}
              >
                <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
              </button>
            </>
          )}
          <div
            className='flex items-center gap-4 max-md:gap-2 h-full transition-transform duration-500'
            style={{
              transform: `translateX(${-(
                width * index +
                (containerWidth < 768 ? 8 : 16) * index
              )}px)`,
            }}
          >
            {data?.length !== 0 &&
              data?.map((m: Media, idx) => (
                <div
                  key={m?.id}
                  ref={containerRef}
                  className='flex flex-col h-full cursor-pointer'
                  onClick={(e): void => handleDetails(e, m)}
                >
                  <div
                    ref={heightRef}
                    className='relative group/item h-72 max-md:h-64 rounded-xl max-md:rounded-md rounded-b-none overflow-hidden'
                    style={{ width: containerWidth > 768 ? '12.16rem' : '11.5rem' }}
                  >
                    <span className='group-hover/item:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                    <AddIcon
                      data-testid='addBtn'
                      className={`absolute top-0 left-0 ${
                        user && m?.isAdded
                          ? 'bg-primary text-black-100'
                          : 'bg-black-transparent text-white'
                      } z-30`}
                      style={{ fontSize: '2.5rem' }}
                      onClick={(e) => handleAddToWatchList(e, m)}
                    />
                    <LazyLoadImage
                      src={getImageUrl(m?.poster_path, 'w342')}
                      alt='poster'
                      loading={idx <= 5 ? 'eager' : 'lazy'}
                      className='object-cover w-full h-full'
                    />
                  </div>
                  <div
                    className={`flex flex-1 flex-col gap-3 p-4 max-md:gap-2 max-md:p-3 ${
                      mediaType ? 'text-black bg-gray-250' : 'text-white bg-black-100'
                    } rounded-xl rounded-t-none overflow-hidden`}
                  >
                    <div className='flex items-center gap-2'>
                      <div className='flex items-center'>
                        <StarIcon className='text-primary' />
                        <span>{m?.vote_average}</span>
                      </div>
                      <StarOutlineIcon />
                    </div>
                    <h1 className='text-base min-h-12 max-md:min-h-10'>{m?.title || m?.name}</h1>
                    <button
                      className={`flex items-center justify-center gap-2 p-1 text-secondary ${
                        mediaType ? 'bg-gray-light300' : 'bg-gray-400'
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
    )
  );
});

export default MediaList;
