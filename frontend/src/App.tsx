import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Videos from './pages/Videos';
import ListDetails from './pages/ListDetails';
import CelebrityDetails from './pages/CelebrityDetails';
import Media from './pages/Media';
import MediaDetail from './components/MediaDetail';
import Critics from './pages/Critics';
import Search from './pages/Search';
import Sign from './pages/Sign';
import { useState } from 'react';

const App = () => {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  return (
    <div className='font-roboto'>
      <Routes>
        <Route path='/' element={<Home isLogged={isLogged} setIsLogged={setIsLogged} />} />
        <Route path='/sign' element={<Sign setIsLogged={setIsLogged} />} />
        <Route path='/search' element={<Search />} />
        <Route path='/videos' element={<Videos />} />
        <Route path='/listDetails' element={<ListDetails />} />
        <Route path='/celebrityDetails' element={<CelebrityDetails />} />
        <Route path='/media' element={<Media />} />
        <Route path='/mediaDetail' element={<MediaDetail />} />
        <Route path='/critics' element={<Critics />} />
      </Routes>
    </div>
  );
};

export default App;
