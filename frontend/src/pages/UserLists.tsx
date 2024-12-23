import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { List } from '../types/media';
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

  const handleMedia = async (list: List, edit?: boolean) => {
    try {
      const getResponse = await axios.get(`http://localhost:3000/lists/${list.name}`, {
        withCredentials: true,
      });
      const media = getResponse?.data?.movies;
      console.log(lists);
      navigate('/listDetails', {
        state: {
          lists: lists,
          listTitle: list.name,
          description: list.description,
          data: media,
          edit,
        },
      });
    } catch (error: any) {
      console.error(error.response.data);
    }
  };

  //Show and Hide list option
  const handleList = (e: React.MouseEvent) => {
    const btn = e.currentTarget as HTMLElement;
    if (btn.nextElementSibling?.classList.contains('hidden')) {
      btn.nextElementSibling?.classList.remove('hidden');
      btn.nextElementSibling?.classList.add('block');
    } else if (btn.nextElementSibling?.classList.contains('block')) {
      btn.nextElementSibling?.classList.remove('block');
      btn.nextElementSibling?.classList.add('hidden');
    }
  };

  const handleDeleteList = async (listName: string) => {
    try {
      const deleteResponse = await axios.delete(`http://localhost:3000/lists/${listName}`, {
        withCredentials: true,
      });
      console.log(deleteResponse?.data);
      const getResponse = await axios.get(`http://localhost:3000/lists`, {
        withCredentials: true,
      });
      console.log(getResponse?.data);
      setLists(getResponse?.data);
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
                  <div className='relative'>
                    {l.name !== 'Watchlist' && (
                      <>
                        <MoreVertIcon
                          className={`${l.name} text-gray-350 cursor-pointer`}
                          onClick={(e) => handleList(e)}
                        />
                        <ul className='hidden absolute top-full right-0 bg-gray-400 w-max z-40'>
                          <li
                            className='px-2 py-3 text-white hover:bg-gray-350 cursor-pointer'
                            onClick={() => handleMedia(l)}
                          >
                            View list
                          </li>
                          <li
                            className='px-2 py-3 text-white hover:bg-gray-350 cursor-pointer'
                            onClick={() => handleMedia(l, true)}
                          >
                            Edit
                          </li>
                          <li
                            className='px-2 py-3 text-white hover:bg-gray-350 cursor-pointer'
                            onClick={() => handleDeleteList(l?.name)}
                          >
                            Delete
                          </li>
                        </ul>
                      </>
                    )}
                  </div>
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
