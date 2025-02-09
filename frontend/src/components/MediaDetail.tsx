import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useLazyQuery, useQuery } from '@apollo/client';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { Image, VideoLibrary } from '@mui/icons-material';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CloseIcon from '@mui/icons-material/Close';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import CheckIcon from '@mui/icons-material/Check';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

// Import types
import {
  Cast,
  CastState,
  Celebrity,
  Crew,
  Details,
  Episode,
  Genre,
  List,
  Media,
  Photo,
  Review,
  Season_Details,
  Trailer,
} from '../types/media';

// Import GraphQl queries
import {
  GET_GENRES,
  GET_MEDIA,
  GET_SEASON_DETAILS,
  GET_TV_Details,
  SEARCH_CELEBRITY,
} from '../graphql/queries';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import getImageUrl from '../utils/getImages';

// Lazy load the components
const Navbar = React.lazy(() => import('./Navbar'));
const MediaList = React.lazy(() => import('./MediaList'));

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

// GraphQL queries
const QUERY_CONFIG = {
  tvDetails: GET_TV_Details,
  seasonDetails: GET_SEASON_DETAILS,
  searchCelebrity: SEARCH_CELEBRITY,
};

// Youtube video URL
const YOUTUBE_URL: string = 'https://www.youtube.com/watch?v=';

const MediaDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state hooks
  const [lists, setLists] = useState<List[]>();
  const [isShowList, setIsShowList] = useState<boolean>(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [season, setSeason] = useState<Season_Details[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [topRatedEpisodes, setTopRatedEpisodes] = useState<Episode[]>([]);
  const [trailer, setTrailer] = useState<Trailer>();
  const [cast, setCast] = useState<CastState>();
  const [show, setShow] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  // Persist the data across tab refreshed
  const [data, setData] = useState<Details>(() => {
    if (location.state) return location?.state;
    const savedData = localStorage.getItem('details');
    return savedData ? JSON.parse(savedData) : {};
  });

  useEffect(() => {
    if (data) {
      localStorage.setItem('details', JSON.stringify(data));
    }
  }, [data]);

  // Handle GraphQL query
  const {
    data: mediaData,
    loading: mediaLoading,
    error: mediaError,
  } = useQuery(GET_MEDIA, { variables: { id: data?.id }, fetchPolicy: 'cache-first' });

  const {
    data: genresData,
    loading: genresLoading,
    error: genresError,
  } = useQuery(GET_GENRES, {
    fetchPolicy: 'cache-first',
  });

  // Query Data
  const movieGenres: Genre[] = genresData?.movieGenres;
  const tvGenres: Genre[] = genresData?.tvGenres;
  const movieVideos: Trailer[] = mediaData?.movieVideos;
  const movieCast: Cast[] = mediaData?.moviesCast;
  const movieCrew: Crew[] = mediaData?.moviesCrew;
  const movieReview: Review[] = mediaData?.movieReview;
  const movieImages: Photo[] = mediaData?.movieImages;
  const tvVideos: Trailer[] = mediaData?.tvVideos;
  const tvCast: Cast[] = mediaData?.tvCast;
  const tvCrew: Crew[] = mediaData?.tvCrew;
  const tvImages: Photo[] = mediaData?.tvImages;
  const tvReview: Review[] = mediaData?.tvReview;

  // Custom hook to Handle GraphQl Queries
  const useMediaDetailsQueries = useCallback(() => {
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

  const { tvDetails, seasonDetails, searchCelebrity } = useMediaDetailsQueries();

  let castCount: number = 0;
  let genreCount: number = 0;

  // Fetch media data depending on it's type
  const handleMediaDetails = async (id: number, mediaType: string): Promise<void> => {
    try {
      if (mediaType === 'tv') {
        const response = await tvDetails.fetch({ id });
        const result: Details = response?.data?.tvDetail;

        // Fetch season details for all seasons
        if (result) {
          const seasonPromises = result.seasons.map((season) =>
            seasonDetails.fetch({ id: result.id, number: season.season_number })
          );

          // Resolve all promises and update state
          const seasonResponses = await Promise.all(seasonPromises);
          const seasonDetailsData = seasonResponses
            .map((response) => response.data?.seasonDetail)
            .filter((data): data is Season_Details => !!data); // Type guard for non-null values

          setSeason((prev) => [
            ...prev,
            ...seasonDetailsData.filter((newSeason) => !prev.some((s) => s.id === newSeason.id)),
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching media details:', error);
    }
  };

  const memoizedHandleMediaDetails = useCallback((id: number, mediaType: string) => {
    handleMediaDetails(id, mediaType);
  }, []);

  useEffect(() => {
    if (data?.id && data.media_type === 'tv') {
      memoizedHandleMediaDetails(data.id, data.media_type);
    }
  }, [data?.id, data?.media_type, memoizedHandleMediaDetails]);

  // Handle media trailer
  const handleTrailer = (mediaType: string): void => {
    let trailer: Trailer | undefined;
    const movieType = mediaType || data.__typename.slice(0, 5).toLocaleLowerCase();
    const tvType = mediaType || data.__typename.slice(0, 2).toLocaleLowerCase();
    if (movieType === 'movie' && movieVideos.length !== 0) {
      trailer = movieVideos.find((t: Trailer) => t.type === 'Trailer');
    } else if (tvType === 'tv' && tvVideos.length !== 0) {
      trailer = tvVideos.find((t: Trailer) => t.type === 'Trailer');
    }

    if (trailer) {
      setTrailer(trailer);
    }
  };

  useEffect(() => {
    if ((data?.media_type || data.__typename) && !mediaLoading) {
      handleTrailer(data.media_type);
    }
  }, [data?.media_type, movieVideos, tvVideos, mediaLoading]);

  // Handle video page
  const handleVideo = (videoData: Trailer): void => {
    const { key: videoID, name } = videoData || {};
    const relatedVideos = movieVideos || tvVideos || [];

    navigate('/videos', {
      state: {
        data,
        videoID: videoID,
        name: name,
        related: relatedVideos,
      },
    });

    // Smoothly scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle media page (videos / photos)
  const handlePhoto = (photos: Photo[]): void => {
    if (!data) return;

    const { name, title, poster_path } = data;

    navigate('/media', {
      state: {
        photos,
        name: name || title,
        poster: poster_path,
      },
    });

    // Smoothly scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVideoMedia = (): void => {
    if (!data || !(movieVideos?.length !== 0 || tvVideos?.length !== 0 || season?.length !== 0))
      return;

    const { name, title, poster_path } = data;

    navigate('/media', {
      state: {
        videos: movieVideos || tvVideos,
        mediaName: name || title,
        mediaImage: poster_path,
      },
    });

    // Smoothly scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle media critics reviews page
  const handleCritics = (): void => {
    const { title, name, poster_path } = data || {};
    const mediaName = title ?? name;
    const poster = poster_path;
    const review = movieReview || tvReview;

    navigate('/critics', {
      state: {
        mediaName,
        poster,
        review,
      },
    });

    // Smoothly scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sort and filter seasons
  useEffect(() => {
    setSeason((prev) => {
      const sortedAndFiltered = prev
        .filter((s) => s.season_number !== 0)
        .sort((a, b) => a.season_number - b.season_number);

      // Only update state if the new array is different
      return JSON.stringify(prev) === JSON.stringify(sortedAndFiltered) ? prev : sortedAndFiltered;
    });
  }, [season]);

  // Add unique episodes and sort them
  useEffect(() => {
    const allEpisodes = season.flatMap((s) => s.episodes);
    setEpisodes((prev) => {
      const uniqueEpisodes = [
        ...prev,
        ...allEpisodes.filter((e) => !prev.some((ep) => ep.id === e.id)),
      ];

      const sortedAndFiltered = uniqueEpisodes
        .filter((e) => e.season_number !== 0)
        .sort((a, b) => a.season_number - b.season_number);

      // Only update state if the new array is different
      return JSON.stringify(prev) === JSON.stringify(sortedAndFiltered) ? prev : sortedAndFiltered;
    });
  }, [season]);

  // Compute top-rated episodes
  useEffect(() => {
    const topRated = episodes
      .filter((e) => +e.vote_average >= 8.0)
      .sort((a, b) => +b.vote_average - +a.vote_average);

    // Only update state if the new array is different
    setTopRatedEpisodes((prev) =>
      JSON.stringify(prev) === JSON.stringify(topRated) ? prev : topRated
    );
  }, [episodes]);

  //Get media genre from genre IDs
  const getGenras = (mediaType: string, array: number[]): void => {
    for (let i = 0; i < array.length; i++) {
      if (mediaType === 'movie') {
        movieGenres?.map((g) => {
          g.id === array[i] ? setGenres((prev) => [...prev, g.name]) : null;
        });
      } else if (mediaType === 'tv') {
        tvGenres?.map((g) => (g.id === array[i] ? setGenres((prev) => [...prev, g.name]) : null));
      }
    }
  };

  useEffect(() => {
    if (data && data?.genre_ids && movieGenres && tvGenres && genreCount === 0) {
      getGenras(data?.media_type, data?.genre_ids);
    }
    genreCount++;
  }, [movieGenres, tvGenres]);

  // Handle media seasons details page
  const handleSeason = (): void => {
    if (!data || !season) return;

    const { name, poster_path } = data;

    navigate('/media', {
      state: {
        mediaName: name,
        mediaImage: poster_path,
        season: season,
        episodes: episodes,
        topRatedEpisodes: topRatedEpisodes,
      },
    });

    // Smoothly scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // handle media cast
  const handleCast = (
    id: number,
    type: 'Movie' | 'TV',
    cast: any[] = [],
    crew: any[] = []
  ): void => {
    setCast({
      id,
      type,
      star: cast.slice(0, 30), // Limit stars to the top 30
      crew: crew.slice(0, 20), // Limit crew to the top 20
    });
  };

  useEffect(() => {
    if (castCount === 0 && data?.id && data?.media_type) {
      if (data.media_type === 'movie') {
        handleCast(data.id, 'Movie', movieCast, movieCrew);
      } else if (data.media_type === 'tv') {
        handleCast(data.id, 'TV', tvCast, tvCrew);
      }

      castCount++; // Ensure this effect runs only once
    }
  }, [movieCast, movieCrew, tvCast, tvCrew, data?.id, data?.media_type]);

  // Functions to get the name of the Director / Writer from the crew
  const getDirectorName = (crew: Crew[]): string | undefined =>
    crew?.find((c) => c.job === 'Director')?.name;

  const getWriterName = (crew: Crew[]): string | undefined =>
    crew?.find((c) => c.job === 'Writer')?.name;

  // Check if a Director / Writer exists
  const hasDirector = (castState: CastState): boolean =>
    castState?.crew?.some((c: Crew) => c.job === 'Director') ?? false;

  const hasWriter = (castState: CastState): boolean =>
    castState?.crew?.some((c: Crew) => c.job === 'Writer') ?? false;

  const handleCelebrity = (name: string, id: number): void => {
    searchCelebrity.fetch({ query: name }).then((response) => {
      const data: Celebrity[] = response?.data?.searchCelebrity;
      const celebrity: Celebrity | undefined = data?.find((c) => c?.id === id);
      navigate('/celebrityDetails', { state: celebrity });
    });
  };

  // Handle next navigation
  function handleNext(e: React.MouseEvent): void {
    e.stopPropagation();

    setCurrentIndex((prevIndex) => {
      const totalImages = movieImages?.length || tvImages?.length || 0;
      if (prevIndex === null) return 0; // Default to the first index if `prevIndex` is null
      return (prevIndex + 1) % totalImages; // Loop back to the start when reaching the end
    });
  }

  // Handle Previous navigation
  function handlePrev(e: React.MouseEvent): void {
    e.stopPropagation();

    setCurrentIndex((prevIndex) => {
      const totalImages = movieImages?.length || tvImages?.length || 0;
      if (prevIndex === null) return totalImages - 1; // Default to the last index if `prevIndex` is null
      return (prevIndex - 1 + totalImages) % totalImages; // Loop back to the end when reaching the start
    });
  }

  // handle show for images gallery popups
  const handleShow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShow(false);
    setCurrentIndex(null);
  };

  const handleClickImage = (index: number) => {
    setShow(true);
    setCurrentIndex(index);
  };

  // Handle current image that displayed
  const currentImage =
    currentIndex !== null && (movieImages || tvImages)
      ? (movieImages || tvImages)[currentIndex]
      : null;

  // Handle adding media to a certain list
  const handleAddToList = async (
    e: React.MouseEvent,
    data: Media | Details,
    list?: List
  ): Promise<void> => {
    e.stopPropagation();

    if (!user) {
      navigate('/sign');
      return;
    }

    const listName = list?.name || 'Your_Watchlist';
    const currentList = lists?.find((l) => l?.name === listName);
    const isExist = currentList?.movies?.some((m) => m.id === data.id);
    const isDefaultWatchlist = listName === 'Your Watchlist' || list?.name === undefined;

    try {
      if (data.isAdded || isExist) {
        await axios.delete(`http://localhost:3000/lists/${listName}/${data.id}`, {
          withCredentials: true,
        });
        console.log(`Removed ${data.id} from ${listName}`);
      } else {
        await axios.put(
          `http://localhost:3000/lists/${listName}/${data.id}`,
          {
            ...data,
            isAdded: isDefaultWatchlist,
          },
          {
            withCredentials: true,
          }
        );
        console.log(`Added ${data.id} to ${listName}`);
      }

      // Refresh lists
      const response = await axios.get(`http://localhost:3000/lists`, {
        withCredentials: true,
      });
      setLists(response.data);

      // Update `isAdded` state if it's the default watchlist
      if (isDefaultWatchlist) {
        setData((prev) => ({ ...prev, isAdded: !(data.isAdded || isExist) }));
      }
    } catch (error: any) {
      console.error(error.response?.data || 'An error occurred');
    }
  };

  // Navigate to a certain list
  const handleList = async (list: List): Promise<void> => {
    const listName = list.name === 'Your Watchlist' ? 'Your_Watchlist' : list.name;

    try {
      const { data } = await axios.get(`http://localhost:3000/lists/${listName}`, {
        withCredentials: true,
      });
      const media = data?.movies;

      // Navigate to the list details page
      navigate('/listDetails', {
        state: {
          title: list.name,
          description: list.description,
          data: media,
        },
      });
    } catch (error: any) {
      console.error(error.response?.data || 'Failed to fetch the list details.');
    }
  };

  // Navigate to watchlist
  const handleWatchlist = async (): Promise<void> => {
    try {
      const { data } = await axios.get('http://localhost:3000/lists/Watchlist', {
        withCredentials: true,
      });
      const media = data?.movies;

      // Navigate based on user's authentication status
      if (user) {
        navigate('/listDetails', {
          state: { data: media },
        });
      } else {
        navigate('/sign');
      }
    } catch (error: any) {
      console.error(error.response?.data || 'Failed to fetch the watchlist.');
    }
  };

  // Create a new list
  const handleCreate = (): void => {
    user ? navigate('/createList') : navigate('/sign');
  };

  //Get user lists
  useEffect(() => {
    const getLists = async (): Promise<void> => {
      try {
        const { data } = await axios.get('http://localhost:3000/lists', {
          withCredentials: true,
        });
        setLists(data);
      } catch (error: any) {
        console.error(error.response?.data || 'Failed to fetch lists.');
      }
    };

    if (user) {
      getLists();
    }
  }, [user]);

  //Sync the media to the user's watchlist
  useEffect(() => {
    const getWatchlist = async (): Promise<void> => {
      try {
        const { data } = await axios.get('http://localhost:3000/lists/Your_Watchlist', {
          withCredentials: true,
        });
        const isExist = data?.movies?.some((m: Media) => m.id === data.id);
        setData((prev) => ({
          ...prev,
          isAdded: isExist,
        }));
      } catch (error: any) {
        console.error(error.response?.data || 'Failed to fetch watchlist.');
      }
    };

    if (user) {
      getWatchlist();
    }
  }, [user, data?.id]);

  // Query loading handling
  if (mediaLoading || genresLoading) {
    return (
      <div
        role='status'
        className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'
      ></div>
    );
  }

  // Query error handling
  if (mediaError || genresError) {
    return (
      <p data-testid='error' className='text-white text-sm'>
        {mediaError?.message || genresError?.message}
      </p>
    );
  }
  return (
    <div>
      {isShowList && (
        <div className='fixed top-0 left-0 flex items-center justify-center w-screen h-screen bg-overlay-70 z-40'>
          <div className='relative flex flex-col bg-black-100' style={{ width: '42rem' }}>
            <CloseIcon
              className='absolute right-2 text-white cursor-pointer'
              style={{ top: '-40px', fontSize: '2rem' }}
              onClick={() => setIsShowList(false)}
            />
            <div className='flex items-center gap-3 p-6'>
              <div className='relative group w-16 h-20 rounded-lg overflow-hidden'>
                <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                <LazyLoadImage
                  src={getImageUrl(data?.poster_path, 'w92')}
                  alt='Celebrity poster'
                  loading='eager'
                  className='object-cover w-full h-full'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <h2 className='text-gray-200 font-medium'>{data?.title || data?.name}</h2>
                <p className='text-white text-2xl font-semibold'>Add to list</p>
              </div>
            </div>
            <div
              className='flex items-center justify-between py-4 px-2 bg-gray-400 text-white border-b-2 border-gray-350  hover:bg-gray-350 cursor-pointer'
              onClick={handleWatchlist}
            >
              <p>View Watchlist</p>
              <KeyboardArrowRightIcon className='text-gray-250' style={{ fontSize: '1.5rem' }} />
            </div>
            <div
              className='flex items-center justify-between py-4 px-2 bg-gray-400 text-white border-b-2 border-gray-350  hover:bg-gray-350 cursor-pointer'
              onClick={handleCreate}
            >
              <p>Create a new list</p>
              <KeyboardArrowRightIcon className='text-gray-250' style={{ fontSize: '1.5rem' }} />
            </div>
            {lists?.length !== 0 &&
              lists?.map((l, index: number) => (
                <div
                  key={index}
                  className='flex items-center justify-between py-4 px-2 bg-gray-400 text-white border-b-2 border-gray-350 cursor-pointer hover:bg-gray-350'
                >
                  <div
                    className='flex items-center gap-2'
                    onClick={(e) => handleAddToList(e, data, l)}
                  >
                    {l?.movies?.some((m) => m.id === data.id) ? (
                      <PlaylistAddCheckIcon className='text-green' style={{ fontSize: '1.5rem' }} />
                    ) : (
                      <AddIcon className='text-gray-250' style={{ fontSize: '1.5rem' }} />
                    )}
                    <p>{l?.name}</p>
                  </div>
                  <KeyboardArrowRightIcon
                    className='text-gray-250'
                    style={{ fontSize: '1.5rem' }}
                    onClick={() => handleList(l)}
                  />
                </div>
              ))}
          </div>
        </div>
      )}
      <Navbar />
      <div className='container flex flex-col gap-3 bg-gray-400 pt-10'>
        <div className='flex justify-between'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-5xl text-white'>{data?.name || data?.title}</h1>
            <span className='text-lg font-medium text-gray-200'>
              {data?.media_type?.toUpperCase()}
            </span>
          </div>
          <div className='flex items-center gap-16'>
            <div className='flex flex-col gap-2'>
              <h3 className='text-gray-250 font-medium'>IMDB Rating</h3>
              <div className='flex items-center gap-3'>
                <StarIcon style={{ fontSize: '1.5rem' }} className='text-primary' />
                <span className='text-lg font-semibold text-gray-200'>
                  {Number(data?.vote_average)?.toFixed(1)}/ 10
                </span>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <h3 className='text-gray-250 font-medium'>Popularity</h3>
              <div className='flex items-center gap-3'>
                <div className='p-1 border-2 border-green rounded-full'>
                  <TrendingUpIcon className='text-green' style={{ fontSize: '1.5rem' }} />
                </div>
                <span className='text-lg font-semibold text-gray-200'>
                  {data?.popularity?.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className='flex gap-2' style={{ height: '30rem' }}>
          <div className='relative group flex-1 rounded-lg cursor-pointer overflow-hidden'>
            <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
            <AddIcon
              className={`absolute top-0 left-0 ${
                user && data?.isAdded
                  ? 'bg-primary text-black-100'
                  : 'bg-black-transparent text-white'
              } z-30`}
              style={{ fontSize: '2.5rem' }}
              onClick={(e) => handleAddToList(e, data)}
            />
            <LazyLoadImage
              src={getImageUrl(data?.poster_path, 'w342')}
              alt='Celebrity poster'
              loading='lazy'
              className='object-cover w-full h-full'
            />
          </div>
          <div
            className='group/trailer relative flex-2.5 rounded-lg cursor-pointer overflow-hidden'
            onClick={(): void => trailer && handleVideo(trailer)}
          >
            <span className='group-hover/trailer:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
            <div className='flex items-end gap-3 absolute top-0 left-0 w-full h-full p-4 bg-overlay z-20'>
              <PlayCircleOutlineIcon style={{ fontSize: '4.5rem', color: 'white' }} />
              <div className='flex flex-col gap-1'>
                <span className='text-white text-3xl'>Play Trailer</span>
                <span className='text-gray-200 text-xl'>{trailer?.name}</span>
              </div>
            </div>
            <ReactPlayer
              url={`${YOUTUBE_URL}${trailer?.key}`}
              width={'100%'}
              height={'100%'}
              muted={true}
              playing={false}
            />
          </div>
          <div className='flex flex-1 flex-col gap-2 rounded-lg cursor-pointer overflow-hidden'>
            <div
              data-testid='photo'
              className='group relative flex flex-1 flex-col items-center justify-center gap-2 text-lg font-medium text-white bg-gray-350 rounded-lg cursor-pointer'
              onClick={() => handlePhoto(movieImages || tvImages)}
            >
              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <Image style={{ fontSize: '2.5rem' }} />
              <span>{movieImages?.length || tvImages?.length} Images</span>
            </div>
            <div
              data-testid='video'
              className='group relative flex flex-1 flex-col items-center justify-center gap-2 text-lg font-medium text-white bg-gray-350 rounded-lg cursor-pointer'
              onClick={() => handleVideoMedia()}
            >
              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <VideoLibrary style={{ fontSize: '2.5rem' }} />
              <span>{movieVideos?.length || tvVideos?.length} Videos</span>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-10 pb-4'>
          <div className='flex flex-2 flex-col gap-6 p-4'>
            <div className='flex gap-3'>
              {genres?.map((g, index) => (
                <button
                  key={index}
                  className='py-1 px-3 text-gray-100 text-sm font-medium rounded-3xl border-2 border-gray-100 hover:bg-black-transparent'
                >
                  {g}
                </button>
              ))}
            </div>
            <p className='text-gray-250 text-lg pt-3 font-medium border-t-2'>{data?.overview}</p>
            <div className='flex flex-col gap-3 pt-3 border-t-2'>
              {cast && hasDirector(cast) && (
                <div className='flex items-center gap-2'>
                  <span className='text-2xl text-white font-semibold'>Director</span>
                  <span className='text-lg text-secondary'>
                    {cast?.crew && getDirectorName(cast?.crew)}
                  </span>
                </div>
              )}
              {cast && hasWriter(cast) && (
                <div className='flex items-center gap-2'>
                  <span className='text-2xl text-white font-semibold'>Director</span>
                  <span className='text-lg text-secondary'>
                    {cast?.crew && getWriterName(cast?.crew)}
                  </span>
                </div>
              )}
              <div className='flex gap-3'>
                {cast && (
                  <>
                    <span className='text-2xl text-white font-semibold'>Stars</span>
                    <div className='flex gap-2 text-lg text-secondary'>
                      {cast?.star?.map(
                        (s: Cast, index: number) =>
                          index < 4 && (
                            <span
                              key={index}
                              className='cursor-pointer hover:underline'
                              onClick={() => handleCelebrity(s?.name, s?.id)}
                            >
                              {s.name}
                            </span>
                          )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className='flex flex-1 flex-col gap-4 p-4'>
            <div className='relative group flex items-center gap-3 bg-primary p-3 text-lg font-medium rounded-3xl cursor-pointer'>
              <div className='items-end gap-3 absolute top-0 left-0 w-full h-full p-4 bg-overlay z-20 hidden group-hover:flex'></div>
              <div className='relative z-30' onClick={(e) => handleAddToList(e, data)}>
                {user && data.isAdded ? <CheckIcon /> : <AddIcon />}
                <span>Add to Watchlist</span>
              </div>
              <KeyboardArrowDownIcon
                style={{ fontSize: '2rem' }}
                className='absolute right-4 top-3 pl-2 border-l-2 border-black z-30'
                onClick={() => setIsShowList(true)}
              />
            </div>
            <button
              data-testid='critic'
              className='text-secondary font-medium cursor-pointer hover:underline'
              onClick={handleCritics}
            >
              {movieReview?.length === 0 || tvReview?.length === 0
                ? '0'
                : movieReview?.length || tvReview?.length}{' '}
              Critic Reviews
            </button>
          </div>
        </div>
      </div>
      {season.length !== 0 && (
        <div className='container flex gap-6 py-10 bg-white'>
          <div className='flex flex-col gap-4 flex-3'>
            <div
              className='group/icon flex items-center gap-2 w-fit text-4xl font-semibold pl-3 border-l-4 border-primary cursor-pointer'
              onClick={() => handleSeason()}
            >
              <h1>Episodes</h1>
              <ArrowForwardIosIcon className='group-hover/icon:text-primary' />
              <span className='text-gray-350 text-lg'>{data?.number_of_episodes}</span>
            </div>
            <div className='flex flex-wrap items-center gap-5'>
              {topRatedEpisodes?.slice(0, 2)?.map((e) => (
                <div key={e.id} className='flex flex-col flex-1 gap-4 p-3 shadow-xl rounded-lg'>
                  <div className='flex flex-1 items-center gap-3'>
                    <AddIcon className='bg-gray-250 text-black' style={{ fontSize: '2rem' }} />
                    <div className='flex flex-1 flex-col gap-1 justify-between'>
                      {Number(e.vote_average) >= 8.0 && (
                        <span
                          className='text-black  uppercase font-medium bg-primary pl-2 w-2/5 rounded'
                          style={{ fontSize: '0.8rem' }}
                        >
                          Top-rated
                        </span>
                      )}
                      <span className=' text-gray-350 font-medium' style={{ fontSize: '0.8rem' }}>
                        {e?.air_date}
                      </span>
                    </div>
                  </div>
                  <div className='flex-1'>
                    <h1 className='text-base font-bold mb-1 w-fit hover:text-gray-300 cursor-pointer'>
                      S{e?.season_number}.E{e?.episode_number} - {e.name}
                    </h1>
                    <p className='text-gray-350'>{e?.overview}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <StarIcon className='text-primary' />
                    <span className='text-gray-350'>{Number(e.vote_average).toFixed(1)}/10</span>
                  </div>
                </div>
              ))}
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
      )}
      {((movieVideos && movieVideos?.length !== 0) || (tvVideos && tvVideos?.length !== 0)) && (
        <div className='container flex gap-6 py-10 bg-white'>
          <div className='flex flex-col gap-4 flex-3'>
            <div
              className='group/icon flex items-center gap-2 w-fit text-4xl font-semibold pl-3 border-l-4 border-primary cursor-pointer'
              onClick={() => handleVideoMedia()}
            >
              <h1>Videos</h1>
              <ArrowForwardIosIcon className='group-hover/icon:text-primary' />
              <span className='text-gray-350 text-lg'>
                {movieVideos?.length || tvVideos?.length}
              </span>
            </div>
            <div className='flex flex-wrap items-center gap-5'>
              {(movieVideos?.slice(0, 4) || tvVideos?.slice(0, 4))?.map((v) => (
                <div
                  key={v?.key}
                  className='group/trailer relative h-64 rounded-lg cursor-pointer overflow-hidden'
                  style={{ width: '27rem' }}
                  onClick={(): void => handleVideo(v)}
                >
                  <span className='group-hover/trailer:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                  <div className='flex items-end gap-3 absolute top-0 left-0 w-full h-full p-4 bg-overlay z-20'>
                    <PlayCircleOutlineIcon style={{ fontSize: '4rem', color: 'white' }} />
                    <div className='flex flex-col gap-1'>
                      <span className='text-white text-2xl'>Play Trailer</span>
                      <span className='text-gray-200 text-lg'>{v?.name}</span>
                    </div>
                  </div>
                  <ReactPlayer
                    url={`${YOUTUBE_URL}${v?.key}`}
                    width={'100%'}
                    height={'100%'}
                    muted={true}
                    playing={false}
                  />
                </div>
              ))}
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
      )}
      <div className='container flex gap-6 py-10 bg-white'>
        {(movieImages?.length !== 0 || tvImages?.length !== 0) && (
          <div className='flex flex-3 flex-col gap-4'>
            <div
              className='group/icon flex items-center gap-2 w-fit text-4xl font-semibold pl-3 border-l-4 border-primary cursor-pointer'
              onClick={() => handlePhoto(movieImages || tvImages)}
            >
              <h1>Photos</h1>
              <ArrowForwardIosIcon className='group-hover/icon:text-primary' />
              <span className='text-gray-350 text-lg'>
                {movieImages?.length || tvImages?.length}
              </span>
            </div>
            <div className='flex flex-wrap gap-3'>
              {(movieImages || tvImages)?.map((p: Photo, index: number) => (
                <div
                  key={index}
                  className={`${
                    show && currentImage && currentIndex === index
                      ? 'block'
                      : index < 8
                      ? 'block'
                      : 'hidden'
                  } group relative w-52 h-64 rounded-lg cursor-pointer overflow-hidden`}
                  onClick={(): void => handleClickImage(index)}
                >
                  <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-30'></span>

                  {show && currentImage && currentIndex === index && (
                    <div className='flex flex-col items-center gap-4 fixed left-0 top-0 w-screen h-screen p-6 bg-black z-30'>
                      <button
                        className='absolute top-1/2 left-8 p-3 text-white hover:text-primary border-2 border-solid rounded-md z-40'
                        onClick={(e): void => handlePrev(e)}
                      >
                        <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
                      </button>
                      <button
                        className='absolute top-1/2 right-8 p-3 text-white hover:text-primary border-2 border-solid rounded-md z-40'
                        onClick={(e): void => handleNext(e)}
                      >
                        <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
                      </button>
                      <div className='flex w-full px-28 items-center justify-between text-white'>
                        <div
                          className='flex items-center gap-2 cursor-pointer'
                          onClick={(e): void => handleShow(e)}
                        >
                          <CloseIcon style={{ fontSize: '1.5rem' }} />
                          <span className='text-lg'>Close</span>
                        </div>
                        <div
                          className='flex items-center gap-2'
                          onClick={() => handlePhoto(movieImages || tvImages)}
                        >
                          <p className='text-lg text-primary'>
                            {index + 1} Of {movieImages?.length || tvImages?.length}
                          </p>
                          <ViewCompactIcon style={{ fontSize: '2rem', color: 'white' }} />
                        </div>
                      </div>
                      <div
                        style={{
                          width:
                            currentImage?.width >= 1000
                              ? currentImage?.width / 3
                              : currentImage?.width,
                          height: '85vh',
                        }}
                      >
                        <LazyLoadImage
                          src={getImageUrl(currentImage?.file_path, 'w780')}
                          loading='lazy'
                          alt='Celebrity Image'
                          className='object-cover w-full h-full'
                        />
                      </div>
                    </div>
                  )}

                  {index < 8 && (movieImages || tvImages)?.slice(0, 8).length - 1 === index && (
                    <span className='flex items-center justify-center absolute top-0 left-0 w-full h-full text-lg text-white font-medium bg-overlay-60 z-10'>
                      + {(movieImages || tvImages)?.slice(8)?.length}
                    </span>
                  )}

                  <LazyLoadImage
                    src={getImageUrl(p?.file_path, 'w342')}
                    loading='lazy'
                    alt='Celebrity Image'
                    className='object-cover w-full h-full'
                  />
                </div>
              ))}
            </div>
          </div>
        )}
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
      <div className='container flex gap-6 pt-10 bg-white'>
        <div className='flex flex-3 flex-col gap-4'>
          <div className='group/icon flex items-center gap-2 w-fit text-4xl font-semibold pl-3 border-l-4 border-primary cursor-pointer'>
            <h1>Top Cast</h1>
            <ArrowForwardIosIcon className='group-hover/icon:text-primary' />
            <span className='text-gray-350 text-lg'>{movieCast?.length || tvCast?.length}</span>
          </div>
          <div className='grid grid-cols-2 gap-4 items-center'>
            {(movieCast || tvCast).slice(0, 20)?.map((c: Cast) => (
              <div
                key={c?.id}
                className='flex items-center gap-4 cursor-pointer'
                onClick={(): void => handleCelebrity(c?.name, c?.id)}
              >
                <div className='w-32 h-32 rounded-full overflow-hidden'>
                  <LazyLoadImage
                    src={getImageUrl(c?.profile_path, 'w154')}
                    loading='lazy'
                    alt='Celebrity Profile Image'
                    className='object-cover w-full h-full'
                  />
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <span className='text-lg font-medium'>{c?.name}</span>
                  <span className='text font-medium text-gray-300'>{c?.character}</span>
                </div>
              </div>
            ))}
          </div>
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
      <MediaList title='Similar' mediaType={data?.media_type} id={data?.id} />
      <MediaList title='Recommend' mediaType={data?.media_type} id={data?.id} />
    </div>
  );
};

export default MediaDetail;
