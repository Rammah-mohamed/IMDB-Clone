import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { useAuth } from '../context/authContext';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Cast, CastState, Crew, List, Media, View } from '../types/media';
import { GET_MOVIE_CAST, GET_MOVIE_CREW, GET_TV_CAST, GET_TV_CREW } from '../graphql/queries';
import axios from 'axios';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ListIcon from '@mui/icons-material/List';
import AppsIcon from '@mui/icons-material/Apps';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import getImageUrl from '../utils/getImages';

// Lazy load the components
const Navbar = React.lazy(() => import('../components/Navbar'));
const SearchMenu = React.lazy(() => import('../components/SearchMenu'));

//Types for each query's return value
interface QueryResult {
  fetch: (variables?: Record<string, any>) => Promise<any>;
  loading: boolean;
  error: any;
  data: any;
}

// Type for the accumulator object (queries)
interface Queries {
  [key: string]: QueryResult;
}

// Type for Custum Droppable Props
interface CustomDroppableProps {
  droppableId?: string;
  children: (provided: any, snapshot: any) => React.ReactNode;
}

// Check type for media item State
type Check = { id: number; data?: Media; isChecked: boolean };

// GraphQL queries
const QUERY_CONFIG = {
  movieCast: GET_MOVIE_CAST,
  movieCrew: GET_MOVIE_CREW,
  tvCast: GET_TV_CAST,
  tvCrew: GET_TV_CREW,
};

const ListDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Values from location state
  const state = location?.state;
  let data = state?.data;
  let title = state?.title;
  let lists: List[] = state?.lists;

  // Initialize state hooks
  const [cast, setCast] = useState<CastState[]>([]);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [orderText, setOrderText] = useState<string>('List Order');
  const [isReverse, setIsReverse] = useState<boolean>(false);
  const [listTitle, setListTitle] = useState<string>(state?.listTitle);
  const [description, setDescription] = useState<string>(state?.description);
  const [listData, setListData] = useState<Media[]>(data);
  const [isEdit, setIsEdit] = useState<boolean>(() => !!state?.edit);
  const [isCopy, setIsCopy] = useState<boolean>(false);
  const [isMove, setIsMove] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckAll, setIsCheckAll] = useState<boolean>(false);

  // Conditional state initialization based on lists and data
  const [checkboxStates, setCheckboxStates] = useState<Check[]>(
    () =>
      listData?.map((d) => ({
        id: d.id,
        data: d,
        isChecked: false,
      })) || []
  );
  const [checkStates, setCheckStates] = useState<List[]>(
    () =>
      lists
        ?.filter((l) => l.name !== listTitle)
        .map((l, index) => ({
          name: l.name,
          movies: l.movies,
          isChecked: index === 0, // Set the first item as checked
        })) || []
  );

  // Set the new values when location state changed
  useEffect(() => {
    data = state?.data;
    title = state?.title;
    lists = state?.lists;
    setListData(data);
    setListTitle(state?.listTitle);
    setDescription(state?.description);
    setIsEdit(!!state?.edit);
  }, [location.state]);

  //Layout view state
  const [view, setView] = useState<View>({
    details: true,
    grid: false,
    compact: false,
  });

  // Custom hook to Handle GraphQl Queries
  const useCastAndCrewQueries = useCallback(() => {
    const queries: Queries = Object.entries(QUERY_CONFIG).reduce((acc, [key, query]) => {
      const [fetch, { loading, error, data }] = useLazyQuery(query);
      acc[key] = {
        fetch: async (variables?: Record<string, any>) => {
          const result = await fetch({ variables });
          return result;
        },
        loading,
        error,
        data,
      };
      return acc;
    }, {} as Queries);

    return queries;
  }, [QUERY_CONFIG]);

  const { movieCast, movieCrew, tvCast, tvCrew } = useCastAndCrewQueries();

  // Handle the layout view of the list
  const handleView = (e: React.MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('detailsView')) {
      setView({ details: true, grid: false, compact: false });
    } else if (target.classList.contains('gridView')) {
      setView({ details: false, grid: true, compact: false });
    } else if (target.classList.contains('compactView'))
      setView({ details: false, grid: false, compact: true });
  };

  // Add and delete to/from the watchlist
  const handleAddTOWatchList = useCallback(async (e: React.MouseEvent, data: Media) => {
    e.stopPropagation();
    try {
      if (user && data.isAdded) {
        const deleteResponse = await axios.delete(
          `http://localhost:3000/lists/Your_Watchlist/${data?.id}`,
          {
            withCredentials: true,
          }
        );
        console.log(deleteResponse.data);
        setListData((prev) => prev?.map((m) => (m.id === data.id ? { ...m, isAdded: false } : m)));
      } else if (user && !data.isAdded) {
        const updateResponse = await axios.put(
          `http://localhost:3000/lists/Your_Watchlist/${data?.id}`,
          { ...data, isAdded: true },
          {
            withCredentials: true,
          }
        );
        console.log(updateResponse.data);

        const getResponse = await axios.get(
          'http://localhost:3000/lists',

          {
            withCredentials: true,
          }
        );
        const watchlist = getResponse?.data?.find((l: List) => l.name === 'Your Watchlist');
        setListData((prev) =>
          prev?.map((m) =>
            watchlist?.movies?.some((d: Media) => d.isAdded && d.id === m.id)
              ? { ...m, isAdded: true }
              : m
          )
        );
      }
    } catch (error: any) {
      console.error(error.response.data);
    }
    if (!user) {
      navigate('/sign');
    }
  }, []);

  // Fetch user movie if authorized
  useEffect(() => {
    const getUserMovies = async () => {
      try {
        const response = await axios.get('http://localhost:3000/lists/Your_Watchlist', {
          withCredentials: true,
        });
        setListData(response?.data?.movies);
        setCheckboxStates(() => {
          let checkbox: Check[] = [];
          response?.data?.movies?.forEach((d: Media) =>
            checkbox.push({ id: d.id, isChecked: false })
          );
          return checkbox;
        });
      } catch (error: any) {
        if (error.response) {
          console.error('Server Error:', error.response.data);
        } else {
          console.error('Error:', error.message);
        }
      }
    };
    if (!data && user) {
      getUserMovies();
    }
  }, []);

  // Sync added madia state between current media and user media
  useEffect(() => {
    const getWatchlistMovies = async () => {
      try {
        const response = await axios.get('http://localhost:3000/lists/Watchlist', {
          withCredentials: true,
        });

        setListData((prev) =>
          prev?.map((m) =>
            response?.data?.movies?.some((d: Media) => d.isAdded && Number(d.id) === m.id)
              ? { ...m, isAdded: true }
              : m
          )
        );
      } catch (error: any) {
        if (error.response) {
          console.error('Server Error:', error.response.data);
        } else {
          console.error('Error:', error.message);
        }
      }
    };
    user && getWatchlistMovies();
  }, [user]);

  // Fetch the cast and crew data
  const handleMedia = useCallback((ids: number[], mediaType: string): void => {
    let fetchMedia: Promise<CastState>[] = [];
    if (mediaType === 'Movie') {
      fetchMedia = ids.map((id) =>
        Promise.all([movieCast.fetch({ id }), movieCrew.fetch({ id })]).then(
          ([castData, crewData]) => ({
            id: id,
            type: 'Movie',
            star: castData?.data?.moviesCast,
            crew: crewData?.data?.moviesCrew?.slice(0, 20),
          })
        )
      );
    } else if (mediaType === 'TV') {
      fetchMedia = ids.map((id) =>
        Promise.all([tvCast.fetch({ id }), tvCrew.fetch({ id })]).then(([castData, crewData]) => ({
          id: id,
          type: 'TV',
          star: castData?.data?.tvCast,
          crew: crewData?.data?.tvCrew?.slice(0, 20),
        }))
      );
    }

    // When get all the promises and they fulfiled set the cast data
    if (fetchMedia.length !== 0) {
      Promise.all(fetchMedia)
        .then((media) => {
          setCast((prev) => [...prev, ...media]);
        })
        .catch((error) => {
          console.error('Error fetching movie data:', error);
        });
    }
  }, []);

  useEffect(() => {
    if (listData) {
      const IDs = listData?.map((item) => item.id);
      const mediaType = listData[0]?.__typename;
      handleMedia(IDs, mediaType);
    }
  }, [listData]);

  // Sort cast based on the order in listData
  const orderMap = new Map(listData?.map((item, index) => [item.id, index]));
  const sortedCast: CastState[] = cast?.sort((a, b) => {
    const orderA = orderMap?.get(a.id) ?? 0;
    const orderB = orderMap?.get(b.id) ?? 0;
    return orderA - orderB;
  });

  // Handle Sorting for media list
  const getSortFunction = (orderType: string) => {
    return (a: Media, b: Media) => {
      switch (orderType) {
        case 'Alphabetical':
          if (a.__typename === 'Movie' && b.__typename === 'Movie') {
            if (!a.title && !b.title) return 0;
            if (!a.title) return 1;
            if (!b.title) return -1;
            return a.title.localeCompare(b.title);
          } else if (a.__typename === 'TV' && b.__typename === 'TV') {
            if (!a.name && !b.name) return 0;
            if (!a.name) return 1;
            if (!b.name) return -1;
            return a.name.localeCompare(b.name);
          } else if (a.__typename === 'Movie') {
            return -1; // Movies come before TV shows
          } else {
            return 1; // TV shows come after movies
          }

        case 'Release Date':
          if (a.__typename === 'Movie' && b.__typename === 'Movie') {
            if (!a.release_date && !b.release_date) return 0;
            if (!a.release_date) return 1;
            if (!b.release_date) return -1;
            return a.release_date.localeCompare(b.release_date);
          } else if (a.__typename === 'TV' && b.__typename === 'TV') {
            if (!a.first_air_date && !b.first_air_date) return 0;
            if (!a.first_air_date) return 1;
            if (!b.first_air_date) return -1;
            return a.first_air_date.localeCompare(b.first_air_date);
          } else if (a.__typename === 'Movie') {
            return -1; // Movies come before TV shows
          } else {
            return 1; // TV shows come after movies
          }

        case 'IMDB Rating':
          return (Number(b.vote_average) ?? 0) - (Number(a.vote_average) ?? 0);

        case 'number Of Ratings':
          return (Number(b.vote_count) ?? 0) - (Number(a.vote_count) ?? 0);

        case 'Popularity':
          return (b.popularity ?? 0) - (a.popularity ?? 0);

        default:
          return 0; // No sorting if no match
      }
    };
  };

  const orderdList: Media[] = useMemo(() => {
    if (!listData) return [];

    const sortFunction = getSortFunction(orderText);
    return [...listData].sort(sortFunction);
  }, [orderText, listData]);

  // Function to get the name of the Director from the crew
  const getDirectorName = (crew: Crew): string | undefined =>
    crew?.job === 'Director' ? crew.name : undefined;

  // Check if a Director exists in the crew array at a given index
  const hasDirector = (castState: CastState[], index: number): boolean =>
    castState[index]?.crew?.some((c: Crew) => c.job === 'Director') ?? false;

  // Navigate to media details page
  const handleDetails = (media: Media): void => {
    navigate('/mediaDetail', { state: media });
  };

  // Navigate to Create list page if the user authorized
  const handleCreate = () => {
    if (user) {
      navigate('/createList');
    } else navigate('/sign');
  };

  // Handle list title and description naming
  const handleListName = async (e: ChangeEvent<HTMLInputElement>, type: string) => {
    if (!user) {
      console.error('User is not authenticated');
      return;
    }

    // Helper function to handle the UPDATE request for user list title and description in the database
    const updateList = async (key: string, value: string) => {
      return axios.put(
        `http://localhost:3000/lists/${listTitle}`,
        { [key]: value },
        { withCredentials: true }
      );
    };

    try {
      const { value } = e.target;
      let response;

      switch (type) {
        case 'title':
          setListTitle(value);
          response = await updateList('name', value);
          break;

        case 'description':
          setDescription(value);
          response = await updateList('description', value);
          break;

        default:
          console.error(`Unknown type: ${type}`);
          return;
      }

      console.log(response?.data);
    } catch (error: any) {
      console.error(error.response?.data || 'An error occurred');
    }
  };

  // Handle media checking in edit mode
  const handleCheckboxChange = (id: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxStates((prevState) =>
      prevState?.map((item) =>
        item.id === id ? { ...item, isChecked: event.target.checked } : item
      )
    );
  };

  // Toggle all media list check state
  const toggleSelectAll = () => {
    setIsCheckAll((prev) => !prev);
    setCheckboxStates((prevState) => prevState?.map((i) => ({ ...i, isChecked: !isCheckAll })));
  };

  const handleDelete = async (listName: string) => {
    // Helper function to handle the DELETE request
    const deleteRequest = async (url: string) => {
      try {
        const response = await axios.delete(url, { withCredentials: true });
        console.log(response.data);
      } catch (error: any) {
        console.error('Error deleting:', error.response?.data || error.message);
      }
    };

    if (isCheckAll) {
      setListData([]);
      const url = `http://localhost:3000/lists/${listName || 'Your_Watchlist'}/movies/all`;
      await deleteRequest(url);
    } else {
      const id = checkboxStates.find((b) => b.isChecked)?.id;
      if (!id) return;

      const newList = listData.filter((d) => d.id !== id);
      setListData(newList);
      const url = `http://localhost:3000/lists/${listName || 'Your_Watchlist'}/${id}`;
      await deleteRequest(url);
    }
  };

  // set copy/move state to false to close the copy/move popups
  const handleCancel = () => {
    setIsCopy(false);
    setIsMove(false);
  };

  // Update movies in user list
  const updateListMovies = async (listName: string, newMovies: any[]) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/lists/${listName}`,
        { movies: newMovies },
        { withCredentials: true }
      );
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      if (error.response?.data === 'Duplicate movie IDs are not allowed in the list.') {
        setError(`You already have this title in the ${listName}`);
        setTimeout(() => setError(null), 5000);
      }
      throw error;
    }
  };

  // Copy/Move from/to a list
  const handleCopyMove = async () => {
    const list = checkStates.find((l) => l.isChecked);
    if (!list) return;

    const selectedMovies = isCheckAll
      ? [...(list.movies || []), ...listData]
      : [...(list.movies || []), ...checkboxStates.filter((m) => m.isChecked).map((m) => m.data)];

    try {
      await updateListMovies(list.name, selectedMovies);
      if (isMove) handleDelete(listTitle);
      handleCancel();
    } catch (error: any) {
      console.error(error.message);
    }
  };

  // handle check state to a media
  const handleCheckLists = (list: List) => {
    const checkList = checkStates.map((l) =>
      l.name === list.name ? { ...l, isChecked: true } : { ...l, isChecked: false }
    );
    setCheckStates(checkList);
  };

  // Reorder user media list in the database
  const reOrederList = async (media: Media[], listName: string) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/lists/${
          listName === 'Your Watchlist' ? 'Your_Watchlist' : listName
        }`,
        {
          movies: media,
        },
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
    } catch (error: any) {
      console.error('Failed to reorder list:', error.response?.data || error);
    }
  };

  // Reorder media list layout (UI)
  const reorder = (list: Media[], startIndex: number, endIndex: number) => {
    const result = Array.from(list); //
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Handle reorder by Drag and Drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // If dropped outside the list or if the position hasn't changed, do nothing
    if (!destination || source.index === destination.index) return;

    // Reorder items in the local list
    const reorderedItems = reorder(orderdList, source.index, destination.index);

    // Update the UI state with the reordered items
    setListData(reorderedItems);

    // update the database with the reordered list
    reOrederList(reorderedItems, listTitle);
  };

  // Custum Dropable for drop and drag
  const CustomDroppable: React.FC<CustomDroppableProps> = React.memo(
    ({ droppableId = 'default-droppable', children }) => {
      return (
        <Droppable droppableId={droppableId}>
          {(provided, snapshot) => <>{children(provided, snapshot)}</>}
        </Droppable>
      );
    }
  );

  // Query loading handling
  const isAnyLoading = Object.values({
    movieCast: movieCast.loading,
    movieCrew: movieCrew.loading,
    tvCast: tvCast.loading,
    tvCrew: tvCrew.loading,
  }).some(Boolean);

  // Query error handling
  const anyErrors = Object.values({
    movieCast: movieCast.error,
    movieCrew: movieCrew.error,
    tvCast: tvCast.error,
    tvCrew: tvCrew.error,
  }).filter(Boolean);

  if (isAnyLoading) {
    return (
      <div className='relative flex items-center justify-center w-full min-h-screen'>
        <div className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'></div>
      </div>
    );
  }

  if (anyErrors.length > 0) {
    return (
      <ul className='flex flex-col'>
        {anyErrors.map((e, index) => (
          <li key={index} className='text-white text-sm'>
            {e}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className='relative w-full min-h-screen'>
      <Navbar />
      {(isCopy || isMove) && (
        <div className='fixed top-0 left-0 w-screen h-screen bg-black-transparent flex items-center justify-center z-50'>
          {error && (
            <p
              className='absolute bottom-16 left-1/2 p-4 text-xl text-white bg-red'
              style={{ transform: 'translateX(-50%)' }}
            >
              {error}
            </p>
          )}
          <div
            className='absolute top-1/2 left-1/2 flex flex-col gap-10 p-6 bg-gray-400 w-1/3 min-h-40 rounded-lg'
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <span
              className='absolute right-3 text-2xl text-white cursor-pointer'
              style={{ top: '-40px' }}
              onClick={handleCancel}
            >
              X
            </span>
            <div className='flex flex-col gap-2'>
              <span className='text-white text-2xl font-semibold'>
                {isCopy ? 'Copy' : 'Move'} to another list
              </span>
              <span className='text-gray-250'>Your lists</span>
            </div>
            <div className='flex flex-col gap-4'>
              {checkStates?.map((l, index: number) => (
                <div key={index} className='flex items-center gap-3 cursor-pointer'>
                  <label className='relative flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      className='peer hidden'
                      checked={checkStates[index].isChecked}
                      onChange={() => handleCheckLists(l)}
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        checkStates[index].isChecked
                          ? 'border-gray-250 bg-secondary'
                          : 'border-gray-250'
                      } transition-colors`}
                    ></div>
                  </label>
                  <span className='text-gray-100 text-lg'>{l?.name}</span>
                </div>
              ))}
            </div>
            <div className='flex items-center justify-between gap-3'>
              <button
                className='group relative flex-1 p-2 rounded-3xl bg-gray-350 text-secondary cursor-pointer'
                onClick={handleCancel}
              >
                Cancel
                <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              </button>
              <button
                className='group relative flex-1 p-2 rounded-3xl bg-secondary text-white cursor-pointer'
                onClick={handleCopyMove}
              >
                <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className='container flex items-center justify-between gap-4 bg-gray-400 py-12'>
        <div className='flex flex-4 flex-col gap-3'>
          {listTitle ? (
            <input
              type='text'
              value={listTitle}
              className='text-white text-5xl p-2 font-medium bg-gray-400 focus-within:outline-none border-2 border-gray-400 hover:border-primary transition duration-500 ease-in'
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleListName(e, 'title')}
            />
          ) : (
            <h1 className='text-white text-5xl font-medium'>{title || 'Your Watchlist'}</h1>
          )}
          {listTitle ? (
            <input
              type='text'
              value={description}
              placeholder='Enter a description for your list'
              className='text-gray-200 placeholder:text-gray-200  p-2 bg-gray-400 focus-within:outline-none border-2 hover:border-primary border-gray-400 order-primary transition duration-500 ease-in'
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleListName(e, 'description')}
            />
          ) : (
            <p className='text-gray-200'>
              Your Watchlist is the place to track the titles you want to watch. You can sort your
              Watchlist by the IMDb rating, popularity score and arrange your titles in the order
              you want to see them.
            </p>
          )}
        </div>
        <div className='flex flex-1 flex-col gap-4'>
          {checkStates?.length !== 0 && (
            <div className='cursor-pointer' onClick={() => setIsEdit((prev) => !prev)}>
              <EditIcon style={{ fontSize: '1.5rem' }} className='text-white hover:text-gray-250' />
              <span className='text-white text-lg ml-2 hover:underline'>Edit</span>
            </div>
          )}
          <div className='relative group flex items-center gap-1 bg-primary p-3 font-medium rounded-3xl cursor-pointer'>
            <div className='items-end gap-3 absolute top-0 left-0 w-full h-full p-4 bg-overlay z-20 hidden group-hover:flex'></div>
            <AddIcon />
            <span className='relative z-30' onClick={handleCreate}>
              Create a new list
            </span>
          </div>
        </div>
      </div>

      <div className='container bg-white pt-6'>
        <div className='flex gap-20'>
          <div className='flex flex-3 flex-col gap-10'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-6'>
                <span className='flex-1 text-black-100'>
                  {listData?.length >= 100 ? listData?.length.toString().slice() : listData?.length}{' '}
                  titles
                </span>
                {isEdit && (
                  <>
                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        checked={isCheckAll}
                        onChange={() => toggleSelectAll()}
                      />
                      <div className='flex flex-col'>
                        <span>Select all</span>
                        <span className='text-gray-300 text-sm'>{} selected</span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 p-2 rounded-2xl ${
                        checkboxStates.some((m) => m.isChecked)
                          ? 'bg-white hover:bg-secondary-100'
                          : 'bg-gray-200'
                      } ${
                        checkboxStates.some((m) => m.isChecked) ? 'text-secondary' : 'text-gray-350'
                      } text-sm font-semibold cursor-pointer`}
                      onClick={() => checkboxStates.some((m) => m.isChecked) && setIsCopy(true)}
                    >
                      <ContentCopyIcon style={{ fontSize: '1.4rem' }} />
                      <span>Copy</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 p-2 rounded-2xl ${
                        checkboxStates.some((m) => m.isChecked)
                          ? 'bg-white hover:bg-secondary-100'
                          : 'bg-gray-200'
                      } ${
                        checkboxStates.some((m) => m.isChecked) ? 'text-secondary' : 'text-gray-350'
                      } text-sm font-semibold cursor-pointer`}
                      onClick={() => checkboxStates.some((m) => m.isChecked) && setIsMove(true)}
                    >
                      <DriveFileMoveIcon style={{ fontSize: '1.4rem' }} />
                      <span>Move</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 p-2 rounded-2xl ${
                        checkboxStates.some((m) => m.isChecked)
                          ? 'bg-white hover:bg-secondary-100'
                          : 'bg-gray-200'
                      } ${
                        checkboxStates.some((m) => m.isChecked) ? 'text-secondary' : 'text-gray-350'
                      } text-sm font-semibold cursor-pointer`}
                      onClick={() => handleDelete(listTitle)}
                    >
                      <DeleteIcon style={{ fontSize: '1.4rem' }} />
                      <span>Delete</span>
                    </div>
                  </>
                )}
              </div>
              <div className='flex flex-1 items-center justify-end gap-2'>
                <div className='flex items-center gap-2'>
                  <span>Sort By</span>
                  <div
                    className='relative flex items-center w-fit text-secondary p-2 rounded-md cursor-pointer hover:bg-secondary-100'
                    onClick={(): void => setShowSearch((prev) => !prev)}
                  >
                    <span>{orderText}</span>
                    {showSearch ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    <SearchMenu
                      showSearch={showSearch}
                      setShowSearch={setShowSearch}
                      setOrderText={setOrderText}
                      menuFor='List'
                    />
                  </div>
                </div>
                {isReverse ? (
                  <ArrowDownwardIcon
                    style={{ fontSize: '2.5rem' }}
                    className='text-secondary p-2 rounded-full cursor-pointer hover:bg-secondary-100'
                    onClick={() => setIsReverse((prev) => !prev)}
                  />
                ) : (
                  <ArrowUpwardIcon
                    style={{ fontSize: '2.5rem' }}
                    className='text-secondary p-2 rounded-full cursor-pointer hover:bg-secondary-100'
                    onClick={() => setIsReverse((prev) => !prev)}
                  />
                )}

                {!isEdit && (
                  <>
                    <ListIcon
                      style={{ fontSize: '2.5rem' }}
                      className={`detailsView ${
                        view.details && 'text-secondary'
                      } p-2 rounded-full cursor-pointer hover:bg-secondary-100`}
                      onClick={(e) => handleView(e)}
                    />
                    <AppsIcon
                      style={{ fontSize: '2.5rem' }}
                      className={`gridView ${
                        view.grid && 'text-secondary'
                      } p-2 rounded-full cursor-pointer hover:bg-secondary-100`}
                      onClick={(e) => handleView(e)}
                    />
                    <MenuIcon
                      style={{ fontSize: '2.5rem' }}
                      className={`compactView ${
                        view.compact && 'text-secondary'
                      } p-2 rounded-full cursor-pointer hover:bg-secondary-100`}
                      onClick={(e) => handleView(e)}
                    />
                  </>
                )}
              </div>
            </div>
            {listTitle ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <CustomDroppable droppableId='my-unique-droppable'>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex ${
                        view.grid ? 'flex-row flex-wrap items-center justify-center' : 'flex-col'
                      } gap-6 p-3 border-2 border-gray-250 rounded-sm`}
                    >
                      {(isReverse ? [...orderdList]?.reverse() : orderdList)?.map(
                        (el: Media, index: number) => (
                          <Draggable key={index} draggableId={el.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className='flex items-center gap-5'
                                style={{ ...provided.draggableProps.style }}
                              >
                                <div {...provided.dragHandleProps}>
                                  <DragHandleIcon
                                    className='text-gray-400 cursor-grab'
                                    style={{ fontSize: '1.8rem' }}
                                  />
                                </div>
                                {isEdit && (
                                  <input
                                    type='checkbox'
                                    name='checkBox'
                                    id={index.toString()}
                                    checked={checkboxStates[index]?.isChecked}
                                    onChange={handleCheckboxChange(el.id)}
                                  />
                                )}
                                <div className='flex flex-1 flex-col gap-2'>
                                  <div
                                    className={`flex items-center ${
                                      !view.grid
                                        ? 'justify-between'
                                        : 'border-2 border-gray-100 shadow-md'
                                    }`}
                                  >
                                    <div
                                      className={`flex flex-1 ${
                                        view.grid ? 'flex-col' : 'flex-row items-center'
                                      } gap-3`}
                                      style={{ height: view.grid ? '28rem' : '' }}
                                    >
                                      <div
                                        className={`group relative ${
                                          view.grid ? 'w-48 h-72' : 'w-24 h-32'
                                        } overflow-hidden rounded-xl cursor-pointer`}
                                        onClick={(): void => handleDetails(el)}
                                      >
                                        <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                                        <AddIcon
                                          className={`absolute top-0 left-0 ${
                                            user && el?.isAdded
                                              ? 'bg-primary text-black-100'
                                              : 'bg-black-transparent text-white'
                                          } z-30`}
                                          style={{ fontSize: view.grid ? '2.3rem' : '1.6rem' }}
                                          onClick={(e) => handleAddTOWatchList(e, el)}
                                        />
                                        <LazyLoadImage
                                          src={getImageUrl(el?.poster_path, 'w154')}
                                          alt='poster'
                                          className='object-cover w-full h-full'
                                        />
                                      </div>
                                      <div
                                        className={`flex flex-2 flex-col gap-2 p-2 w-full text-sm`}
                                      >
                                        <h1
                                          className='flex-2 font-bold cursor-pointer hover:underline'
                                          onClick={(): void => handleDetails(el)}
                                        >
                                          {index + 1 + '- ' + (el?.title ?? el?.name)}
                                        </h1>
                                        <div className='flex-1 text-black-100'>
                                          <span>{el?.release_date}</span>
                                        </div>
                                        <div className='flex text-black-100'>
                                          <StarIcon className='text-primary' />
                                          <p className='flex-1'>
                                            {Number(el?.vote_average ?? 0).toFixed(2)}
                                            <span className='flex-1 pl-2 text-gray font-semibold'>
                                              {el?.vote_count?.toString().length > 3
                                                ? '(' + el?.vote_count.toString().slice(0, 1) + 'K)'
                                                : '(' + el?.vote_count + ')'}
                                            </span>
                                          </p>
                                        </div>
                                        {view.grid && (
                                          <button className='bg-secondary-100 text-secondary font-medium w-full p-2 rounded-xl cursor-pointer'>
                                            Details
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <ErrorOutlineIcon
                                      className='text-secondary'
                                      style={{ display: view.grid ? 'none' : 'block ' }}
                                    />
                                  </div>
                                  {!isEdit && (
                                    <p
                                      className={`${
                                        view.details ? 'block' : 'hidden'
                                      } font-semibold`}
                                    >
                                      {el?.overview}
                                    </p>
                                  )}

                                  <div
                                    className={`${
                                      view.details ? 'flex' : 'hidden'
                                    } items-center gap-5 text-base font-medium`}
                                  >
                                    {sortedCast[index]?.crew?.length !== 0 &&
                                      !isEdit &&
                                      hasDirector(sortedCast, index) && (
                                        <div key={index} className='flex gap-3'>
                                          <span>Director</span>
                                          <span className='text-secondary'>
                                            {sortedCast[index]?.crew
                                              ?.filter((c: Crew) => c.job === 'Director')
                                              .map((c: Crew, i: number) => (
                                                <span key={i}>{c.name}</span>
                                              ))}
                                          </span>
                                        </div>
                                      )}

                                    <div className='flex gap-3'>
                                      {sortedCast[index]?.star?.length !== 0 && !isEdit && (
                                        <>
                                          <span>Stars</span>
                                          <div className='flex gap-2 text-secondary'>
                                            {sortedCast[index]?.star?.map(
                                              (s: Cast, index: number) =>
                                                index < 3 && <span key={index}>{s.name}</span>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </CustomDroppable>
              </DragDropContext>
            ) : (
              <div
                className={`flex ${
                  view.grid ? 'flex-row flex-wrap items-center justify-center' : 'flex-col'
                } gap-6 p-3 border-2 border-gray-250 rounded-sm`}
              >
                {(isReverse ? [...orderdList]?.reverse() : orderdList)?.map(
                  (el: Media, index: number) => (
                    <div key={index} className='flex items-center gap-5'>
                      {isEdit && (
                        <input
                          type='checkbox'
                          name='checkBox'
                          id={index.toString()}
                          checked={checkboxStates[index]?.isChecked}
                          onChange={handleCheckboxChange(el.id)}
                        />
                      )}
                      <div className='flex flex-1 flex-col gap-2'>
                        <div
                          className={`flex items-center ${
                            !view.grid ? 'justify-between' : 'border-2 border-gray-100 shadow-md'
                          }`}
                        >
                          <div
                            className={`flex flex-1 ${
                              view.grid ? 'flex-col' : 'flex-row items-center'
                            } gap-3`}
                            style={{ height: view.grid ? '28rem' : '' }}
                          >
                            <div
                              className={`group relative ${
                                view.grid ? 'w-48 h-72' : 'w-24 h-32'
                              } overflow-hidden rounded-xl cursor-pointer`}
                              onClick={(): void => handleDetails(el)}
                            >
                              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                              <AddIcon
                                className={`absolute top-0 left-0 ${
                                  user && el?.isAdded
                                    ? 'bg-primary text-black-100'
                                    : 'bg-black-transparent text-white'
                                } z-30`}
                                style={{ fontSize: view.grid ? '2.3rem' : '1.6rem' }}
                                onClick={(e) => handleAddTOWatchList(e, el)}
                              />
                              <LazyLoadImage
                                src={getImageUrl(el?.poster_path, 'w154')}
                                alt='poster'
                                className='object-cover w-full h-full'
                              />
                            </div>
                            <div className={`flex flex-2 flex-col gap-2 p-2 w-full text-sm`}>
                              <h1
                                className='flex-2 font-bold cursor-pointer hover:underline'
                                onClick={(): void => handleDetails(el)}
                              >
                                {index + 1 + '- ' + (el?.title ?? el?.name)}
                              </h1>
                              <div className='flex-1 text-black-100'>
                                <span>{el?.release_date}</span>
                              </div>
                              <div className='flex text-black-100'>
                                <StarIcon className='text-primary' />
                                <p className='flex-1'>
                                  {Number(el?.vote_average ?? 0).toFixed(2)}
                                  <span className='flex-1 pl-2 text-gray font-semibold'>
                                    {el?.vote_count?.toString().length > 3
                                      ? '(' + el?.vote_count.toString().slice(0, 1) + 'K)'
                                      : '(' + el?.vote_count + ')'}
                                  </span>
                                </p>
                              </div>
                              {view.grid && (
                                <button className='bg-secondary-100 text-secondary font-medium w-full p-2 rounded-xl cursor-pointer'>
                                  Details
                                </button>
                              )}
                            </div>
                          </div>
                          <ErrorOutlineIcon
                            className='text-secondary'
                            style={{ display: view.grid ? 'none' : 'block ' }}
                          />
                        </div>
                        {!isEdit && (
                          <p className={`${view.details ? 'block' : 'hidden'} font-semibold`}>
                            {el?.overview}
                          </p>
                        )}

                        <div
                          className={`${
                            view.details ? 'flex' : 'hidden'
                          } items-center gap-5 text-base font-medium`}
                        >
                          {sortedCast[index]?.crew?.length !== 0 &&
                            !isEdit &&
                            hasDirector(sortedCast, index) && (
                              <div key={index} className='flex gap-3'>
                                <span>Director</span>
                                <span className='text-secondary'>
                                  {sortedCast[index]?.crew?.map((c: Crew) => getDirectorName(c))}
                                </span>
                              </div>
                            )}

                          <div className='flex gap-3'>
                            {sortedCast[index]?.star?.length !== 0 && !isEdit && (
                              <>
                                <span>Stars</span>
                                <div className='flex gap-2 text-secondary'>
                                  {sortedCast[index]?.star?.map(
                                    (s: Cast, index: number) =>
                                      index < 3 && <span key={index}>{s.name}</span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

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
    </div>
  );
};

export default ListDetails;
