import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

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
const MediaDetail = React.lazy(() => import('./components/MediaDetail'));
const Critics = React.lazy(() => import('./pages/Critics'));

const App = () => {
  return (
    <div className='font-roboto'>
      <Suspense
        fallback={
          <div className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'></div>
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
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
