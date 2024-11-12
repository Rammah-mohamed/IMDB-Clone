import { Link, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import TvIcon from '@mui/icons-material/Tv';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import {
  GET_POPULAR_MOVIES,
  GET_TOP_MOVIES,
  GET_TOP_TV,
  GET_TRENDING_MOVIES,
  GET_TRENDING_TV,
  GET_TV_AIRING,
  GET_TV_POPULAR,
  GET_UPCOMING_MOVIES,
} from '../graphql/queries';
import { useLazyQuery } from '@apollo/client';

type MenuProps = {
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
};

const movies: string[] = [
  'Top 100 Movies',
  'Trending Movies',
  'Upcoming Movies',
  'Most Popular Movies',
  'Browse Movies By Genre',
];

const shows: string[] = [
  'Top 100 TV Shows',
  "What's on TV & Streaming",
  'Trending TV Shows',
  'Most Popular TV Shows',
  'Browse TV Shows By Genre',
];

const trailers: string[] = ['Watch Trailers', 'Latest Trailer', 'IMDB Originals', 'IMDB Picks'];

const Menu: React.FC<MenuProps> = ({ showMenu, setShowMenu }) => {
  const navigate = useNavigate();
  const [getTopMovie, { loading: topMovieLoading, error: topMovieError }] =
    useLazyQuery(GET_TOP_MOVIES);
  const [getUpcomingsMovies, { loading: upcomingsMoviesLoading, error: upcomingsMoviesError }] =
    useLazyQuery(GET_UPCOMING_MOVIES);
  const [getTrendingMovies, { loading: trendingMoviesLoading, error: trendingMoviesError }] =
    useLazyQuery(GET_TRENDING_MOVIES);
  const [getPopularMovies, { loading: popularMoviesLoading, error: popularMoviesError }] =
    useLazyQuery(GET_POPULAR_MOVIES);
  const [getTopTv, { loading: topTvLoading, error: topTvError }] = useLazyQuery(GET_TOP_TV);
  const [getPopularTv, { loading: popularTvLoading, error: popularTvError }] =
    useLazyQuery(GET_TV_POPULAR);
  const [getTrendingTv, { loading: trendingTvLoading, error: trendingTvError }] =
    useLazyQuery(GET_TRENDING_TV);
  const [getTvAiring, { loading: tvAiringLoading, error: tvAiringError }] =
    useLazyQuery(GET_TV_AIRING);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    const target = e.target as HTMLButtonElement;
    if (target) {
      setShowMenu(false);
    }
  };

  const fetchAllMedia = async (mediaType: string, title: string): Promise<void> => {
    const totalItems: number = 100;
    const itemsPerPage: number = 20;
    const totalPages: number = Math.ceil(totalItems / itemsPerPage);
    const promises = [];

    if (mediaType === 'movie') {
      for (let page = 1; page <= totalPages; page++) {
        promises.push(getTopMovie({ variables: { page: page } }));
      }
    } else if (mediaType === 'tv') {
      for (let page = 1; page <= totalPages; page++) {
        promises.push(getTopTv({ variables: { page: page } }));
      }
    }

    try {
      const responses = await Promise.all(promises);
      let allMovies, allTv;
      if (mediaType === 'movie') {
        allMovies = responses.flatMap((response) => response?.data?.topMovies || []);
        if (allMovies) {
          const topHundred = allMovies?.slice(0, 250);
          navigate('/listDetails', {
            state: { data: topHundred, title: title },
          });
        }
      } else if (mediaType === 'tv') {
        allTv = responses.flatMap((response) => response?.data?.topTv || []);
        if (allTv) {
          const topHundred = allTv?.slice(0, 250);
          navigate('/listDetails', {
            state: { data: topHundred, title: title },
          });
        }
        navigate('/listDetails', {
          state: { data: allTv?.slice(0, 250), title: title },
        });
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    }
  };

  const handleList = (title: string): void => {
    if (title === 'Top 100 Movies') {
      fetchAllMedia('movie', title);
    } else if (title === 'Trending Movies') {
      getTrendingMovies().then((response) => {
        navigate('/listDetails', { state: { data: response?.data?.trendingMovies, title: title } });
      });
    } else if (title === 'Upcoming Movies') {
      getUpcomingsMovies().then((response) => {
        navigate('/listDetails', { state: { data: response?.data?.upcomingMovies, title: title } });
      });
    } else if (title === 'Most Popular Movies') {
      getPopularMovies().then((response) => {
        navigate('/listDetails', { state: { data: response?.data?.popularMovies, title: title } });
      });
    } else if (title === 'Browse Movies By Genre') {
      getTopMovie().then((response) => {
        navigate('/listDetails', { state: { data: response?.data?.topMovies, title: title } });
      });
    } else if (title === 'Top 100 TV Shows') {
      fetchAllMedia('tv', title);
    } else if (title === "What's on TV & Streaming") {
      getTvAiring().then((response) => {
        navigate('/listDetails', { state: { data: response?.data?.tvAiring, title: title } });
      });
    } else if (title === 'Trending TV Shows') {
      getTrendingTv().then((response) => {
        navigate('/listDetails', { state: { data: response?.data?.trendingTV, title: title } });
      });
    } else if (title === 'Most Popular TV Shows') {
      getPopularTv().then((response) => {
        navigate('/listDetails', { state: { data: response?.data?.tvPopular, title: title } });
      });
    } else if (title === 'Browse TV Shows By Genre') {
      getTopMovie().then((response) => {
        navigate('/listDetails', { state: { data: response?.data?.topMovies, title: title } });
      });
    }
  };
  const queries = [
    { loading: topMovieLoading, error: topMovieError },
    { loading: upcomingsMoviesLoading, error: upcomingsMoviesError },
    { loading: trendingMoviesLoading, error: trendingMoviesError },
    { loading: popularMoviesLoading, error: popularMoviesError },
    { loading: topTvLoading, error: topTvError },
    { loading: tvAiringLoading, error: tvAiringError },
    { loading: popularTvLoading, error: popularTvError },
    { loading: trendingTvLoading, error: trendingTvError },
  ];

  for (const { loading, error } of queries) {
    if (loading) return <p className='text-white'>Trending Loading...</p>;
    if (error) return <p className='text-white'>Error: {error.message}</p>;
  }

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
};

export default Menu;
