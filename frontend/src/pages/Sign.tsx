import { useEffect, useState } from 'react';
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
        localStorage.setItem(
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

  // Check if user is authenticated on page load (after refresh)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // set state or use storedUser for re-authentication
      login(parsedUser.username);
    }
  }, []);

  // Handle Create
  const handleCreate = () => {
    setError(null);
    navigate('/sign', { state: 'create' });
  };

  return (
    <div className='bg-white'>
      <div className='container flex flex-col items-center gap-6 h-screen pt-10'>
        <Link to={'/'}>
          <h1 className='bg-primary py-1 px-2 text-4xl font-black rounded'>IMDB</h1>
        </Link>
        <div className='flex flex-col justify-center gap-4 bg-gray-100 text-black w-96 p-4 border-2 border-gray-250 rounded-md'>
          <span className='text-3xl'>Sign in</span>
          {create && (
            <div className='flex flex-col gap-2 text-sm font-semibold'>
              <label htmlFor='user'>UserName</label>
              <input
                type='text'
                id='user'
                value={user.username}
                required
                onChange={(e) => setUser((prev) => ({ ...prev, username: e.target.value }))}
                className='w-full h-10 p-1 border-2 border-gray-250 focus:outline-none focus:border-secondary'
              />
            </div>
          )}
          <div className='flex flex-col gap-2 text-sm font-semibold'>
            <label htmlFor='mail'>Email or mobile phone number</label>
            <input
              type='mail'
              id='mail'
              value={user.email}
              required
              onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
              className='w-full h-10 p-1 border-2 border-gray-250 focus:outline-none focus:border-secondary'
            />
          </div>
          <div className='flex flex-col gap-2 text-sm font-semibold'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              value={user.password}
              required
              onChange={(e) => setUser((prev) => ({ ...prev, password: e.target.value }))}
              className='w-full h-10 p-1 border-2 border-gray-250 focus:outline-none focus:border-secondary'
            />
          </div>
          <button className='bg-primary py-1 px-2 font-black rounded' onClick={handleLogging}>
            {create ? 'Create' : 'Sign in'}
          </button>
          <span className='text-sm text-gray-300 w-full text-center'>New to IMDB?</span>
          <button
            className='bg-white hover:bg-gray-200 py-1 px-2 font-medium border-2 border-gray-250 rounded'
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
