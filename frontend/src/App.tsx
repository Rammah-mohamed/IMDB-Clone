import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Videos from './pages/Videos';

const App = () => {
  return (
    <div className="font-roboto bg-black">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/videos" element={<Videos />} />
      </Routes>
    </div>
  );
};

export default App;
