import React, { useEffect, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import TvIcon from '@mui/icons-material/Tv';
import PeopleIcon from '@mui/icons-material/People';
import LabelIcon from '@mui/icons-material/Label';
import FindInPageIcon from '@mui/icons-material/FindInPage';

// Type of Search menu Props
type SeachMenuProps = {
  showSearch: boolean;
  menuFor: string;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchText?: React.Dispatch<React.SetStateAction<string>>;
  setOrderText?: React.Dispatch<React.SetStateAction<string>>;
};

// Seach bar filter menu text
const searchText: string[] = ['All', 'Movies', 'TV Shows', 'Celebs'];

// Media list filter menu text
const orderText: string[] = [
  'List order',
  'Alphabetical',
  'IMDB Rating',
  'Number Of Ratings',
  'Popularity',
  'Release Data',
];

// Search menu items
const icons: any[] = [
  <SearchIcon className='text-gray-300 group-hover:text-white' />,
  <LocalMoviesIcon className='text-gray-300 group-hover:text-white' />,
  <TvIcon className='text-gray-300 group-hover:text-white' />,
  <PeopleIcon className='text-gray-300 group-hover:text-white' />,
  <LabelIcon className='text-gray-300 group-hover:text-white' />,
  <FindInPageIcon className='text-gray-300 group-hover:text-white' />,
];

const SearchMenu: React.FC<SeachMenuProps> = React.memo(
  ({ showSearch, menuFor, setShowSearch, setSearchText, setOrderText }) => {
    const [active, setActive] = useState<string>(menuFor === 'Navbar' ? 'All' : 'List order');
    const dropDownRef = useRef<HTMLDivElement>(null);

    // Close the menu when you click outside it
    const handleMenu = (e: MouseEvent): void => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };

    useEffect(() => {
      document.addEventListener('mousedown', handleMenu);
      return () => {
        document.removeEventListener('mousedown', handleMenu);
      };
    }, []);

    // Set the Menu text to the text that has been clicked and active it
    const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
      const target = e.target as HTMLElement;
      if (target?.textContent) {
        setSearchText && setSearchText(target.textContent);
        setOrderText && setOrderText(target.textContent);
        setActive(target.textContent);
      }
    };

    return (
      <div
        ref={dropDownRef}
        className={`absolute flex flex-col gap-2 left-0 bottom-0 ${
          menuFor === 'Navbar' ? 'bg-gray-400' : 'bg-white border-2 border-gray-250 shadow-xl'
        } translate-y-full z-30 overflow-hidden transition-all duration-300 ease-in-out ${
          showSearch ? 'w-max h-max' : 'border-0 w-0 h-0'
        }`}
      >
        {(menuFor === 'Navbar' ? searchText : orderText)?.map((el: string, index: number) => (
          <div
            key={index}
            className={`group flex items-center gap-3 w-full h-full px-4 py-3 ${
              menuFor === 'Navbar' && 'hover:bg-gray-300'
            } ${menuFor === 'List' && 'hover:bg-secondary'}`}
            onClick={handleClick}
          >
            {menuFor === 'Navbar' && icons[index]}
            <span
              className={`text-base ${
                active === el
                  ? menuFor === 'Navbar'
                    ? 'text-primary'
                    : 'text-secondary group-hover:text-white'
                  : menuFor === 'Navbar'
                  ? 'text-gray-200'
                  : 'text-black group-hover:text-white'
              }`}
            >
              {el}
            </span>
          </div>
        ))}
      </div>
    );
  }
);

export default SearchMenu;
