import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_TRENDING } from '../graphql/queries.js';
import { Media } from '../types/media.js';
import { LazyLoadImage, LazyLoadComponent } from 'react-lazy-load-image-component';
import AddIcon from '@mui/icons-material/Add';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// TMDB API image URL
const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';

const Feature = () => {
  const navigate = useNavigate();

  // Initialize state hooks
  const [index, setIndex] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  // Initialize Ref hooks
  const heightRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iconRef = useRef<HTMLButtonElement | null>(null);

  // Handle GraphQl Query
  const {
    loading: trendingLoading,
    error: trendingError,
    data: trendingData,
  } = useQuery(GET_TRENDING);
  const trending: Media[] = trendingData?.trendingAll;

  // When the window is resized set the height to the container height to center next/prev buttons
  const handleResize = (): void => {
    if (heightRef.current) {
      setHeight(heightRef.current.getBoundingClientRect().height);
    }
  };

  useEffect(() => {
    if (trending && heightRef.current) {
      window.addEventListener('resize', handleResize);
      return (): void => window.removeEventListener('resize', handleResize);
    }
  });

  // Handle Flipping to the next/prev item
  const handleRight = (): void => {
    setIndex((prev) => (prev + 1) % (trending?.length || 1));
  };

  const handleLeft = (): void => {
    setIndex((prev) => (prev - 1 + (trending?.length || 1)) % (trending?.length || 1));
  };

  // Apply click event for next button to flip to the next item every 20s
  const handleClick = (): void => {
    if (iconRef.current) {
      iconRef.current.click();
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(handleClick, 20000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  });

  // Navigate to the trailer page
  const handleTrailer = (data: Media): void => {
    navigate('/videos', { state: { data: data, trending: trending } });
  };

  if (trendingLoading)
    return (
      <div
        className='container flex items-center justify-center w-full'
        style={{
          height: 'calc(98vh - 72px)',
        }}
      >
        <span className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'></span>
      </div>
    );
  if (trendingError) return <p className='text-white text-sm'>Error: {trendingError.message}</p>;

  return (
    <div
      className='container flex gap-2 pt-8 w-full'
      style={{
        height: 'calc(98vh - 72px)',
      }}
    >
      <div
        ref={heightRef}
        className='relative flex-2 basis-96 rounded-2xl overflow-hidden'
        style={{ height: '90%' }}
      >
        <button
          className='absolute top-1/2 left-0 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md'
          style={{ top: height !== 0 ? `${height / 2}px` : '50%', transform: 'translateY(-100%)' }}
          onClick={handleLeft}
        >
          <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <button
          ref={iconRef}
          className='absolute top-1/2 right-0 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md'
          style={{ top: height !== 0 ? `${height / 2}px` : '50%', transform: 'translateY(-100%)' }}
          onClick={handleRight}
        >
          <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <div
          className='relative w-full h-full transition-transform ease-in-out duration-500'
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {trending?.map((e: Media, index: number) => (
            <LazyLoadComponent key={index}>
              <div
                className='group relative flex items-end justify-start w-full h-full p-4 bg-cover bg-no-repeat bg-center cursor-pointer'
                style={{
                  backgroundImage: `linear-gradient(to top,#000 15%, transparent 100%),url(${
                    TMDB_URL + e.backdrop_path
                  })`,
                  flex: '0 0 100%',
                }}
                onClick={(): void => handleTrailer(e)}
              >
                <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                <div className='flex flex-1 shrink-0 basis-60 items-center justify-center gap-2'>
                  <div className='relative w-40 h-60 rounded-xl overflow-hidden'>
                    <AddIcon
                      className='absolute top-0 left-0 bg-black-transparent text-white'
                      style={{ fontSize: '2.5rem' }}
                    />
                    <LazyLoadImage
                      src={TMDB_URL + e?.poster_path}
                      alt='poster'
                      className='object-cover w-full h-full'
                    />
                  </div>
                  <PlayCircleOutlineIcon
                    className='text-white group-hover:text-primary'
                    style={{ fontSize: '6rem' }}
                  />
                  <div className='flex-1 shrink-0 basis-40 flex flex-col justify-end gap-1 text-white'>
                    <span className='text-3xl'>{e.name || e.title}</span>
                    <p className='text-lg text-gray-300'>{e.overview.slice(0, 180) + '...'}</p>
                  </div>
                </div>
              </div>
            </LazyLoadComponent>
          ))}
        </div>
      </div>

      <div
        className='flex-1 shrink-0 basis-60 flex flex-col gap-5 w-full py-5 px-3 cursor-pointer'
        style={{ height: '90%' }}
      >
        <h1 className='text-2xl font-bold text-primary'>Up Next</h1>
        <div
          className='flex-1 shrink-0 basis-40 w-full min-h-40 p-2 rounded-xl overflow-hidden'
          style={{
            backgroundImage: `linear-gradient(to top,#000 60%, #4a4a4a4e 100%)`,
          }}
        >
          <div
            className='flex flex-col w-full h-full gap-1.5 transition-transform ease-in-out duration-500'
            style={{
              transform: `translateY(${-(128 * index + 6 * (index + 1))}px)`,
            }}
          >
            {trending?.map((e: Media, index: number) => (
              <div
                key={index}
                className='group flex items-center justify-center gap-2 p-2.5 w-full h-32'
              >
                <LazyLoadImage
                  src={TMDB_URL + e?.poster_path}
                  alt='poster'
                  className='object-cover w-20 h-28 rounded-lg'
                />
                <div className='flex flex-col w-full h-full gap-1'>
                  <PlayCircleOutlineIcon
                    className='text-white group-hover:text-primary'
                    style={{ fontSize: '2rem' }}
                  />
                  <div className='flex-1 shrink-0 basis-20 flex flex-col gap-1 text-white'>
                    <span className='text-base'>{e.name || e.title}</span>
                    <p className='text-sm text-gray-300'>{e.overview.slice(0, 70) + '...'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Link to={''} className='text-xl text-white hover:text-primary w-fit'>
          <span>Browse trailers</span>
          <ArrowForwardIosIcon style={{ fontSize: '1rem' }} />
        </Link>
      </div>
    </div>
  );
};

export default Feature;
