import React, { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from './context/authContext';

// Lazy load for Routes
const Home = React.lazy(() => import('./pages/Home'));
const Sign = React.lazy(() => import('./pages/Sign'));
const UserLists = React.lazy(() => import('./pages/UserLists'));
const CreateList = React.lazy(() => import('./pages/CreateList'));
const Search = React.lazy(() => import('./pages/Search'));
const Videos = React.lazy(() => import('./pages/Videos'));
const ListDetails = React.lazy(() => import('./pages/ListDetails'));
const CelebrityDetails = React.lazy(() => import('./pages/CelebrityDetails'));
const Media = React.lazy(() => import('./pages/Media'));
const MediaDetail = React.lazy(() => import('./pages/MediaDetail'));
const Critics = React.lazy(() => import('./pages/Critics'));
const MobileSearch = React.lazy(() => import('./pages/MobileSearch'));
const User = React.lazy(() => import('./pages/User'));

const App = () => {
  const { login } = useAuth();

  // Preconnect Graphql / Transform images servers URLs
  useEffect(() => {
    const transformImageLink = document.createElement('link');
    const graphqlLink = document.createElement('link');
    const mongoDblLink = document.createElement('link');

    transformImageLink.rel = 'preconnect';
    graphqlLink.rel = 'preconnect';
    mongoDblLink.rel = 'preconnect';

    transformImageLink.href = 'http://localhost:3100';
    mongoDblLink.href = 'http://localhost:3000/';
    graphqlLink.href = 'http://localhost:4000/graphql';

    document.head.appendChild(transformImageLink);
    document.head.appendChild(mongoDblLink);
    document.head.appendChild(graphqlLink);
  }, []);

  // Check if user is authenticated on page load (after refresh)
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // set state or use storedUser for re-authentication
      login(parsedUser.username);
    }
  }, []);

  return (
    <div className='font-roboto'>
      <Suspense
        fallback={
          <div className='w-full min-h-screen flex items-center justify-center'>
            <div className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'></div>
          </div>
        }
      >
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/sign' element={<Sign />} />
          <Route path='/userLists' element={<UserLists />} />
          <Route path='/createList' element={<CreateList />} />
          <Route path='/search' element={<Search />} />
          <Route path='/videos' element={<Videos />} />
          <Route path='/listDetails' element={<ListDetails />} />
          <Route path='/celebrityDetails' element={<CelebrityDetails />} />
          <Route path='/media' element={<Media />} />
          <Route path='/mediaDetail' element={<MediaDetail />} />
          <Route path='/critics' element={<Critics />} />
          <Route path='/mobileSearch' element={<MobileSearch />} />
          <Route path='/user' element={<User />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
