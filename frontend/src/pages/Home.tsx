import React, { Suspense } from 'react';
import { useAuth } from '../context/authContext';

// Lazy load the components
const Navbar = React.lazy(() => import('../components/Navbar'));
const Feature = React.lazy(() => import('../components/Feature'));
const Lists = React.lazy(() => import('../components/Lists'));
const PopularCelebrity = React.lazy(() => import('../components/PopularCelebrity'));
const MediaList = React.lazy(() => import('../components/MediaList'));
const Watchlist = React.lazy(() => import('../components/Watchlist'));

const Home: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className='bg-black'>
      <Suspense
        fallback={
          <div className='flex items-center justify-center w-full min-h-screen'>
            <div className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'></div>
          </div>
        }
      >
        <Navbar />
        <Feature />
        <Lists title={'Featured today'} listFor='Feature' />
        <PopularCelebrity />
        <h1 className='container text-4xl max-lg:text-2xl text-primary font-semibold'>
          What to Watch
        </h1>
        <MediaList title='Trendings' />
        <MediaList title='Upcomings Movies' />
        <MediaList title='Popular Movies' />
        {user ? <MediaList title='From your watchlist' /> : <Watchlist />}
        <MediaList title='TV Airings' />
        <MediaList title='Popular TV Shows' />
      </Suspense>
    </div>
  );
};

export default Home;
