import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media, Movie, TV } from '../types/media';
import { useQuery } from '@apollo/client';
import { GET_LIST_MEDIA } from '../graphql/queries';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ListIcon from '@mui/icons-material/List';

// Type for list props
type ListProps = {
  title?: string;
  videoID?: string;
  poster?: string;
  listFor?: string;
  info?: Media;
  trending?: Media[];
  containerRef: React.RefObject<HTMLDivElement>;
  setWidth: React.Dispatch<React.SetStateAction<number>>;
};

// TMDB API base image URL (static)
const TMDB_URL = 'https://image.tmdb.org/t/p/';

const List: React.FC<ListProps> = React.memo(
  ({ title, listFor, containerRef, setWidth, info, trending, videoID, poster }) => {
    const navigate = useNavigate();

    // GraphQL Query
    const {
      data: listMediaData,
      loading: listLoading,
      error: listError,
    } = useQuery(GET_LIST_MEDIA, {
      fetchPolicy: 'cache-first',
    });

    // Extract lists based on GraphQL query results
    const upcomings: Movie[] = listMediaData?.upcomingMovies || [];
    const popularMovies: Movie[] = listMediaData?.popularMovies || [];
    const tvAirings: TV[] = listMediaData?.tvAiring || [];
    const tvPopular: TV[] = listMediaData?.tvPopular || [];

    // Determine the list data based on the `title` prop
    const listData = React.useMemo(() => {
      switch (title) {
        case 'Upcoming Movies':
          return upcomings;
        case 'Popular Movies':
          return popularMovies;
        case 'TV Airings':
          return tvAirings;
        case 'Popular TV':
          return tvPopular;
        default:
          return [];
      }
    }, [title, upcomings, popularMovies, tvAirings, tvPopular]);

    // Get the transformed Images (webp)
    const getImageUrl = (path: string) => {
      return `http://localhost:3100/image?url=${encodeURIComponent(path)}&format=webp`;
    };

    // Memoize the image URL
    const imageURL = React.useMemo(() => {
      if (poster) return `${TMDB_URL + 'w780'}${poster}`;
      const source = listData[0]?.backdrop_path || info?.backdrop_path;
      return source ? `${TMDB_URL + 'w780'}${source}` : '';
    }, [poster, listData, info]);

    // Handle container resizing
    const handleResize = useCallback(() => {
      if (containerRef.current) {
        setWidth(containerRef.current.getBoundingClientRect().width);
      }
    }, [containerRef, setWidth]);

    useEffect(() => {
      if (containerRef.current) {
        setWidth(containerRef.current.getBoundingClientRect().width);
      }
      const debouncedResize = debounce(handleResize, 100); // Debounce the resize event
      window.addEventListener('resize', debouncedResize);
      return () => {
        window.removeEventListener('resize', debouncedResize);
      };
    }, [handleResize, containerRef, setWidth]);

    // Debounce utility
    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    // Handlers for navigation
    const handleTrailer = () => {
      navigate('/videos', { state: { data: info, trending, videoID } });
      window.scrollTo({ top: 0 });
    };

    const handleList = () => {
      navigate('/listDetails', { state: { data: listData, title } });
      window.scrollTo({ top: 0 });
    };

    const handleClick = () => {
      listFor ? handleList() : handleTrailer();
    };

    // Loading and error states
    if (listLoading)
      return (
        <div
          role='status'
          className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'
        ></div>
      );

    if (listError) return <div className='text-white text-sm'>Error: {listError.message}</div>;

    return (
      <div
        ref={containerRef}
        className='h-full pl-4 cursor-pointer'
        style={{ flex: '0 0 33%' }}
        onClick={handleClick}
      >
        <div className='group/icon relative w-full h-full mb-3 rounded-2xl overflow-hidden'>
          <span className='group-hover/icon:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
          <LazyLoadImage
            src={getImageUrl(imageURL)}
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
          <h1 className='text-2xl max-md:text-xl text-white mb-3 hover:underline'>{title}</h1>
          {info && <p className='text-gray-300'>{info.overview?.slice(0, 70)}...</p>}
        </div>
      </div>
    );
  }
);

export default List;
