import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { SEARCH_CELEBRITY, SEARCH_MEDIA, SEARCH_MOVIES, SEARCH_TV } from '../graphql/queries';
import { useLazyQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Celebrity, Movie, Multi, TV } from '../types/media';

const Search = () => {
  const [multi, setMulti] = useState<Multi[] | null>(null);
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [tv, setTv] = useState<TV[] | null>(null);
  const [celebrity, setCelebrity] = useState<Celebrity[] | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const query = location.state.query;
  const filter = location.state.filter;
  const [searchMedia, { loading: searchMediaLoading, error: searchMediaError }] =
    useLazyQuery(SEARCH_MEDIA);
  const [searchMovie, { loading: searchMovieLoading, error: searchMovieError }] =
    useLazyQuery(SEARCH_MOVIES);
  const [searchTV, { loading: searchTVLoading, error: searchTVError }] = useLazyQuery(SEARCH_TV);
  const [searchCelebrity, { loading: searchCelebrityLoading, error: searchCelebrityError }] =
    useLazyQuery(SEARCH_CELEBRITY);
  const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';

  useEffect(() => {
    if (query) {
      if (filter === 'All') {
        searchMedia({ variables: { query: query } }).then((response) => {
          setMulti(null);
          setMulti(response?.data?.searchMulti);
        });
      } else if (filter === 'Movies') {
        searchMovie({ variables: { query: query } }).then((response) => {
          setMulti(null);
          setMovies(response?.data?.searchMovies);
        });
      } else if (filter === 'TV Shows') {
        searchTV({ variables: { query: query } }).then((response) => {
          setMulti(null);
          setTv(response?.data?.searchTV);
        });
      } else if (filter === 'Celebs') {
        searchCelebrity({ variables: { query: query } }).then((response) => {
          setMulti(null);
          setCelebrity(response?.data?.searchCelebrity);
        });
      } else if (filter === 'Advanced Search') {
      }
    }
  }, [query, filter]);

  const isMovies = (): boolean => {
    if (filter === 'Movies' || filter === 'All') {
      const isMovies = multi?.filter((m) => m?.media_type === 'movie');
      if (isMovies?.length !== 0) {
        return true;
      } else return false;
    }
    return false;
  };

  const isTv = (): boolean => {
    if (filter === 'TV Shows' || filter === 'All') {
      const isTv = multi?.filter((m) => m?.media_type === 'tv');
      if (isTv?.length !== 0) {
        return true;
      } else return false;
    }
    return false;
  };

  const isClebs = (): boolean => {
    if (filter === 'Celebs' || filter === 'All') {
      const isCelebs = multi?.filter((m) => m?.media_type === 'person');
      if (isCelebs?.length !== 0) {
        return true;
      } else return false;
    }
    return false;
  };

  const handleNavigate = (mediaType: string | null, data: Movie | TV | Celebrity | Multi): void => {
    if (mediaType) {
      navigate('/celebrityDetails', { state: data });
    } else {
      navigate('/mediaDetail', { state: data });
    }
  };

  const queries = [
    { loading: searchMediaLoading, error: searchMediaError },
    { loading: searchMovieLoading, error: searchMovieError },
    { loading: searchTVLoading, error: searchTVError },
    { loading: searchCelebrityLoading, error: searchCelebrityError },
  ];

  for (const { loading, error } of queries) {
    if (loading) return <p className='text-white'>Trending Loading...</p>;
    if (error) return <p className='text-white'>Error: {error.message}</p>;
  }
  return (
    <div className='flex flex-col'>
      <Navbar />
      <div className='container flex gap-20 bg-white py-10'>
        <div className='flex flex-3 flex-col'>
          <h1 className='text-5xl'>Search {query}</h1>
          <div className='flex flex-3 flex-col gap-8'>
            {isMovies() && (
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
            {isTv() && (
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
            {isClebs() && (
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
                      onClick={() => handleNavigate('Celebrity', m)}
                    >
                      <div className='flex items-center'>
                        <div className='flex flex-1 flex-row items-center gap-3'>
                          <div className='group relative w-20 h-20 overflow-hidden rounded-full cursor-pointer'>
                            <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                            <img
                              src={TMDB_URL + m?.profile_path}
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
