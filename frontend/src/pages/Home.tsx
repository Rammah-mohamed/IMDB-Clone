import Navbar from '../components/Navbar';
import Feature from '../components/Feature';
import Lists from '../components/Lists';
import PopularCelebrity from '../components/PopularCelebrity';
import MediaList from '../components/MediaList';
import Watchlist from '../components/Watchlist';

const Home: React.FC = () => {
  return (
    <div className='bg-black'>
      <Navbar />
      <Feature />
      <Lists title={'Featured today'} listFor='Feature' />
      <PopularCelebrity />
      <h1 className='container text-4xl text-primary font-semibold'>What to Watch</h1>
      <MediaList title='Trendings' />
      <MediaList title='Upcomings Movies' />
      <MediaList title='Popular Movies' />
      <Watchlist />
      <MediaList title='TV Airings' />
      <MediaList title='Popular TV Shows' />
    </div>
  );
};

export default Home;
