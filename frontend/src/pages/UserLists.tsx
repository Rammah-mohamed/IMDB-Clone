import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { List, Media } from '../types/media';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';

const UserLists = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>();
  const navigate = useNavigate();

  const handleCreate = () => {
    if (user) {
      navigate('/createList');
    } else navigate('/sign');
  };

  useEffect(() => {
    const getList = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/lists`, {
          withCredentials: true,
        });
        console.log(response.data);
        setLists(response.data);
      } catch (error: any) {
        console.error(error.response.data);
      }
    };
    getList();
  }, []);

  const handleMedia = async (list: List) => {
    try {
      const getResponse = await axios.get('http://localhost:3000/movies', {
        withCredentials: true,
      });
      console.log(getResponse.data);
      const media = getResponse?.data?.filter((d: Media) => list?.movies?.some((m) => m === d._id));
      navigate('/listDetails', {
        state: { title: list.name, discription: list.discription, data: media },
      });
    } catch (error: any) {
      console.error(error.response.data);
    }
  };

  return (
    user && (
      <div>
        <Navbar />
        <div className='container flex items-center justify-between bg-gray-400 pt-8 pb-8'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-white text-4xl font-medium mb-4'>Your Lists</h1>
            <p className='text-gray-250'>
              by <span className='text-secondary'>{user}</span>
            </p>
            <p className='text-gray-250'>A collection of lists you've created on IMDb</p>
          </div>
          <div className='relative group flex items-center gap-1 bg-primary p-3 font-medium rounded-3xl cursor-pointer'>
            <div className='items-end gap-3 absolute top-0 left-0 w-full h-full p-4 bg-overlay z-20 hidden group-hover:flex'></div>
            <AddIcon />
            <span className='relative z-30' onClick={handleCreate}>
              Create a new list
            </span>
          </div>
        </div>
        <div className='container flex gap-20 bg-white pt-6'>
          {lists?.length === 0 && (
            <p className='flex-3'>
              You have not created any lists yet.{' '}
              <span
                className='text-secondary font-medium hover:underline cursor-pointer'
                onClick={handleCreate}
              >
                Create a new list
              </span>
            </p>
          )}
          {lists?.length !== 0 && (
            <div className='flex flex-3 flex-col gap-6 p-6 border-2 border-gray-250 rounded-xl'>
              {lists?.map((l, index: number) => (
                <div key={index} className='flex items-center justify-between'>
                  <div className='flex items-center gap-3' onClick={() => handleMedia(l)}>
                    <div className='group relative flex items-center justify-center w-20 h-28 bg-gray-250 border-2 border-gray-250 rounded-xl cursor-pointer overflow-hidden'>
                      <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                      <LocalMoviesIcon style={{ fontSize: '3.5em' }} className='text-gray-300' />
                    </div>
                    <span className='font-semibold cursor-pointer hover:underline'>{l?.name}</span>
                  </div>
                  <MoreVertIcon className='text-gray-350' />
                </div>
              ))}
            </div>
          )}

          <div className='flex flex-1 flex-col gap-4'>
            <h1 className='text-3xl font-semibold pl-3 border-l-4 border-primary'>
              More to explore
            </h1>
            <div className='flex flex-col gap-3 p-4 border-2 border-gray-250 rounded-sm'>
              <h2 className='text-2xl font-medium'>Feedback</h2>
              <p className='text-secondary hover:underline cursor-pointer'>
                Tell us what you think about this feature.
              </p>
              <p className='text-secondary hover:underline cursor-pointer'>Report this list.</p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default UserLists;
