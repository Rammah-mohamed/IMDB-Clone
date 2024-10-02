import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

const Navbar = () => {
  return (
    <div className="container bg-lightBlack">
      <div className="flex items-center justify-center gap-2 py-4">
        <Link to={'/'}>
          <h1 className=" bg-primary py-0.5 px-1.5 text-xl font-black rounded">
            IMDB
          </h1>
        </Link>
        <div className="flex items-center gap-1 py-1 px-4 text-white text-sm cursor-pointer rounded hover:bg-gray">
          <MenuIcon />
          <span>Menu</span>
        </div>
        <div className="flex items-center w-2/4 relative">
          <div
            className="flex items-center justify-center absolute h-full left-0 top-0 py-0.5 pl-1.5 pr-0.5 font-semibold text-sm cursor-pointer rounded hover:bg-gray"
            style={{ borderRight: '1px solid #777' }}
          >
            <span className="text-md">All</span>
            <ArrowDropDownIcon />
          </div>
          <input
            type="text"
            className="w-full h-full px-16 py-2 text-base font-medium rounded outline-none"
            placeholder="Search IMDB"
          />
          <span
            className="absolute right-0 top-0 h-full pr-2 flex items-center"
            style={{ color: '#777' }}
          >
            <SearchIcon />
          </span>
        </div>
        <Link
          to={''}
          className="flex items-center gap-1 py-1 px-4 text-white text-sm rounded hover:bg-gray"
        >
          <LibraryAddIcon />
          <span>Watchlist</span>
        </Link>
        <Link
          to={''}
          className=" py-1 px-4 text-white text-sm rounded hover:bg-gray"
          style={{ marginLeft: '-0.5rem' }}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
