import { useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

type List = {
  listName: string;
  discription: string;
};

type Count = {
  listNameChars: number;
  discriptionChars: number;
};

const CreateList = () => {
  const { user } = useAuth();
  const [count, setCount] = useState<Count>({ listNameChars: 0, discriptionChars: 0 });
  const [list, setList] = useState<List>({ listName: '', discription: '' });
  const [validate, setValidate] = useState<string>('');
  const navigate = useNavigate();

  const handleName = (e: React.ChangeEvent) => {
    const { value } = e.target as HTMLInputElement;
    setList((prev) => ({
      ...prev,
      listName: value,
    }));
    if (value.length <= 255) {
      setCount((prev) => ({
        ...prev,
        listNameChars: value.length,
      }));
    }
  };

  const handleDiscription = (e: React.ChangeEvent) => {
    const { value } = e.target as HTMLInputElement;
    setList((prev) => ({
      ...prev,
      discription: value,
    }));
    if (value.length <= 10000) {
      setCount((prev) => ({
        ...prev,
        discriptionChars: value.length,
      }));
    }
  };

  const handleCreate = async () => {
    if (user) {
      if (list.listName === '') {
        setValidate('Enter a title');
      } else {
        try {
          const response = await axios.post(
            `http://localhost:3000/lists`,
            {
              name: list.listName,
              discription: list.discription,
              movies: [],
            },
            {
              withCredentials: true,
            }
          );
          console.log(response.data);
          navigate('/userLists');
        } catch (error: any) {
          console.error(error.response.data);
        }
      }
    } else navigate('/sign');
  };

  return (
    <div>
      <Navbar />
      <div className='container flex flex-col gap-1 bg-gray-400 pt-8 pb-8'>
        <h1 className='text-white text-4xl font-medium mb-4'>Your Lists</h1>
        <p className='text-gray-250'>List your movie, TV & celebrity picks.</p>
      </div>
      <div className='container flex gap-20 bg-white pt-6'>
        <div className='flex flex-3 flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <input
              type='text'
              value={list.listName}
              onChange={handleName}
              placeholder='Enter the name of your list'
              className='p-2 w-full h-12 border-gray-300 border-2 rounded-lg focus-within:outline-none'
              required
            />
            <p className='text-gray-300 text-sm'>
              <span>{count.listNameChars}</span> of 255 characters
            </p>
            {validate !== '' && <p className='text-sm text-red'>{validate}</p>}
          </div>
          <div className='flex flex-col gap-1'>
            <textarea
              value={list.discription}
              onChange={handleDiscription}
              placeholder='Enter the name of your list'
              className='p-2 w-full h-20 border-gray-300 border-2 rounded-lg focus-within:outline-none'
              required
            />
            <p className='text-gray-300 text-sm'>
              <span>{count.discriptionChars}</span> of 10000 characters
            </p>
          </div>
          <button
            className='text-white px-4 py-2 text-base font-semibold rounded-3xl bg-secondary w-fit'
            onClick={handleCreate}
          >
            Create
          </button>
        </div>

        <div className='flex flex-1 flex-col gap-4'>
          <h1 className='text-3xl font-semibold pl-3 border-l-4 border-primary'>More to explore</h1>
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
  );
};

export default CreateList;
