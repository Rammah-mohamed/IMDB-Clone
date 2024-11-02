import Feature from '../components/Feature';
import Lists from '../components/Lists';
import Navbar from '../components/Navbar';
import PopularCelebrity from '../components/PopularCelebrity';

const Home = () => {
  return (
    <div className='bg-black'>
      <Navbar />
      <Feature />
      <Lists title={'Featured today'} listFor='Feature' />
      <PopularCelebrity />
    </div>
  );
};

export default Home;
