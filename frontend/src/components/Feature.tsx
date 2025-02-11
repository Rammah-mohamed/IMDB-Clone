import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_TRENDING } from '../graphql/queries.js';
import { Media } from '../types/media.js';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import AddIcon from '@mui/icons-material/Add';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import getImageUrl from '../utils/getImages.js';

const Feature = () => {
  const navigate = useNavigate();

  // Initialize state hooks
  const [index, setIndex] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  // Initialize Ref hooks
  const heightRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iconRef = useRef<HTMLButtonElement | null>(null);

  // Handle GraphQL Query
  const {
    loading: trendingLoading,
    error: trendingError,
    data: trendingData,
  } = useQuery(GET_TRENDING);
  const trending: Media[] = trendingData?.trendingAll;

  // Preload critical images
  const preloadImages = useCallback(() => {
    if (!trending || trending.length === 0) return;

    const preloadLink = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href; // Add the generated URL here
      document.head.appendChild(link);
    };

    // Preload backdrop and poster images for the first trending item
    const firstItem = trending[0];
    if (firstItem?.backdrop_path) {
      preloadLink(getImageUrl(firstItem.backdrop_path, 'w1280'));
    }
    if (firstItem?.poster_path) {
      preloadLink(getImageUrl(firstItem.poster_path, 'w342'));
    }
  }, [trending]);

  useEffect(() => {
    preloadImages();
    return () => {
      document.head.querySelectorAll('link[rel="preload"][as="image"]').forEach((link) => {
        document.head.removeChild(link);
      });
    };
  }, [preloadImages]);

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
        data-testid='status'
        className='container flex items-center justify-center'
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
      className='container flex gap-2 pt-8'
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
          data-testid='prevBtn'
          className='absolute top-1/2 left-0 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md'
          style={{ top: height !== 0 ? `${height / 2}px` : '50%', transform: 'translateY(-100%)' }}
          onClick={handleLeft}
        >
          <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <button
          data-testid='nextBtn'
          ref={iconRef}
          className='absolute top-1/2 right-0 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md'
          style={{ top: height !== 0 ? `${height / 2}px` : '50%', transform: 'translateY(-100%)' }}
          onClick={handleRight}
        >
          <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <div
          className='relative flex h-full transition-transform ease-in-out duration-500'
          style={{ transform: `translateX(-${index * 100}%)`, willChange: 'transform' }}
        >
          {trending?.map((e: Media, index: number) => (
            <div
              key={index}
              className='group relative flex items-end justify-start w-full h-full p-4 bg-cover bg-no-repeat bg-center cursor-pointer'
              style={{
                backgroundImage: `linear-gradient(to top, #000 15%, transparent 100%)`,
                flex: '0 0 100%',
              }}
              onClick={(): void => handleTrailer(e)}
            >
              {index === 0 ? (
                <img
                  src={getImageUrl(e?.backdrop_path, 'w1280')}
                  alt={e.name || e.title}
                  loading='eager'
                  className='absolute left-0 top-0  object-cover w-full h-full'
                />
              ) : (
                <LazyLoadImage
                  src={getImageUrl(e?.backdrop_path, 'w1280')}
                  alt={e.name || e.title}
                  loading='lazy'
                  className='absolute left-0 top-0  object-cover w-full h-full'
                />
              )}
              <span
                className='absolute left-0 top-0 w-full h-full'
                style={{
                  backgroundImage: 'linear-gradient(to top,#000 15%, transparent 100%)',
                }}
              ></span>
              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <div className='flex flex-1 shrink-0 basis-60 items-center justify-center gap-2'>
                <div className='relative max-lg:w-32 max-lg:h-52 w-40 h-60 rounded-xl overflow-hidden'>
                  <AddIcon
                    className='absolute max-lg:text-2xl top-0 left-0 bg-black-transparent text-white'
                    style={{ fontSize: window.innerWidth <= 1024 ? '2.5rem' : '1rem' }}
                  />
                  {index === 0 ? (
                    <img
                      src={getImageUrl(e?.poster_path, 'w342')}
                      alt={e.name || e.title}
                      loading='eager'
                      className=' object-cover w-full h-full'
                    />
                  ) : (
                    <LazyLoadImage
                      src={getImageUrl(e?.poster_path, 'w342')}
                      alt={e.name || e.title}
                      loading='lazy'
                      className=' object-cover w-full h-full'
                    />
                  )}
                </div>
                <PlayCircleOutlineIcon
                  className='text-white group-hover:text-primary z-10'
                  style={{ fontSize: '6rem' }}
                />
                <div className='flex-1 shrink-0 basis-40 flex flex-col justify-end gap-1 text-white z-10'>
                  <span className='text-3xl max-lg:text-2xl'>{e.name || e.title}</span>
                  <p className='text-lg text-gray-300 max-lg:text-base'>
                    {e.overview.slice(0, 130) + '...'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className='max-lg:hidden flex-1 shrink-0 basis-60 flex flex-col gap-5 w-full py-5 px-3 cursor-pointer'
        style={{ height: '90%' }}
      >
        <h1 className='text-2xl font-bold text-primary'>Up Next</h1>
        <div
          className='flex-1 shrink-0 basis-40 w-full min-h-40 px-3 py-2 rounded-xl overflow-hidden'
          style={{
            backgroundImage: `linear-gradient(to top,#000 60%, #4a4a4a4e 100%)`,
          }}
        >
          <div
            className='w-full h-full gap-2 transition-transform ease-in-out duration-500'
            style={{
              transform: `translateY(${-(144 * index + 8)}px)`,
            }}
          >
            {trending?.map((e: Media, index: number) => (
              <div
                key={index}
                className='group flex items-center justify-center gap-2 w-full h-36'
                onClick={(): void => handleTrailer(e)}
              >
                {index <= 2 ? (
                  <img
                    src={getImageUrl(e?.poster_path, 'w185')}
                    alt={e.name || e.title}
                    loading='eager'
                    className='object-cover w-20 h-32 rounded-lg'
                  />
                ) : (
                  <LazyLoadImage
                    src={getImageUrl(e?.poster_path, 'w185')}
                    alt={e.name || e.title}
                    loading='lazy'
                    className='object-cover w-20 h-28 rounded-lg'
                  />
                )}
                <div className='flex flex-col pt-2 w-full h-full gap-1'>
                  <PlayCircleOutlineIcon
                    className='text-white group-hover:text-primary'
                    style={{ fontSize: '2rem' }}
                  />
                  <div className='flex-1 shrink-0 basis-20 flex flex-col gap-1 text-white'>
                    <span className='text-base'>{e.name || e.title}</span>
                    <p className='text-sm text-gray-300'>{e.overview.slice(0, 120) + '...'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feature;
