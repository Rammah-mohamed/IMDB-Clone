import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_TRENDING } from '../graphql/queries.js';
import AddIcon from '@mui/icons-material/Add';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

type TrendingAll = {
  name?: String;
  title?: String;
  id: number;
  overview: String;
  poster_path: String;
  backdrop_path: String;
  vote_average: number;
  vote_count: number;
  release_date?: String;
  popularity: number;
  media_type: String;
  genre_ids: number[];
  first_air_date?: String;
};

const Feature = () => {
  const [index, setIndex] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const {
    loading: trendingLoading,
    error: trendingError,
    data: trendingData,
  } = useQuery(GET_TRENDING);
  const trending: TrendingAll[] = trendingData?.trendingAll;
  const TMDB_URL: String = 'https://image.tmdb.org/t/p/original';
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iconRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  //Get the feature container width when the app is mount
  useEffect(() => {
    if (trending && containerRef.current) {
      setWidth(containerRef.current.getBoundingClientRect().width);
    }
  }, [trending]);

  //Apply click event for next arror
  const handleClick = (): void => {
    if (iconRef.current) {
      iconRef.current.click();
    }
  };

  //Change to the next article every 20 seconds
  useEffect(() => {
    intervalRef.current = setInterval(handleClick, 20000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  });

  const handleRight = (): void => {
    setIndex((prev) => (prev !== trending?.length - 1 ? prev + 1 : 0));
  };

  const handleLeft = (): void => {
    setIndex((prev) => (prev !== 0 ? prev - 1 : trending?.length - 1));
  };

  const handleTrailer = (data: any): void => {
    navigate('/videos', { state: { data: data, trending: trending } });
  };

  if (trendingLoading) return <p className="text-white">Trending Loading...</p>;
  if (trendingError) return <p className="text-white">Error: {trendingError.message}</p>;

  return (
    <div
      className="container flex gap-2"
      style={{
        height: 'calc(98vh - 72px)',
      }}
    >
      <div className="relative flex-2 rounded-2xl overflow-hidden" style={{ height: '90%' }}>
        <button
          className="absolute top-1/2 left-0 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md"
          style={{ transform: 'translateY(-100%)' }}
          onClick={handleLeft}
        >
          <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <button
          ref={iconRef}
          className="absolute top-1/2 right-0 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md"
          style={{ transform: 'translateY(-100%)' }}
          onClick={handleRight}
        >
          <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <div
          ref={containerRef}
          className="relative flex items-start w-full h-full transition-transform duration-500"
          style={{ transform: `translateX(${-width * index}px)` }}
        >
          {trending?.map((e: any, index: number) => (
            <div
              key={index}
              className="group relative flex items-end justify-start w-full h-full p-4 bg-cover bg-no-repeat bg-center cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(to top,#000 15%, transparent 100%),url(${
                  TMDB_URL + e.backdrop_path
                })`,
                flex: '0 0 100%',
              }}
              onClick={(): void => handleTrailer(e)}
            >
              <span className="group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20"></span>
              <div className="flex flex-1 items-center justify-center gap-2">
                <div className="relative w-40 h-60 rounded-xl overflow-hidden">
                  <AddIcon
                    className="absolute top-0 left-0 bg-black-transparent text-white"
                    style={{ fontSize: '2.5rem' }}
                  />
                  <img
                    src={TMDB_URL + e.poster_path}
                    alt="poster"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="object-cover w-full h-full"
                  />
                </div>
                <PlayCircleOutlineIcon
                  className="text-white group-hover:text-primary"
                  style={{ fontSize: '6rem' }}
                />
                <div className="flex-1 flex flex-col justify-end gap-1 text-white">
                  <span className="text-3xl">{e.name || e.title}</span>
                  <p className="text-lg text-gray-300">{e.overview.slice(0, 150) + '...'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="flex-1 flex flex-col gap-5 w-full py-5 px-3 cursor-pointer"
        style={{ height: '90%' }}
      >
        <h1 className="text-2xl font-bold text-primary">Up Next</h1>
        <div
          className="flex-1 rounded-xl overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to top,#000 60%, #4a4a4a4e 100%)`,
          }}
        >
          <div
            className="flex flex-col gap-3 p-3"
            style={{
              transform: `translateY(${-(128 * index + 12 * (index + 1))}px)`,
            }}
          >
            {trending?.map((e: any, index: number) => (
              <div key={index} className="group flex items-center justify-center gap-4 h-32">
                <img
                  src={TMDB_URL + e.poster_path}
                  alt="poster"
                  loading={index <= 2 ? 'eager' : 'lazy'}
                  className="object-cover w-24 h-28 rounded-lg"
                />
                <div className="flex flex-col gap-1">
                  <PlayCircleOutlineIcon
                    className="text-white group-hover:text-primary"
                    style={{ fontSize: '2rem' }}
                  />
                  <div className="flex-1 flex flex-col justify-end gap-1 text-white">
                    <span className="text-base">{e.name || e.title}</span>
                    <p className="text-sm text-gray-300">{e.overview.slice(0, 50) + '...'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Link to={''} className="text-xl text-white hover:text-primary w-fit">
          <span>Browse trailers</span>
          <ArrowForwardIosIcon style={{ fontSize: '1rem' }} />
        </Link>
      </div>
    </div>
  );
};

export default Feature;
