import { Link, useLocation } from 'react-router-dom';
import { Review } from '../types/media';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StarIcon from '@mui/icons-material/Star';
import React from 'react';

// Lazy load the components
const Navbar = React.lazy(() => import('../components/Navbar'));

// TMDB API image URL
const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';

const Critics = () => {
  // Values from location state
  const location = useLocation();
  const state = location?.state;
  const mediaName: string = state.mediaName;
  const poster: string = state.poster;
  const review: Review[] = state.review;

  return (
    <div className='flex flex-col'>
      <Navbar />
      <div className='container flex flex-col gap-4 bg-gray-400 py-10 cursor-pointer'>
        <div className='flex gap-1 items-center text-white' onClick={(): void => history.back()}>
          <ArrowBackIosIcon />
          <span>Back</span>
        </div>
        <div className='flex gap-3'>
          <div className='w-28 h-44 rounded-lg overflow-hidden'>
            <img
              src={TMDB_URL + poster}
              loading='lazy'
              alt='Celebrity Image'
              className='object-cover w-full h-full'
            />
          </div>
          <div className='flex flex-col gap-2 self-end'>
            <span className='text-xl text-gray-250 font-medium'>{mediaName}</span>
            <span className='text-6xl text-white font-semibold'>External Critics</span>
          </div>
        </div>
      </div>
      <div className='container flex gap-6 py-10 bg-white'>
        <div className='flex flex-3 flex-col gap-4 bg-gray-100 border-2 border-gray-200 rounded-xl'>
          {review?.map((r, index) => (
            <Link
              key={index}
              to={r?.url}
              target='blank'
              className='relative group flex flex-1 items-center justify-between p-2 cursor-pointer'
            >
              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <div className='flex items-center gap-3'>
                <div className='w-14 h-14 rounded-full overflow-hidden'>
                  <img
                    src={TMDB_URL + r?.author_details?.avatar_path}
                    loading='lazy'
                    alt='Critic Image'
                  />
                </div>
                <div className='flex flex-col'>
                  <h2 className='text-black font-medium'>{r?.author}</h2>
                  <span className='text-sm text-gray-400'>
                    Created At: {r?.created_at?.slice(0, 10)}
                  </span>
                  <span className='text-sm text-gray-400'>
                    Updated At: {r?.updated_at?.slice(0, 10)}
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1'>
                  <StarIcon className='text-primary' />
                  <span className='text-gray-400'>{r.author_details?.rating}</span>
                </div>
                <OpenInNewIcon className='text-gray-400' />
              </div>
            </Link>
          ))}
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

export default Critics;
