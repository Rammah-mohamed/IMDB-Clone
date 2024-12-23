import { useLazyQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Navbar from '../components/Navbar';
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
import { GET_MOVIE_CAST, GET_MOVIE_CREW, GET_TV_CAST, GET_TV_CREW } from '../graphql/queries';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import SearchMenu from '../components/SearchMenu';
import { Cast, CastState, Crew, List, Media, View } from '../types/media';
import axios from 'axios';
import { useAuth } from '../context/authContext';

type Check = { id: number; data?: Media; isChecked: boolean };
type Lists = { name: string; movies?: Media[]; isChecked: boolean };

const ListDetails = () => {
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [orderText, setOrderText] = useState<string>('List Order');
  const [isReverse, setIsReverse] = useState<boolean>(false);
  const [cast, setCast] = useState<CastState[]>([]);
  const [view, setView] = useState<View>({
    details: true,
    grid: false,
    compact: false,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const data = location?.state?.data;
  const title = location?.state?.title;
  const lists: List[] = location?.state?.lists;
  const [listTitle, setListTitle] = useState<string>(() => {
    return location?.state?.listTitle;
  });
  const [description, setdescription] = useState<string>(() => {
    return location?.state?.description;
  });
  const [listData, setListData] = useState<Media[]>(() => {
    if (data) {
      return data;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(() => {
    if (location.state.edit) {
      return true;
    } else return false;
  });
  const [isCopy, setIsCopy] = useState<boolean>(false);
  const [isMove, setIsMove] = useState<boolean>(false);
  const [isCheckAll, setIsCheckAll] = useState<boolean>(false);
  const [checkboxStates, setCheckboxStates] = useState<Check[]>(() => {
    let checkboxs: Check[] = [];
    listData?.forEach((d) => checkboxs.push({ id: d.id, data: d, isChecked: false }));
    return checkboxs;
  });
  const [checkStates, setCheckStates] = useState<Lists[]>(() => {
    let checkboxs: Lists[] = [];
    lists?.forEach(
      (l) =>
        l.name !== listTitle && checkboxs.push({ name: l.name, movies: l.movies, isChecked: false })
    );
    return checkboxs.map((l, index: number) => (index === 0 ? { ...l, isChecked: true } : l));
  });
  const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';
  let mediaCount: number = 0;
  const [getMovieCast, { loading: movieCastLoading, error: movieCastError }] =
    useLazyQuery(GET_MOVIE_CAST);
  const [getMovieCrew, { loading: movieCrewLoading, error: movieCrewError }] =
    useLazyQuery(GET_MOVIE_CREW);
  const [getTvCast, { loading: tvCastLoading, error: tvCastError }] = useLazyQuery(GET_TV_CAST);
  const [getTvCrew, { loading: tvCrewLoading, error: tvCrewError }] = useLazyQuery(GET_TV_CREW);

  const handleView = (e: React.MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('detailsView')) {
      setView({ details: true, grid: false, compact: false });
    } else if (target.classList.contains('gridView')) {
      setView({ details: false, grid: true, compact: false });
    } else if (target.classList.contains('compactView'))
      setView({ details: false, grid: false, compact: true });
  };

  const handleMedia = (ids: number[], mediaType: string): void => {
    let fetchMedia: Promise<CastState>[] = [];
    if (mediaType === 'Movie') {
      fetchMedia = ids.map((id) =>
        Promise.all([
          getMovieCast({ variables: { id } }),
          getMovieCrew({ variables: { id } }),
        ]).then(([castData, crewData]) => ({
          id: id,
          type: 'Movie',
          star: castData?.data?.moviesCast,
          crew: crewData?.data?.moviesCrew?.slice(0, 20),
        }))
      );
    } else if (mediaType === 'TV') {
      fetchMedia = ids.map((id) =>
        Promise.all([getTvCast({ variables: { id } }), getTvCrew({ variables: { id } })]).then(
          ([castData, crewData]) => ({
            id: id,
            type: 'TV',
            star: castData?.data?.tvCast,
            crew: crewData?.data?.tvCrew?.slice(0, 20),
          })
        )
      );
    }

    fetchMedia.length !== 0 &&
      Promise.all(fetchMedia)
        .then((media) => {
          setCast((prev) => [...prev, ...media]);
        })
        .catch((error) => {
          console.error('Error fetching movie data:', error);
        });
  };

  //Add and delete to the watchlist
  const handleAddTOWatchList = async (e: React.MouseEvent, data: Media) => {
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
  };

  useEffect(() => {
    const getUserMovies = async () => {
      try {
        const response = await axios.get('http://localhost:3000/lists/Your_Watchlist', {
          withCredentials: true,
        });
        console.log(response.data);
        setListData(response?.data?.movies);
        setCheckboxStates(() => {
          let checkboxs: Check[] = [];
          response?.data?.movies?.forEach((d: Media) =>
            checkboxs.push({ id: d.id, isChecked: false })
          );
          return checkboxs;
        });
      } catch (error: any) {
        if (error.response) {
          console.error('Server Error:', error.response.data);
        } else {
          console.error('Error:', error.message);
        }
      }
    };
    if (!data) {
      getUserMovies();
    }
  }, []);

  //Sync the media to the watchlist state
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
    getWatchlistMovies();
  }, []);

  useEffect(() => {
    if (listData && mediaCount === 0) {
      const IDs = listData?.map((item) => item.id);
      const mediaType = listData[0]?.__typename;
      handleMedia(IDs, mediaType);
      mediaCount++;
    }
  }, [listData]);

  // Create a mapping of the order index for listData
  const orderMap = new Map(listData?.map((item, index) => [item.id, index]));

  // Sort cast based on the order in listData
  const sortedCast: CastState[] = cast?.sort((a, b) => {
    const orderA = orderMap?.get(a.id) ?? 0;
    const orderB = orderMap?.get(b.id) ?? 0;
    return orderA - orderB;
  });

  const orderdList: Media[] = useMemo(() => {
    const alphabeticSort =
      listData &&
      [...listData]?.sort((a, b) => {
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
      });

    const dateSort =
      listData &&
      [...listData]?.sort((a, b) => {
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
      });

    const ratingSort =
      listData &&
      [...listData]?.sort((a, b) => {
        if (!a.vote_average && !b.vote_average) return 0;
        if (!a.vote_average) return 1;
        if (!b.vote_average) return -1;
        return a.vote_average.toString().localeCompare(b.vote_average.toString());
      });

    const ratingnumberSort =
      listData &&
      [...listData]?.sort((a, b) => {
        if (!a.vote_count && !b.vote_count) return 0;
        if (!a.vote_count) return 1;
        if (!b.vote_count) return -1;
        return a.vote_count.toString().localeCompare(b.vote_count.toString());
      });

    const popularitySort =
      listData &&
      [...listData]?.sort((a, b) => {
        if (!a.popularity && !b.popularity) return 0;
        if (!a.popularity) return 1;
        if (!b.popularity) return -1;
        return a.popularity.toString().localeCompare(b.popularity.toString());
      });

    switch (orderText) {
      case 'Alphabetical':
        return alphabeticSort;
      case 'IMDB Rating':
        return ratingSort;
      case 'number Of Ratings':
        return ratingnumberSort;
      case 'Popularity':
        return popularitySort;
      case 'Release Date':
        return dateSort;
      default:
        return listData || [];
    }
  }, [orderText, listData]);

  const handleDirector = (crew: Crew): string | undefined => {
    if (crew?.job === 'Director') {
      return crew?.name;
    }
  };
  // Check if there is a Director exist on the Crew array
  const isDirector = (crew: Crew[] | null): boolean => {
    if (crew) {
      const result = crew?.filter((c: Crew) => c.job === 'Director');
      if (result.length !== 0) {
        return true;
      } else return false;
    } else return false;
  };
  const handleDetails = (media: Media): void => {
    navigate('/mediaDetail', { state: media });
  };

  const handleCreate = () => {
    if (user) {
      navigate('/createList');
    } else navigate('/sign');
  };

  const handleList = async (e: ChangeEvent<HTMLInputElement>, type: string) => {
    try {
      if (user) {
        let response;
        if (type === 'title') {
          setListTitle(e.target?.value);
          response = await axios.put(
            `http://localhost:3000/lists/${listTitle}`,
            {
              name: e.target?.value,
            },
            {
              withCredentials: true,
            }
          );
        } else if (type === 'description') {
          setdescription(e.target?.value);
          response = await axios.put(
            `http://localhost:3000/lists/${listTitle}`,
            {
              description: e.target?.value,
            },
            {
              withCredentials: true,
            }
          );
        }
        console.log(response?.data);
      }
    } catch (error: any) {
      console.error(error.response.data);
    }
  };

  const handleCheckboxChange = (id: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxStates((prevState) =>
      prevState?.map((item) =>
        item.id === id ? { ...item, isChecked: event.target.checked } : item
      )
    );
  };

  const toggleSelectAll = () => {
    setIsCheckAll((prev) => !prev);
    console.log(checkboxStates);
    setCheckboxStates((prevState) => prevState?.map((i) => ({ ...i, isChecked: !isCheckAll })));
  };

  const handleDelete = async (listName: string) => {
    if (isCheckAll) {
      setListData([]);
      try {
        const response = await axios.delete(
          `http://localhost:3000/lists/${listName || 'Your_Watchlist'}/movies/all`,
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
      } catch (error: any) {
        console.error(error.response.data);
      }
    } else {
      const id = checkboxStates.find((b) => b.isChecked)?.id;
      const newList = listData.filter((d) => d.id !== id);
      console.log(newList);
      setListData(newList);
      try {
        const response = await axios.delete(
          `http://localhost:3000/lists/${listName || 'Your_Watchlist'}/${id}`,
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
      } catch (error: any) {
        console.error(error.response.data);
      }
    }
  };

  const handleCopyMove = async () => {
    const list = checkStates.find((l) => l.isChecked);
    if (isCheckAll) {
      try {
        const response = await axios.put(
          `http://localhost:3000/lists/${list?.name}`,
          {
            movies: [...(list?.movies || []), ...listData],
          },
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
        isMove && handleDelete(listTitle);
        handleCancel();
      } catch (error: any) {
        console.error(error.response.data);
      }
    } else {
      const checkedMedia = checkboxStates.filter((m) => m.isChecked);
      const checkedData = checkedMedia.map((m) => m.data);
      try {
        const response = await axios.put(
          `http://localhost:3000/lists/${list?.name}`,
          {
            movies: [...(list?.movies || []), ...checkedData],
          },
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
        isMove && handleDelete(listTitle);
        handleCancel();
      } catch (error: any) {
        console.error(error.response.data);
        if (error.response.data === 'Duplicate movie IDs are not allowed in the list.') {
          setError(`You already have this title in the ${list?.name}`);
          setTimeout(() => {
            setError(null);
          }, 5000);
        }
      }
    }
  };

  const handleCheckLists = (list: Lists) => {
    const checkList = checkStates.map((l) =>
      l.name === list.name ? { ...l, isChecked: true } : { ...l, isChecked: false }
    );
    setCheckStates(checkList);
  };

  const handleCancel = () => {
    setIsCopy(false);
    setIsMove(false);
  };

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
      console.error(error.response.data);
    }
  };

  // Helper function to reorder items
  const reorder = (list: Media[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // If dropped outside the list
    if (!destination) return;

    // Reorder items
    const reorderedItems = reorder(orderdList, source.index, destination.index);
    setListData(reorderedItems);
    reOrederList(reorderedItems, listTitle);
  };

  const queries = [
    { loading: movieCastLoading, error: movieCastError },
    { loading: movieCrewLoading, error: movieCrewError },
    { loading: tvCastLoading, error: tvCastError },
    { loading: tvCrewLoading, error: tvCrewError },
  ];

  for (const { loading, error } of queries) {
    if (loading) return <p className='text-white'>Trending Loading...</p>;
    if (error) return <p className='text-white'>Error: {error.message}</p>;
  }
  return (
    <div className='relative'>
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
            className='absolute top-1/2 left-1/2 flex flex-col gap-10 p-6 bg-gray-400 w-1/3 rounded-lg'
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleList(e, 'title')}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleList(e, 'description')}
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
          <div className='cursor-pointer' onClick={() => setIsEdit((prev) => !prev)}>
            <EditIcon style={{ fontSize: '1.5rem' }} className='text-white hover:text-gray-250' />
            <span className='text-white text-lg ml-2 hover:underline'>Edit</span>
          </div>
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
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId='droppable'>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex ${
                      view.grid ? 'flex-row flex-wrap items-center justify-center' : 'flex-col'
                    } gap-4 p-2 border-2 border-gray-250 rounded-sm`}
                  >
                    {(isReverse ? [...orderdList]?.reverse() : orderdList)?.map(
                      (el: Media, index: number) => (
                        <Draggable
                          key={index.toString()}
                          draggableId={index.toString()}
                          index={index}
                        >
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
                                      <img
                                        src={TMDB_URL + el?.poster_path}
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
                                    className={`${view.details ? 'block' : 'hidden'} font-semibold`}
                                  >
                                    {el?.overview}
                                  </p>
                                )}

                                <div
                                  className={`${
                                    view.details ? 'flex' : 'hidden'
                                  } items-center gap-5 text-base font-medium`}
                                >
                                  {isDirector(sortedCast[index]?.crew) && (
                                    <div key={index} className='flex gap-3'>
                                      <span>Director</span>
                                      <span className='text-secondary'>
                                        {sortedCast[index]?.crew?.map((c: Crew) =>
                                          handleDirector(c)
                                        )}
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
              </Droppable>
            </DragDropContext>
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
