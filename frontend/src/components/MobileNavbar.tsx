import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const icons = [
  { key: 'home', icon: <HomeIcon style={{ fontSize: '3.5rem' }} /> },
  { key: 'search', icon: <SearchIcon style={{ fontSize: '3.5rem' }} /> },
  { key: 'user', icon: <AccountCircleIcon style={{ fontSize: '3.5rem' }} /> },
];

type Props = {
  activeNow?: string;
};

const MobileNavbar: React.FC<Props> = React.memo(({ activeNow }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState<string>('home');

  // Set the acive page Icon
  useEffect(() => {
    if (activeNow) {
      setActive(activeNow);
    }
  }, [activeNow]);

  const handleActive = (key: string) => {
    setActive(key);

    switch (key) {
      case 'home':
        navigate('/');
        break;
      case 'search':
        navigate('/mobileSearch');
        break;
      case 'user':
        navigate('/user');
        break;
      default:
        return;
    }
  };

  return (
    <div className='fixed bottom-0 left-0 w-screen bg-black-100 mt-10 py-6 px-20'>
      <div className='container'>
        <div className='flex  items-center justify-between'>
          {icons.map(({ key, icon }) => (
            <button
              key={key}
              className={`text-gray-300 ${active === key ? 'text-white' : ''}`}
              onClick={() => handleActive(key)}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default MobileNavbar;
