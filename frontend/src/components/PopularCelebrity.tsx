import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_POPULAR_CELEBRITY } from '../graphql/queries';
import { Celebrity } from '../types/media';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { debounce } from 'lodash';
import { LazyLoadImage } from 'react-lazy-load-image-component';

// TMDB API image URL
const TMDB_URL: string = 'https://image.tmdb.org/t/p/';

const PopularCelebrity = () => {
  const navigate = useNavigate();

  // Initialize state hooks
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Initialize Ref hooks
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle GraphQL query
  const {
    loading: isLoading,
    error: isError,
    data: celebrityData,
  } = useQuery(GET_POPULAR_CELEBRITY);
  const popularCelebrities: Celebrity[] = celebrityData?.popularCelebrity;

  // Get the transformed Images (webp)
  const getImageUrl = (path: string, quality: string) => {
    const originalUrl = `${TMDB_URL}${quality}${path}`;
    return `http://localhost:3100/image?url=${encodeURIComponent(originalUrl)}&format=webp`;
  };

  // Handlers to update the index
  const handleNext = (): void => {
    setCurrentIndex((prev) => (prev + 1) % popularCelebrities.length);
  };

  const handlePrev = (): void => {
    setCurrentIndex((prev) => (prev === 0 ? popularCelebrities.length - 1 : prev - 1));
  };

  // Handle Container width for smooth navigation between items
  const updateContainerWidth = (): void => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.getBoundingClientRect().width);
    }
  };

  const debouncedResizeHandler = debounce(updateContainerWidth, 200);

  useEffect(() => {
    updateContainerWidth();
    window.addEventListener('resize', debouncedResizeHandler);

    return () => window.removeEventListener('resize', debouncedResizeHandler);
  }, [popularCelebrities]);

  // Navigate to celebrity details page
  const handleCelebrityClick = (celebrity: Celebrity): void => {
    navigate('/celebrityDetails', { state: celebrity });
  };

  if (isLoading)
    return (
      <div
        role='status'
        className='container flex items-center justify-center py-8 h-96 mb-10 overflow-hidden'
      >
        <div className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'></div>
      </div>
    );
  if (isError) return <p className='text-white text-sm'>Error: {isError.message}</p>;
  return (
    <div className='container py-8 h-96 mb-10 overflow-hidden'>
      <div className='group flex items-center gap-2 w-full h-14 text-2xl text-white p-3 mb-4 border-l-4 border-primary cursor-pointer'>
        <h1>Most popular celebrities</h1>
        <ArrowForwardIosIcon className='group-hover:text-primary' />
      </div>
      <div className='group relative p-4 overflow-hidden'>
        <button
          data-testid='prevBtn'
          className='absolute top-1/2 left-3 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block'
          style={{ transform: 'translateY(-50%)' }}
          onClick={handlePrev}
        >
          <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <button
          data-testid='nextBtn'
          className='absolute top-1/2 right-3 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block'
          style={{ transform: 'translateY(-50%)' }}
          onClick={handleNext}
        >
          <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <div
          className='flex items-center gap-4 h-full transition-transform duration-500 cursor-pointer'
          style={{
            transform: `translateX(${-(containerWidth * currentIndex + 16 * (currentIndex + 1))}px`,
          }}
        >
          {popularCelebrities.map((p, index) => (
            <div
              className='group/icon relative flex flex-col gap-2 h-full w-48'
              key={p.id}
              ref={containerRef}
              onClick={() => handleCelebrityClick(p)}
            >
              <span className='group-hover/icon:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <div className='w-44 h-44'>
                <LazyLoadImage
                  src={getImageUrl(p?.profile_path, 'w185')}
                  alt='Person Image'
                  loading={index <= 6 ? 'eager' : 'lazy'}
                  className='object-cover w-full h-full rounded-full'
                />
              </div>
              <h1 className=' text-white text-xl text-center font-semibold'>{p.name}</h1>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularCelebrity;
