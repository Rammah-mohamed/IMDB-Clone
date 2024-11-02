import { useLazyQuery } from '@apollo/client';
import { useLocation } from 'react-router-dom';
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
import { GET_MOVIE_CAST, GET_MOVIE_CREW, GET_TV_CAST, GET_TV_CREW } from '../graphql/queries';
import { useEffect, useMemo, useState } from 'react';
import SearchMenu from '../components/SearchMenu';
import { Cast, CastState, Crew, Media, View } from '../types/media';

const ListDetails = () => {
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [orderText, setOrderText] = useState<string>('List Order');
  const [isReverse, setIsReverse] = useState<boolean>(false);
  const [cast, setCast] = useState<CastState[]>([]);
  const [view, setView] = useState<View>({
    details: true,
    grid: false,
    compact: false,
  });
  const location = useLocation();
  const data = location.state.data;
  const title = location.state.title;
  const listData: Media[] = data;
  const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';
  let handleCount: number = 0;
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

  const handleMovie = (id: number): void => {
    getMovieCast({ variables: { id } }).then((castData) => {
      getMovieCrew({ variables: { id } }).then((crewData) => {
        setCast((prev) => [
          ...prev,
          {
            id: id,
            type: 'Movie',
            star: castData?.data?.moviesCast,
            crew: crewData?.data?.moviesCrew?.slice(0, 20),
          },
        ]);
      });
    });
  };

  const handleTv = (id: number): void => {
    getTvCast({ variables: { id } }).then((castData) => {
      getTvCrew({ variables: { id } }).then((crewData) => {
        setCast((prev) => [
          ...prev,
          {
            id: id,
            type: 'TV',
            star: castData?.data?.tvCast,
            crew: crewData?.data?.tvCrew?.slice(0, 20),
          },
        ]);
      });
    });
  };

  useEffect(() => {
    if (listData && handleCount === 0) {
      listData.forEach((m) => {
        if (m.__typename === 'Movie') {
          handleMovie(m.id);
        } else if (m.__typename === 'TV') {
          handleTv(m.id);
        }
      });
      handleCount++;
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
      [...listData].sort((a, b) => {
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
      [...listData].sort((a, b) => {
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
      [...listData].sort((a, b) => {
        if (!a.vote_average && !b.vote_average) return 0;
        if (!a.vote_average) return 1;
        if (!b.vote_average) return -1;
        return a.vote_average.toString().localeCompare(b.vote_average.toString());
      });

    const ratingnumberSort =
      listData &&
      [...listData].sort((a, b) => {
        if (!a.vote_count && !b.vote_count) return 0;
        if (!a.vote_count) return 1;
        if (!b.vote_count) return -1;
        return a.vote_count.toString().localeCompare(b.vote_count.toString());
      });

    const popularitySort =
      listData &&
      [...listData].sort((a, b) => {
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
  }, [listData, orderText]);

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

  if (movieCastLoading) return <p className='text-white'>Trending Loading...</p>;
  if (movieCastError) return <p className='text-white'>Error: {movieCastError.message}</p>;
  if (movieCrewLoading) return <p className='text-white'>Trending Loading...</p>;
  if (movieCrewError) return <p className='text-white'>Error: {movieCrewError.message}</p>;
  if (tvCastLoading) return <p className='text-white'>Trending Loading...</p>;
  if (tvCastError) return <p className='text-white'>Error: {tvCastError.message}</p>;
  if (tvCrewLoading) return <p className='text-white'>Trending Loading...</p>;
  if (tvCrewError) return <p className='text-white'>Error: {tvCrewError.message}</p>;
  return (
    <div>
      <Navbar />
      <div className='container bg-gray-400 pt-8 pb-8'>
        <h1 className='text-white text-3xl font-medium mb-4'>{title}</h1>
      </div>
      <div className='container bg-white pt-6'>
        <div className='flex gap-20'>
          <div className='flex flex-3 flex-col gap-10'>
            <div className='flex items-center justify-between'>
              <span className='flex-1 text-black-100'>{listData.length} titles</span>
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
              </div>
            </div>
            <div
              className={`flex ${
                view.grid ? 'flex-row flex-wrap items-center justify-center' : 'flex-col'
              } gap-4 p-2 border-2 border-gray-250 rounded-sm`}
            >
              {cast.length === listData.length &&
                (isReverse ? [...orderdList].reverse() : orderdList)?.map(
                  (e: Media, index: number) => (
                    <div className='flex flex-1 flex-col gap-2' key={e.id}>
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
                          >
                            <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                            <AddIcon
                              className='absolute top-0 left-0 bg-black-transparent text-white'
                              style={{ fontSize: view.grid ? '2.3rem' : '1.6rem' }}
                            />
                            <img
                              src={TMDB_URL + e?.poster_path}
                              alt='poster'
                              className='object-cover w-full h-full'
                            />
                          </div>
                          <div className={`flex flex-2 flex-col gap-2 p-2 w-full text-sm`}>
                            <h1 className='flex-2 font-bold'>{e?.title}</h1>
                            <div className='flex-1 text-black-100'>
                              <span>{e?.release_date}</span>
                            </div>
                            <div className='flex text-black-100'>
                              <StarIcon className='text-primary' />
                              <p className='flex-1'>
                                {Number(e?.vote_average ?? 0).toFixed(2)}
                                <span className='flex-1 pl-2 text-gray font-semibold'>
                                  {e?.vote_count.toString().length > 3
                                    ? '(' + e?.vote_count.toString().slice(0, 1) + 'K)'
                                    : '(' + e?.vote_count + ')'}
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
                      <p className={`${view.details ? 'block' : 'hidden'} font-semibold`}>
                        {e?.overview}
                      </p>

                      <div
                        className={`${
                          view.details ? 'flex' : 'hidden'
                        } items-center gap-5 text-base font-medium`}
                      >
                        {isDirector(sortedCast[index]?.crew) && (
                          <div key={index} className='flex gap-3'>
                            <span>Director</span>
                            <span className='text-secondary'>
                              {sortedCast[index]?.crew?.map((c: Crew) => handleDirector(c))}
                            </span>
                          </div>
                        )}

                        <div className='flex gap-3'>
                          {sortedCast[index]?.star?.length !== 0 && (
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
                  )
                )}
            </div>
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
