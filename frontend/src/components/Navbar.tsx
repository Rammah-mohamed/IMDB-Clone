import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Menu from './Menu';
import SearchMenu from './SearchMenu';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

const Navbar = () => {
  const [query, setQuery] = useState<string>('');
  const [focus, setFocus] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('All');
  const navigate = useNavigate();

  const handleSearch = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' && focus && query.trim() !== '') {
      navigate('/search', { state: { query: query, filter: searchText } });
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleSearch);
    return () => window.removeEventListener('keydown', handleSearch);
  });
  return (
    <div className='container bg-black-100'>
      <div className='relative flex items-center justify-between py-3 font-bold'>
        <Link to={'/'}>
          <h1 className=' bg-primary py-0.5 px-1.5 text-xl font-black rounded'>IMDB</h1>
        </Link>
        <div
          className='flex items-center gap-1 py-1 px-3 text-white text-sm cursor-pointer rounded hover:bg-gray'
          onClick={(): void => setShowMenu(true)}
        >
          <MenuIcon />
          <span>Menu</span>
          <Menu showMenu={showMenu} setShowMenu={setShowMenu} />
        </div>
        <div
          className='relative flex items-center w-3/5'
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        >
          <div
            className='relative flex items-center justify-center h-full w-fit py-1.5 pl-2 pr-0.5 bg-white font-semibold text-sm cursor-pointer select-none rounded hover:bg-gray-200 border-r border-r-gray-300 border-br-none border-tr-none'
            onClick={(): void => setShowSearch((prev) => !prev)}
          >
            <span className='text-md'>{searchText}</span>
            {showSearch ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            <SearchMenu
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              setSearchText={setSearchText}
              menuFor='Navbar'
            />
          </div>
          <input
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='flex-1 h-full p-2 bg-white text-base font-medium rounded outline-none'
            placeholder='Search IMDB'
            style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
          />
          <span className='absolute right-0 top-0 h-full pr-2 flex items-center text-gray-300'>
            <SearchIcon className='cursor-pointer' />
          </span>
        </div>
        <p className='py-1 px-3 text-white text-sm rounded hover:bg-gray border-r-2 border-gray-300 cursor-pointer'>
          IMDB<span className='text-md text-secondary'>Pro</span>
        </p>
        <Link
          to={''}
          className='flex items-center gap-1 py-1 px-3 text-white text-sm rounded hover:bg-gray'
        >
          <LibraryAddIcon />
          <span>Watchlist</span>
        </Link>
        <Link
          to={''}
          className=' py-1 px-3 text-white text-sm rounded hover:bg-gray'
          style={{ marginLeft: '-0.5rem' }}
        >
          Sign In
        </Link>
        <span className='py-1 px-3 text-white text-sm rounded hover:bg-gray cursor-pointer'>
          EN
        </span>
      </div>
    </div>
  );
};

export default Navbar;
