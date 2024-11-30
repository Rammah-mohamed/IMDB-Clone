import axios from 'axios';
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

type menuProps = {
  showUserMenu: boolean;
  setshowUserMenu: React.Dispatch<React.SetStateAction<boolean>>;
};

const text: string[] = ['your Watchlist', 'your Lists', 'Sign out'];

const UserMenu: React.FC<menuProps> = ({ showUserMenu, setshowUserMenu }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dropDownRef = useRef<HTMLDivElement>(null);

  //Close the menu when you click outside it
  const handleMenu = (e: MouseEvent): void => {
    if (dropDownRef.current && !dropDownRef.current.contains(e.target as Node)) {
      setshowUserMenu(false);
    }
  };

  const handleClick = async (index: number) => {
    if (index === 0) {
      navigate('/listDetails');
    } else if (index === 1) {
      navigate('/userLists');
    } else {
      try {
        const response = await axios.post('http://localhost:3000/auth/logout');
        if (response.data === 'Logged out successfully.') {
          logout();
          navigate('/');
        }
      } catch (error: any) {
        console.error(error.response.data);
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
      className={`absolute flex flex-col gap-2 left-0 bottom-0 bg-gray-400 translate-y-full z-30 overflow-hidden transition-all duration-300 ease-in-out ${
        showUserMenu ? 'w-max h-max' : 'border-0 w-0 h-0'
      }`}
    >
      {text.map((el: string, index: number) => (
        <div
          key={index}
          className='group flex items-center gap-3 px-4 py-3 hover:bg-gray-300'
          onClick={() => handleClick(index)}
        >
          <span className='text-base text-gray-200 group-hover:text-white'>{el}</span>
        </div>
      ))}
    </div>
  );
};

export default UserMenu;
