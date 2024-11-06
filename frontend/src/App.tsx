import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Videos from './pages/Videos';
import ListDetails from './pages/ListDetails';
import CelebrityDetails from './pages/CelebrityDetails';
import Media from './pages/Media';
import MediaDetail from './components/MediaDetail';

const App = () => {
  return (
    <div className='font-roboto'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/videos' element={<Videos />} />
        <Route path='/listDetails' element={<ListDetails />} />
        <Route path='/celebrityDetails' element={<CelebrityDetails />} />
        <Route path='/media' element={<Media />} />
        <Route path='/mediaDetail' element={<MediaDetail />} />
      </Routes>
    </div>
  );
};

export default App;
