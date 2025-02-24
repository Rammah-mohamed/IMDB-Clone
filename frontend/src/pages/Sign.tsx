import { useState } from 'react';
import { useAuth } from '../context/authContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { List } from '../types/media';
import axios from 'axios';

// Type for user
type User = {
  username?: string;
  email: string;
  password: string;
};

const Sign: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const create = location.state;

  // Initialize state
  const [user, setUser] = useState<User>({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);

  const handleLogging = async () => {
    try {
      let response;
      // Register or login based on the 'create' flag
      if (create) {
        response = await axios.post('http://localhost:3000/auth/register', {
          username: user.username,
          email: user.email,
          password: user.password,
        });
      } else {
        response = await axios.post(
          'http://localhost:3000/auth/login',
          {
            email: user.email,
            password: user.password,
          },
          { withCredentials: true }
        );
      }

      if (
        response.data.message === 'Logged in successfully.' ||
        response.data.message === 'User registered successfully.'
      ) {
        // Save user data to localStorage for persistence
        sessionStorage.setItem(
          'user',
          JSON.stringify({
            username: response.data.username,
            email: response.data.email,
          })
        );

        login(response.data.username);

        // Get user lists and ensure 'Your Watchlist' exists
        const listResponse = await axios.get('http://localhost:3000/lists', {
          withCredentials: true,
        });

        // Check if "Your Watchlist" exists and create it if not
        const isExist = listResponse?.data?.some((l: List) => l.name === 'Your Watchlist');
        if (!isExist) {
          const createResponse = await axios.post(
            'http://localhost:3000/lists',
            {
              name: 'Your Watchlist',
            },
            { withCredentials: true }
          );
          console.log(createResponse?.data);
        }

        // Navigate to home with state
        navigate(location.pathname === '/sign' ? '/' : location.pathname, {
          state: { username: response.data.username, email: response.data.email },
        });
      }
    } catch (error: any) {
      console.error(error?.response?.data || 'An error occurred during login/registration');
      setError(error?.response?.data || 'An error occurred during login/registration');
    }
  };

  // Handle Create
  const handleCreate = () => {
    setError(null);
    navigate('/sign', { state: 'create' });
  };

  return (
    <div className='bg-white'>
      <div className='container flex flex-col items-center gap-6 h-screen pt-10'>
        <Link to={'/'}>
          <h1 className='bg-primary py-1 px-2 text-4xl max-md:text-2xl font-black rounded'>IMDB</h1>
        </Link>
        <div className='flex flex-col justify-center gap-4 max-md:gap-2 bg-gray-100 text-black w-3/5 max-lg:w-4/5 p-4 max-md:p-2 border-2 border-gray-250 rounded-md'>
          <span className='text-3xl max-md:text-xl'>Sign in</span>
          {create && (
            <div className='flex flex-col gap-2 text-sm max-lg:text-lg max-md:text-base font-semibold'>
              <label htmlFor='user'>UserName</label>
              <input
                type='text'
                id='user'
                value={user.username}
                required
                onChange={(e) => setUser((prev) => ({ ...prev, username: e.target.value }))}
                className='w-full h-10 max-md:h-8 p-1 border-2 border-gray-250 focus:outline-none focus:border-secondary'
              />
            </div>
          )}
          <div className='flex flex-col gap-2 text-sm max-lg:text-lg max-md:text-base font-semibold'>
            <label htmlFor='mail'>Email or mobile phone number</label>
            <input
              type='mail'
              id='mail'
              value={user.email}
              required
              onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
              className='w-full h-10 max-md:h-8 max-lg:h-16 py-1 px-2 max-lg:p-3 border-2 border-gray-250 focus:outline-none focus:border-secondary'
            />
          </div>
          <div className='flex flex-col gap-2 text-sm max-lg:text-lg max-md:text-base font-semibold'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              value={user.password}
              required
              onChange={(e) => setUser((prev) => ({ ...prev, password: e.target.value }))}
              className='w-full h-10 max-md:h-8 max-lg:h-16 p-3 border-2 border-gray-250 focus:outline-none focus:border-secondary'
            />
          </div>
          <button
            className='bg-primary py-1 px-2 max-lg:py-2 max-lg:px-3 font-black max-lg:text-xl max-md:text-base rounded'
            onClick={handleLogging}
          >
            {create ? 'Create' : 'Sign in'}
          </button>
          <span className='text-sm max-lg:text-lg max-md:text-base text-gray-300 w-full text-center'>
            New to IMDB?
          </span>
          <button
            className='bg-white max-lg:text-lg max-md:text-base max-lg:h-16 hover:bg-gray-200 py-1 px-2 font-medium border-2 border-gray-250 rounded'
            onClick={handleCreate}
          >
            Create your IMDB account
          </button>
          <span className='text-sm text-red w-full text-center'>{error}</span>
        </div>
      </div>
    </div>
  );
};

export default Sign;
