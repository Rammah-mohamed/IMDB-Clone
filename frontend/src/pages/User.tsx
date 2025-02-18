import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { List } from '../types/media';
import axios from 'axios';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';

// Lazy load components
const Navbar = React.lazy(() => import('../components/Navbar'));
const MobileNavbar = React.lazy(() => import('../components/MobileNavbar'));
const MediaList = React.lazy(() => import('../components/MediaList'));
const Watchlist = React.lazy(() => import('../components/Watchlist'));

const User = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Initialize state
  const [mediaLength, setmediaLength] = useState<number>(0);
  const [listsLength, setListsLength] = useState<number>(0);
  const [lists, setLists] = useState<List[]>();

  // Fetch user's watchlist
  useEffect(() => {
    if (!user) return;

    const getUserMedia = async () => {
      try {
        const response = await axios.get('http://localhost:3000/lists/Your_Watchlist', {
          withCredentials: true,
        });
        setmediaLength(response.data?.movies?.length || null);
      } catch (error: any) {
        console.error(
          error.response ? `Server Error: ${error.response.data}` : `Error: ${error.message}`
        );
      }
    };

    getUserMedia();
  }, [user]);

  // Fetch user lists
  useEffect(() => {
    const getList = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3000/lists`, {
          withCredentials: true,
        });

        setListsLength(data?.length);
        setLists(data);
      } catch (error: any) {
        console.error(error?.response?.data || 'An error occurred');
      }
    };

    getList();
  }, [user]);

  // Fetch list Media
  const handleMedia = async (list: List, edit?: boolean) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/lists/${list.name}`, {
        withCredentials: true,
      });
      const media = data?.movies;

      navigate('/listDetails', {
        state: {
          lists,
          listTitle: list.name,
          description: list.description,
          data: media,
          edit,
        },
      });
    } catch (error: any) {
      console.error(error?.response?.data || 'An error occurred while fetching the list');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3000/auth/logout',
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data === 'Logged out successfully.') {
        localStorage.removeItem('user');
        logout();
        navigate(location.pathname); // Redirect to the current page
      }
    } catch (error: any) {
      console.error(error?.response?.data || 'An error occurred while logging out');
    }
  };

  return (
    <div className='bg-black overflow-hidden'>
      <Navbar />
      <div className='container'>
        {user ? (
          <div className='flex-col gap-8 text-white'>
            <div className='flex flex-col gap-2 bg-gray-500 mt-8 p-8'>
              <div className='flex items-center justify-between gap-2 py-6'>
                <AccountCircleIcon className='flex-1 text-gray-350' style={{ fontSize: '7rem' }} />
                <span className='flex-2 text-2xl'>{user}</span>
                <button
                  className='flex-1 text-right text-secondary p-2 text-2xl cursor-pointer'
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
              <div className='flex gap-6 items-center pb-8'>
                <div className='flex flex-1 flex-col items-center justify-center gap-1 p-6 rounded-lg bg-gray-400 text-xl'>
                  <span>Watchlist</span>
                  <span>{mediaLength}</span>
                </div>
                <div className='flex flex-1 flex-col items-center justify-center gap-1 p-6 rounded-lg bg-gray-400 text-xl'>
                  <span>Lists</span>
                  <span>{listsLength}</span>
                </div>
              </div>
            </div>
            {user ? <MediaList title='From your watchlist' /> : <Watchlist />}
            <div className='flex flex-col gap-4 mt-8 p-8 mb-36 bg-gray-500'>
              <div className='flex items-center'>
                <h1 className='flex-1 text-2xl pl-3 py-2 border-l-4 border-primary'>Your Lists</h1>
                <span className='text-2xl text-secondary' onClick={() => navigate('/userLists')}>
                  See All
                </span>
              </div>
              <div className='flex flex-wrap gap-8 items-center justify-center pb-6'>
                {lists?.map((l: List, index: number) => (
                  <div
                    key={index}
                    className='flex flex-col gap-6 w-48 h-48'
                    onClick={() => handleMedia(l)}
                  >
                    <div className='group relative flex items-center justify-center w-full h-full bg-gray-250 border-2 border-gray-250 rounded-xl cursor-pointer overflow-hidden'>
                      <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                      <LocalMoviesIcon style={{ fontSize: '7.5em' }} className='text-gray-300' />
                    </div>
                    <span className='text-2xl cursor-pointer hover:underline'>{l?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{ height: 'calc(100vh - 64px)' }}
            className='flex items-center justify-center'
          >
            <button
              className='text-3xl text-black bg-primary p-4 rounded-lg'
              onClick={() => navigate('/sign')}
            >
              Sign In
            </button>
          </div>
        )}
      </div>
      <MobileNavbar activeNow='user' />
    </div>
  );
};

export default User;
