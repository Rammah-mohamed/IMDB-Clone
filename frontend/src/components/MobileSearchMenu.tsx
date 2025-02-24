import React, { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import TvIcon from '@mui/icons-material/Tv';
import PeopleIcon from '@mui/icons-material/People';

// Props Type
type Props = {
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
};

// Seach bar filter menu text
const searchText: string[] = ['All', 'Movies', 'TV Shows', 'Celebs'];
const MobileSearchMenu: React.FC<Props> = React.memo(({ setSearchText }) => {
  const [active, setActive] = useState<string>('All');
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);

  // Search menu items
  const icons: any[] = [
    <SearchIcon
      className='text-gray-300 group-hover:text-white'
      style={{ fontSize: containerWidth > 768 ? '3rem' : '2rem' }}
    />,
    <LocalMoviesIcon
      className='text-gray-300 group-hover:text-white'
      style={{ fontSize: containerWidth > 768 ? '3rem' : '2rem' }}
    />,
    <TvIcon
      className='text-gray-300 group-hover:text-white'
      style={{ fontSize: containerWidth > 768 ? '3rem' : '2rem' }}
    />,
    <PeopleIcon
      className='text-gray-300 group-hover:text-white'
      style={{ fontSize: containerWidth > 768 ? '3rem' : '2rem' }}
    />,
  ];

  // Responsive container
  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleActive = (text: string) => {
    setActive(text);
    setSearchText(text);
  };

  return (
    <div className='bg-black-100 text-white' style={{ minHeight: 'calc(100vh - 84px)' }}>
      <h1 className='text-center text-2xl max-md:text-base bg-black-100 pt-4 pb-8 max-md:pt-2 max-md:pb-4 border-b-2 border-primary'>
        Search Filter
      </h1>
      <div className='container pt-6 max-md:pt-3'>
        <div className='flex flex-col gap-10 max-md:gap-6'>
          {searchText?.map((text: string, index: number) => (
            <div
              key={index}
              data-testid={text}
              className={`flex items-center gap-4 max-md:gap-2 ${
                text === active ? 'text-primary' : ''
              }`}
              onClick={() => handleActive(text)}
            >
              {icons[index]}
              <span className='text-2xl max-md:text-base'>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default MobileSearchMenu;
