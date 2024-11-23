import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
const UserList = () => {
  return (
    <div className='container flex flex-col gap-3 py-3 text-white'>
      <h1 className='text-2xl font-semibold pl-3 mt-10 border-l-4 border-primary'>
        From your WatchList
      </h1>
      <div className='flex flex-col items-center justify-center gap-6'>
        <AddIcon className='bg-black-100 ' style={{ fontSize: '2.5rem' }} />
        <div className='text-center'>
          <p className='font-semibold'>Sign in to access your Watchlist</p>
          <p>Save shows and movies to keep track of what you want to watch.</p>
        </div>
        <Link
          to={'/sign'}
          className='group relative p-3 text-secondary bg-gray-400 text-sm font-medium rounded-3xl cursor-pointer'
        >
          <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
          Sign in to IMDB
        </Link>
      </div>
    </div>
  );
};

export default UserList;
