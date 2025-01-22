import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Type of user menu
type menuProps = {
  showUserMenu: boolean;
  setshowUserMenu: React.Dispatch<React.SetStateAction<boolean>>;
};

// Menu text
const text: string[] = ['your Watchlist', 'your Lists', 'Sign out'];

const UserMenu: React.FC<menuProps> = React.memo(({ showUserMenu, setshowUserMenu }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dropDownRef = useRef<HTMLDivElement>(null);

  //Close the menu when you click outside it
  const handleMenu = (e: MouseEvent): void => {
    if (dropDownRef.current && !dropDownRef.current.contains(e.target as Node)) {
      setshowUserMenu(false);
    }
  };

  // Navigate to a page depending on the text that has been clicked
  const handleClick = async (index: number) => {
    if (index === 0) {
      navigate('/listDetails');
    } else if (index === 1) {
      navigate('/userLists');
    } else {
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
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleMenu);
    return () => {
      document.removeEventListener('mousedown', handleMenu);
    };
  }, []);

  return (
    <div
      ref={dropDownRef}
      className={`absolute flex flex-col gap-2 left-0 bottom-0 bg-gray-400 translate-y-full z-40 overflow-hidden transition-all duration-300 ease-in-out  ${
        showUserMenu ? 'w-max h-max' : 'border-0 w-0 h-0'
      }`}
    >
      {text.map((el: string, index: number) => (
        <div
          key={index}
          className='group flex items-center gap-3 w-full h-full px-4 py-3 hover:bg-gray-300'
          onClick={() => handleClick(index)}
        >
          <span className='text-base text-gray-200 group-hover:text-white'>{el}</span>
        </div>
      ))}
    </div>
  );
});

export default UserMenu;
