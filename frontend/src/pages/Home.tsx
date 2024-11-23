import Feature from '../components/Feature';
import Lists from '../components/Lists';
import MediaList from '../components/MediaList';
import Navbar from '../components/Navbar';
import PopularCelebrity from '../components/PopularCelebrity';
import UserList from '../components/UserList';

type Props = {
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

const Home: React.FC<Props> = ({ isLogged, setIsLogged }) => {
  return (
    <div className='bg-black'>
      <Navbar isLogged={isLogged} setIsLogged={setIsLogged} />
      <Feature />
      <Lists title={'Featured today'} listFor='Feature' />
      <PopularCelebrity />
      <h1 className='container text-4xl text-primary font-semibold'>What to Watch</h1>
      <MediaList title='Trendings' />
      <MediaList title='Upcomings Movies' />
      <MediaList title='Popular Movies' />
      <UserList />
      <MediaList title='TV Airings' />
      <MediaList title='Popular TV Shows' />
    </div>
  );
};

export default Home;
