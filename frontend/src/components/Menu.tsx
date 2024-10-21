import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import TvIcon from '@mui/icons-material/Tv';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

type MenuProps = {
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
};

const Menu: React.FC<MenuProps> = ({ showMenu, setShowMenu }) => {
  const movies: String[] = [
    'Top 250 Movies',
    'Trending Movies',
    'Upcoming Movies',
    'Most Popular Movies',
    'Browse Movies By Genre',
  ];
  const shows: String[] = [
    'Top 250 TV Shows',
    "What's on TV & Streaming",
    'Trending TV Shows',
    'Most Popular TV Shows',
    'Browse TV Shows By Genre',
  ];
  const trailers: String[] = ['Watch Trailers', 'Latest Trailer', 'IMDB Originals', 'IMDB Picks'];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    const target = e.target as HTMLButtonElement;
    if (target) {
      setShowMenu(false);
    }
  };

  return (
    <div
      className={`container flex flex-col gap-10 fixed top-0 left-0 w-screen px-72 bg-gray-400 z-40 overflow-hidden transition-all duration-300 ease-in-out ${
        showMenu ? 'h-screen pt-10 pb-10' : 'h-0'
      }`}
    >
      <div className="flex items-center justify-between">
        <Link to={'/'}>
          <h1 className=" bg-primary py-1.5 px-2.5 text-3xl text-black font-black rounded">IMDB</h1>
        </Link>
        <button className="bg-primary text-black rounded-full p-2" onClick={handleClick}>
          <CloseIcon style={{ fontSize: '2rem' }} />
        </button>
      </div>
      <div className="flex items-center gap-40">
        <div className="flex gap-2">
          <LocalMoviesIcon className="text-primary" style={{ fontSize: '1.5rem' }} />
          <div className="flex flex-col gap-4 text-gray-200 text-base">
            <h1 className="text-white text-2xl">Movies</h1>
            {movies.map((m: String, index: number) => (
              <Link key={index} to={''} className="hover:underline">
                {m}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <TvIcon className="text-primary" style={{ fontSize: '1.5rem' }} />
          <div className="flex flex-col gap-4 text-gray-200 text-base">
            <h1 className="text-white text-2xl">TV Shows</h1>
            {shows.map((s: String, index: number) => (
              <Link key={index} to={''} className="hover:underline">
                {s}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <VideoLibraryIcon className="text-primary" style={{ fontSize: '1.5rem' }} />
          <div className="flex flex-col gap-4 text-gray-200 text-base">
            <h1 className="text-white text-2xl">Watch</h1>
            {trailers.map((t: String, index: number) => (
              <Link key={index} to={''} className="hover:underline">
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
