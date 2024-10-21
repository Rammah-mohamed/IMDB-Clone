import SearchIcon from '@mui/icons-material/Search';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import TvIcon from '@mui/icons-material/Tv';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import LabelIcon from '@mui/icons-material/Label';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { useEffect } from 'react';

type SeachMenuProps = {
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchText: React.Dispatch<React.SetStateAction<String>>;
};

const SearchMenu: React.FC<SeachMenuProps> = ({ showSearch, setShowSearch, setSearchText }) => {
  const searchText: string[] = [
    'All',
    'Titles',
    'TV Episodes',
    'Celebs',
    'Companies',
    'Keyword',
    'Advanced Search',
  ];
  const icons: any[] = [
    <SearchIcon className="text-gray-300 group-hover:text-white" />,
    <LocalMoviesIcon className="text-gray-300 group-hover:text-white" />,
    <TvIcon className="text-gray-300 group-hover:text-white" />,
    <PeopleIcon className="text-gray-300 group-hover:text-white" />,
    <BusinessIcon className="text-gray-300 group-hover:text-white" />,
    <LabelIcon className="text-gray-300 group-hover:text-white" />,
    <FindInPageIcon className="text-gray-300 group-hover:text-white" />,
  ];

  //Close the menu when you click outside it
  const handleClick = (e: MouseEvent): void => {
    if (e.target instanceof HTMLElement && !e.target.classList.contains('searchMenu')) {
      setShowSearch(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  });

  const handleText = (e: React.MouseEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLElement;
    if (target && target.textContent) {
      setSearchText(target.textContent);
    }
  };

  return (
    <div
      className={`SearchMenu absolute flex flex-col gap-2 left-0 bottom-0 bg-gray-400 translate-y-full z-30 overflow-hidden transition-all duration-300 ease-in-out ${
        showSearch ? 'w-max' : 'w-0'
      }`}
    >
      {searchText.map((el: string, index: number) => (
        <div
          key={index}
          className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-300"
          onClick={handleText}
        >
          {icons[index]}
          <span className={`text-base ${index === 0 ? 'text-primary' : 'text-gray-200'}`}>
            {el}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SearchMenu;
