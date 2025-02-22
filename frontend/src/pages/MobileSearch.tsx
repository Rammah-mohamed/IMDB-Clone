import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

// lazy load component
const MobileSearchMenu = React.lazy(() => import('../components/MobileSearchMenu'));
const MobileNavbar = React.lazy(() => import('../components/MobileNavbar'));

const MobileSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>('');
  const [focus, setFocus] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('All');

  // Navigate to the search page when pressing Enter key and the input it's valid
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && focus && query.trim() !== '') {
        navigate('/search', { state: { query, filter: searchText } });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focus, query, searchText]);

  return (
    <div className='bg-black min-h-screen'>
      <div className='container'>
        <div className='flex gap-6 max-md:gap-3 py-6'>
          <div
            className='relative flex flex-1 items-center w-3/5 h-14 max-md:h-10'
            onFocus={() => setFocus(true)}
          >
            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='flex-1 h-full p-3 max-md:p-1.5 bg-white text-2xl max-md:text-base font-medium rounded outline-none'
              placeholder='Search IMDB'
              style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
            />
            <span className='absolute right-0 top-0 h-full pr-2 flex items-center text-gray-300'>
              <SearchIcon className='cursor-pointer' style={{ fontSize: '2rem' }} />
            </span>
          </div>
          <button
            className='text-2xl max-md:text-base text-secondary'
            onClick={() => setFocus(false)}
          >
            Cancel
          </button>
        </div>
      </div>
      <MobileNavbar activeNow='search' />
      {focus && <MobileSearchMenu setSearchText={setSearchText} />}
    </div>
  );
};

export default MobileSearch;
