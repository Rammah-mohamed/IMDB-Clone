import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { GET_POPULAR_CELEBRITY } from '../graphql/queries';
import { useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Celebrity } from '../types/media';

const PopularCelebrity = () => {
  const [index, setIndex] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const widthRef = useRef<HTMLDivElement>(null);
  const {
    loading: CelebrityLoading,
    error: CelebrityError,
    data: CelebrityData,
  } = useQuery(GET_POPULAR_CELEBRITY);
  const popularCelebrity: Celebrity[] = CelebrityData?.popularCelebrity;
  const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';
  const navigate = useNavigate();

  const handleRight = (celebrity: Celebrity[]): void => {
    setIndex((prev) => (prev !== celebrity.length - 1 ? prev + 1 : 0));
  };

  const handleLeft = (celebrity: Celebrity[]): void => {
    setIndex((prev) => (prev !== 0 ? prev - 1 : celebrity.length - 1));
  };

  const handleResize = (): void => {
    if (widthRef.current) {
      setWidth(widthRef.current.getBoundingClientRect().width);
    }
  };

  useEffect(() => {
    if (widthRef.current && popularCelebrity) {
      setWidth(widthRef.current.getBoundingClientRect().width);
      window.addEventListener('resize', handleResize);
    }

    return (): void => window.removeEventListener('resize', handleResize);
  }, [popularCelebrity]);

  const handleClick = (celebrity: Celebrity): void => {
    navigate('/celebrityDetails', { state: celebrity });
  };

  if (CelebrityLoading) return <p className='text-white'>Trending Loading...</p>;
  if (CelebrityError) return <p className='text-white'>Error: {CelebrityError.message}</p>;
  return (
    <div className='container py-8'>
      <div className='group flex items-center gap-2 text-2xl text-white p-3 mb-4 border-l-4 border-primary cursor-pointer'>
        <h1>Most popular celebrities</h1>
        <ArrowForwardIosIcon className='group-hover:text-primary' />
      </div>
      <div className='group relative p-4 overflow-hidden'>
        <button
          className='absolute top-1/2 left-3 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block'
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => handleLeft(popularCelebrity)}
        >
          <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <button
          className='absolute top-1/2 right-3 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block'
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => handleRight(popularCelebrity)}
        >
          <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <div
          className='flex items-center gap-4 transition-transform duration-500 cursor-pointer'
          style={{ transform: `translateX(${-(width * index + 16 * (index + 1))}px` }}
        >
          {popularCelebrity.map((p) => (
            <div
              className='group/icon relative flex flex-col gap-2'
              key={p.id}
              ref={widthRef}
              onClick={() => handleClick(p)}
            >
              <span className='group-hover/icon:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <div className='w-44 h-44'>
                <img
                  src={TMDB_URL + p.profile_path}
                  alt='Person Image'
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
