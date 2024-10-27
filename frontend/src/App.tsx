import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Videos from './pages/Videos';
import ListDetails from './pages/ListDetails';

const App = () => {
  return (
    <div className="font-roboto">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/listDetails" element={<ListDetails />} />
      </Routes>
    </div>
  );
};

export default App;
