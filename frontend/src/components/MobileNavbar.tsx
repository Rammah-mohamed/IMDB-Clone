import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  activeNow?: string;
};

const MobileNavbar: React.FC<Props> = React.memo(({ activeNow }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState<string>('home');
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);

  const icons = [
    {
      key: 'home',
      icon: <HomeIcon style={{ fontSize: containerWidth > 768 ? '3.5rem' : '2rem' }} />,
    },
    {
      key: 'search',
      icon: <SearchIcon style={{ fontSize: containerWidth > 768 ? '3.5rem' : '2rem' }} />,
    },
    {
      key: 'user',
      icon: <AccountCircleIcon style={{ fontSize: containerWidth > 768 ? '3.5rem' : '2rem' }} />,
    },
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
    <div className='fixed bottom-0 left-0 w-screen bg-black-100  py-6 max-md:py-3 px-20 z-50'>
      <div className='container'>
        <div className='flex  items-center justify-between'>
          {icons.map(({ key, icon }) => (
            <button
              data-testid={key + '-icon'}
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
