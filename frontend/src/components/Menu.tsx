import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { Movie, TV } from '../types/media';
import CloseIcon from '@mui/icons-material/Close';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import TvIcon from '@mui/icons-material/Tv';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

// Import GrapgQL queries
import {
  GET_POPULAR_MOVIES,
  GET_TOP_MOVIES,
  GET_TOP_TV,
  GET_TRENDING_MOVIES,
  GET_TRENDING_TV,
  GET_TV_AIRING,
  GET_TV_POPULAR,
  GET_UPCOMING_MOVIES,
} from '../graphql/queries.js';

// Types for each query's return value
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

// Movie response type
interface TopMoviesResponse {
  data: {
    topMovies: Movie[];
    topTv?: TV[];
  };
}

// TV response type
interface TopTvResponse {
  data: {
    topTv: TV[];
    topMovies?: Movie[];
  };
}

// Type for menu props
type MenuProps = {
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
};

// GraphQL queries
const QUERY_CONFIG = {
  topMovies: GET_TOP_MOVIES,
  upcomingMovies: GET_UPCOMING_MOVIES,
  trendingMovies: GET_TRENDING_MOVIES,
  popularMovies: GET_POPULAR_MOVIES,
  topTv: GET_TOP_TV,
  popularTv: GET_TV_POPULAR,
  trendingTv: GET_TRENDING_TV,
  tvAiring: GET_TV_AIRING,
};

// Menu movies text
const movies: string[] = [
  'Top 100 Movies',
  'Trending Movies',
  'Upcoming Movies',
  'Most Popular Movies',
];

// Menu shows text
const shows: string[] = [
  'Top 100 TV Shows',
  "What's on TV & Streaming",
  'Trending TV Shows',
  'Most Popular TV Shows',
];

// Menu trailer text
const trailers: string[] = ['Watch Trailers', 'Latest Trailer', 'IMDB Originals', 'IMDB Picks'];

const Menu: React.FC<MenuProps> = React.memo(({ showMenu, setShowMenu }) => {
  const navigate = useNavigate();

  // Handle GraphQl Queries
  const useMovieAndTvQueries = useCallback(() => {
    const queries: Queries = Object.entries(QUERY_CONFIG).reduce((acc, [key, query]) => {
      const [fetch, { loading, error, data }] = useLazyQuery<TopMoviesResponse | TopTvResponse>(
        query
      );
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

  const {
    topMovies,
    upcomingMovies,
    trendingMovies,
    popularMovies,
    topTv,
    popularTv,
    trendingTv,
    tvAiring,
  } = useMovieAndTvQueries();

  // Query loading handling
  const isAnyLoading = Object.values({
    topMovies: topMovies.loading,
    upcomingMovies: upcomingMovies.loading,
    trendingMovies: trendingMovies.loading,
    popularMovies: popularMovies.loading,
    topTv: topTv.loading,
    popularTv: popularTv.loading,
    trendingTv: trendingTv.loading,
    tvAiring: tvAiring.loading,
  }).some(Boolean);

  if (isAnyLoading) {
    return (
      <div className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'></div>
    );
  }

  // Query error handling
  const anyErrors = Object.values({
    topMovies: topMovies.error,
    upcomingMovies: upcomingMovies.error,
    trendingMovies: trendingMovies.error,
    popularMovies: popularMovies.error,
    topTv: topTv.error,
    popularTv: popularTv.error,
    trendingTv: trendingTv.error,
    tvAiring: tvAiring.error,
  }).filter(Boolean);

  if (anyErrors.length > 0) {
    return (
      <ul className='flex flex-col'>
        {anyErrors.map((e, index) => (
          <li key={index} className='text-white'>
            {e}
          </li>
        ))}
      </ul>
    );
  }

  // Close Menu
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    const target = e.target as HTMLButtonElement;
    if (target) {
      setShowMenu(false);
    }
  };

  // Fetch 100 Media (Movie/TV)
  const fetchAllMedia = async (mediaType: 'movie' | 'tv'): Promise<any[]> => {
    const totalItems = 100;
    const itemsPerPage = 20;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const fetchFunction = mediaType === 'movie' ? topMovies.fetch : topTv.fetch;

    try {
      const promises = Array.from({ length: totalPages }, (_, i) => fetchFunction({ page: i + 1 }));
      const responses = await Promise.all(promises);

      const allMedia = responses.flatMap((response) =>
        mediaType === 'movie' ? response?.data?.topMovies : response?.data?.topTv || []
      );

      return allMedia.slice(0, totalItems); // Return top 100 media
    } catch (error) {
      console.error(`Failed to fetch ${mediaType}s:`, error);
      return [];
    }
  };

  // Fetch media depending on menu title
  const handleList = async (title: string): Promise<void> => {
    if (title === 'Top 100 Movies') {
      const data = await fetchAllMedia('movie');
      navigate('/listDetails', {
        state: { data, title, key: Date.now() },
      });
    } else if (title === 'Trending Movies') {
      const response = await trendingMovies.fetch();
      navigate('/listDetails', {
        state: { data: response?.data?.trendingMovies, title: title, key: Date.now() },
      });
    } else if (title === 'Upcoming Movies') {
      const response = await upcomingMovies.fetch();
      navigate('/listDetails', {
        state: { data: response?.data?.upcomingMovies, title: title, key: Date.now() },
      });
    } else if (title === 'Most Popular Movies') {
      const response = await popularMovies.fetch();
      navigate('/listDetails', {
        state: { data: response?.data?.popularMovies, title: title, key: Date.now() },
      });
    } else if (title === 'Top 100 TV Shows') {
      const data = await fetchAllMedia('tv');
      navigate('/listDetails', {
        state: { data, title, key: Date.now() },
      });
    } else if (title === "What's on TV & Streaming") {
      const response = await tvAiring.fetch();
      navigate('/listDetails', {
        state: { data: response?.data?.tvAiring, title: title, key: Date.now() },
      });
    } else if (title === 'Trending TV Shows') {
      const response = await trendingTv.fetch();
      navigate('/listDetails', {
        state: { data: response?.data?.trendingTV, title: title, key: Date.now() },
      });
    } else if (title === 'Most Popular TV Shows') {
      const response = await popularTv.fetch();
      navigate('/listDetails', {
        state: { data: response?.data?.tvPopular, title: title, key: Date.now() },
      });
    }
  };

  return (
    <div
      className={`container flex flex-col gap-10 fixed top-0 left-0 w-screen px-72 bg-gray-400 z-40 overflow-hidden transition-all duration-300 ease-in-out ${
        showMenu ? 'h-screen pt-10 pb-10' : 'h-0'
      }`}
    >
      <div className='flex items-center justify-between'>
        <Link to={'/'}>
          <h1 className=' bg-primary py-1.5 px-2.5 text-3xl text-black font-black rounded'>IMDB</h1>
        </Link>
        <button className='bg-primary text-black rounded-full p-2' onClick={handleClick}>
          <CloseIcon style={{ fontSize: '2rem' }} />
        </button>
      </div>
      <div className='flex items-center gap-40'>
        <div className='flex gap-2'>
          <LocalMoviesIcon className='text-primary' style={{ fontSize: '1.5rem' }} />
          <div className='flex flex-col gap-4 text-gray-200 text-base'>
            <h1 className='text-white text-2xl'>Movies</h1>
            {movies.map((m: string, index: number) => (
              <Link key={index} to={''} className='hover:underline' onClick={() => handleList(m)}>
                {m}
              </Link>
            ))}
          </div>
        </div>
        <div className='flex gap-2'>
          <TvIcon className='text-primary' style={{ fontSize: '1.5rem' }} />
          <div className='flex flex-col gap-4 text-gray-200 text-base'>
            <h1 className='text-white text-2xl'>TV Shows</h1>
            {shows.map((s: string, index: number) => (
              <Link key={index} to={''} className='hover:underline' onClick={() => handleList(s)}>
                {s}
              </Link>
            ))}
          </div>
        </div>
        <div className='flex gap-2'>
          <VideoLibraryIcon className='text-primary' style={{ fontSize: '1.5rem' }} />
          <div className='flex flex-col gap-4 text-gray-200 text-base'>
            <h1 className='text-white text-2xl'>Watch</h1>
            {trailers.map((t: string, index: number) => (
              <Link key={index} to={''} className='hover:underline'>
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default Menu;
