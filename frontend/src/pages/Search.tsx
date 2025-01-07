import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Celebrity, Movie, Multi, TV } from '../types/media';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_CELEBRITY, SEARCH_MEDIA, SEARCH_MOVIES, SEARCH_TV } from '../graphql/queries';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Lazy load the components
const Navbar = React.lazy(() => import('../components/Navbar'));

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
  searchMedia: SEARCH_MEDIA,
  searchMovie: SEARCH_MOVIES,
  searchTV: SEARCH_TV,
  searchCelebrity: SEARCH_CELEBRITY,
};

// TMDB API image URL
const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Values from location state
  const state = location?.state;
  const query = state.query;
  const filter = state.filter;

  // Initialize state hooks
  const [multi, setMulti] = useState<Multi[] | null>(null);
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [tv, setTv] = useState<TV[] | null>(null);
  const [celebrity, setCelebrity] = useState<Celebrity[] | null>(null);

  // Custom hook to Handle GraphQl Queries
  const useSearchQueries = useCallback(() => {
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

  const { searchMedia, searchMovie, searchTV, searchCelebrity } = useSearchQueries();

  // Fetching data depending on filter text
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      // Reset the states
      setMulti(null);
      setMovies(null);
      setTv(null);
      setCelebrity(null);

      try {
        let response;

        switch (filter) {
          case 'All':
            response = await searchMedia.fetch({ query });
            setMulti(response?.data?.searchMulti);
            break;

          case 'Movies':
            response = await searchMovie.fetch({ query });
            setMovies(response?.data?.searchMovies);
            break;

          case 'TV Shows':
            response = await searchTV.fetch({ query });
            setTv(response?.data?.searchTV);
            break;

          case 'Celebs':
            response = await searchCelebrity.fetch({ query });
            setCelebrity(response?.data?.searchCelebrity);
            break;

          default:
            console.warn(`Unknown filter type: ${filter}`);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    fetchSearchResults();
  }, [query, filter]);

  //Chech the type of the media
  const hasMediaType = (type: string): boolean => {
    const normalizedFilter =
      filter === 'Movies'
        ? 'movie'
        : filter === 'TV Shows'
        ? 'tv'
        : filter === 'Celebs'
        ? 'person'
        : 'All';

    if (normalizedFilter === 'All' || normalizedFilter === type) {
      return multi?.some((m) => m?.media_type === type) ?? false;
    }

    return false;
  };

  const isMovies = (): boolean => hasMediaType('movie');
  const isTv = (): boolean => hasMediaType('tv');
  const isClebs = (): boolean => hasMediaType('person');

  // Handle navigation
  const handleNavigate = (mediaType: string | null, data: Movie | TV | Celebrity | Multi): void => {
    const route = mediaType === 'person' ? '/celebrityDetails' : '/mediaDetail';
    navigate(route, { state: data });
  };

  return (
    <div className='flex flex-col'>
      <Navbar />
      <div className='container flex gap-20 bg-white py-10'>
        <div className='flex flex-3 flex-col'>
          <h1 className='text-5xl'>Search {query}</h1>
          <div className='flex flex-3 flex-col gap-8'>
            {(isMovies() || movies) && (
              <div className='flex flex-col gap-4 mt-4 p-3 border-2 border-gray-100 shadow-md'>
                <h1 className='text-3xl font-semibold pl-3 border-l-4 border-primary'>Movies</h1>
                {(multi?.filter((m) => m?.media_type === 'movie') || movies)
                  ?.slice(0, 4)
                  ?.map((m) => (
                    <div
                      className='flex flex-1 flex-col gap-2 cursor-pointer'
                      key={m.id}
                      onClick={() => handleNavigate(null, m)}
                    >
                      <div className='flex items-center'>
                        <div className='flex flex-1  flex-row items-center gap-3'>
                          <div
                            className='group relative w-16 h-24
                overflow-hidden rounded-xl cursor-pointer'
                          >
                            <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                            <AddIcon className='absolute top-0 left-0 bg-black-transparent text-white' />
                            <img
                              src={TMDB_URL + m?.poster_path}
                              loading='lazy'
                              alt='poster'
                              className='object-cover w-full h-full'
                            />
                          </div>
                          <div className={`flex flex-2 flex-col gap-2 p-2 w-full text-sm`}>
                            <h1 className='flex-2 text font-bold'>{m?.title}</h1>
                            <div className='flex-1 text-sm text-black-100'>
                              <span>{m?.release_date}</span>
                            </div>
                            <div className='flex text-black-100 text-sm'>
                              <StarIcon className='text-primary' />
                              <p className='flex-1'>
                                {Number(m?.vote_average ?? 0).toFixed(2)}
                                <span className='flex-1 pl-2 text-gray font-semibold'>
                                  {m?.vote_count?.toString().length !== undefined &&
                                  m?.vote_count?.toString().length > 3
                                    ? '(' + m?.vote_count?.toString().slice(0, 1) + 'K)'
                                    : '(' + m?.vote_count + ')'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <ErrorOutlineIcon className='text-secondary' />
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {(isTv() || tv) && (
              <div className='flex flex-col gap-4 mt-4 p-3 border-2 border-gray-100 shadow-md'>
                <h1 className='text-3xl font-semibold pl-3 border-l-4 border-primary'>TV Shows</h1>
                {(multi?.filter((s) => s?.media_type === 'tv') || tv)?.slice(0, 4)?.map((m) => (
                  <div
                    className='flex flex-1 flex-col gap-2 cursor-pointer'
                    key={m.id}
                    onClick={() => handleNavigate(null, m)}
                  >
                    <div className='flex items-center'>
                      <div className='flex flex-1  flex-row items-center gap-3'>
                        <div
                          className='group relative w-16 h-24
                overflow-hidden rounded-xl cursor-pointer'
                        >
                          <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                          <AddIcon className='absolute top-0 left-0 bg-black-transparent text-white' />
                          <img
                            src={TMDB_URL + m?.poster_path}
                            loading='lazy'
                            alt='poster'
                            className='object-cover w-full h-full'
                          />
                        </div>
                        <div className={`flex flex-2 flex-col gap-2 p-2 w-full text-sm`}>
                          <h1 className='flex-2 text font-bold'>{m?.name}</h1>
                          <div className='flex-1 text-sm text-black-100'>
                            <span>{m?.first_air_date}</span>
                          </div>
                          <div className='flex text-black-100 text-sm'>
                            <StarIcon className='text-primary' />
                            <p className='flex-1'>
                              {Number(m?.vote_average ?? 0).toFixed(2)}
                              <span className='flex-1 pl-2 text-gray font-semibold'>
                                {m?.vote_count?.toString().length !== undefined &&
                                m?.vote_count?.toString().length > 3
                                  ? '(' + m?.vote_count?.toString().slice(0, 1) + 'K)'
                                  : '(' + m?.vote_count + ')'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <ErrorOutlineIcon className='text-secondary' />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(isClebs() || celebrity) && (
              <div className='flex flex-col gap-4 mt-4 p-3 border-2 border-gray-100 shadow-md'>
                <h1 className='text-3xl font-semibold pl-3 border-l-4 border-primary'>
                  Celebrities
                </h1>
                {(multi?.filter((c) => c?.media_type === 'person') || celebrity)
                  ?.slice(0, 4)
                  ?.map((m) => (
                    <div
                      className='flex flex-1 flex-col gap-6 cursor-pointer'
                      key={m.id}
                      onClick={() => handleNavigate('person', m)}
                    >
                      <div className='flex items-center'>
                        <div className='flex flex-1 flex-row items-center gap-3'>
                          <div className='group relative w-20 h-20 overflow-hidden rounded-full cursor-pointer'>
                            <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                            <img
                              src={TMDB_URL + m?.profile_path}
                              loading='lazy'
                              alt='poster'
                              className='object-cover w-full h-full'
                            />
                          </div>
                          <div className={`flex flex-2 flex-col gap-2 p-2 w-full text-sm`}>
                            <h1 className='flex-2 text font-bold'>{m?.name}</h1>
                          </div>
                        </div>
                        <ErrorOutlineIcon className='text-secondary' />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-4'>
          <h1 className='text-3xl font-semibold pl-3 border-l-4 border-primary'>More to explore</h1>
          <div className='flex flex-col gap-3 p-4 border-2 border-gray-250 rounded-sm'>
            <h2 className='text-2xl font-medium'>Feedback</h2>
            <p className='text-secondary hover:underline cursor-pointer'>
              Tell us what you think about this feature.
            </p>
            <p className='text-secondary hover:underline cursor-pointer'>Report this list.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
