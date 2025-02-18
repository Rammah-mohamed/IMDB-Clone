import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import TvIcon from '@mui/icons-material/Tv';
import PeopleIcon from '@mui/icons-material/People';

type Props = {
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
};

// Search menu items
const icons: any[] = [
  <SearchIcon className='text-gray-300 group-hover:text-white' style={{ fontSize: '3rem' }} />,
  <LocalMoviesIcon className='text-gray-300 group-hover:text-white' style={{ fontSize: '3rem' }} />,
  <TvIcon className='text-gray-300 group-hover:text-white' style={{ fontSize: '3rem' }} />,
  <PeopleIcon className='text-gray-300 group-hover:text-white' style={{ fontSize: '3rem' }} />,
];

// Seach bar filter menu text
const searchText: string[] = ['All', 'Movies', 'TV Shows', 'Celebs'];
const MobileSearchMenu: React.FC<Props> = React.memo(({ setSearchText }) => {
  const [active, setActive] = useState<string>('All');
  const handleActive = (text: string) => {
    setActive(text);
    setSearchText(text);
  };

  return (
    <div className='bg-black-100 text-white' style={{ minHeight: 'calc(100vh - 84px)' }}>
      <h1 className='text-center text-2xl bg-black-100 pt-4 pb-8 border-b-2 border-primary'>
        Search Filter
      </h1>
      <div className='container pt-6'>
        <div className='flex flex-col gap-10'>
          {searchText?.map((text: string, index: number) => (
            <div
              className={`flex items-center gap-4 ${text === active ? 'text-primary' : ''}`}
              onClick={() => handleActive(text)}
            >
              {icons[index]}
              <span className='text-2xl'>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default MobileSearchMenu;
