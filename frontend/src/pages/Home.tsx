import Feature from '../components/Feature';
import Lists from '../components/Lists';
import Navbar from '../components/Navbar';
import PopularPeople from '../components/PopularPeople';
import {
  GET_UPCOMING_MOVIES,
  GET_TV_AIRING,
  GET_TV_Popular,
  GET_POPULAR_MOVIES,
} from '../graphql/queries';

const listData = [
  { query: GET_UPCOMING_MOVIES, name: 'Upcomings Movies' },
  { query: GET_POPULAR_MOVIES, name: 'Popular Movies' },
  { query: GET_TV_AIRING, name: 'TV Airings' },
  { query: GET_TV_Popular, name: 'Popular TV' },
];

const Home = () => {
  return (
    <div>
      <Navbar />
      <Feature />
      <Lists title={'Featured today'} data={listData} />
      <PopularPeople />
    </div>
  );
};

export default Home;
