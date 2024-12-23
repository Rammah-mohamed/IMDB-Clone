import { useLocation, useNavigate } from 'react-router-dom';
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
import Navbar from './Navbar';
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
import { Image, VideoLibrary } from '@mui/icons-material';
import { useLazyQuery, useQuery } from '@apollo/client';
import {
  GET_MOVIE_CAST,
  GET_MOVIE_CREW,
  GET_MOVIE_DETAILS,
  GET_MOVIE_GENRES,
  GET_MOVIE_IMAGES,
  GET_MOVIE_REVIEW,
  GET_MOVIE_TRAILER,
  GET_SEASON_DETAILS,
  GET_TV_CAST,
  GET_TV_CREW,
  GET_TV_Details,
  GET_TV_GENRES,
  GET_TV_IMAGES,
  GET_TV_REVIEW,
  GET_TV_TRAILER,
  SEARCH_CELEBRITY,
} from '../graphql/queries';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import MediaList from './MediaList';
import { useAuth } from '../context/authContext';
import axios from 'axios';

const MediaDetail = () => {
  const { user } = useAuth();
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
  const location = useLocation();
  const [data, setData] = useState<Details>(() => {
    return location?.state;
  });
  const navigate = useNavigate();
  const {
    loading: movieTrailerLoading,
    error: movieTrailerError,
    data: movieTrailerData,
  } = useQuery(GET_MOVIE_TRAILER, { variables: { id: data?.id } });
  const {
    loading: movieCastLoading,
    error: movieCastError,
    data: movieCastData,
  } = useQuery(GET_MOVIE_CAST, { variables: { id: data?.id } });
  const {
    loading: movieCrewLoading,
    error: movieCrewError,
    data: movieCrewData,
  } = useQuery(GET_MOVIE_CREW, { variables: { id: data?.id } });
  const {
    loading: movieImagesLoading,
    error: movieImagesError,
    data: movieImagesData,
  } = useQuery(GET_MOVIE_IMAGES, { variables: { id: data?.id } });
  const {
    loading: movieReviewLoading,
    error: movieReviewError,
    data: movieReviewData,
  } = useQuery(GET_MOVIE_REVIEW, { variables: { id: data?.id } });
  const {
    loading: tvTrailerLoading,
    error: tvTrailerError,
    data: tvTrailerData,
  } = useQuery(GET_TV_TRAILER, { variables: { id: data?.id } });
  const {
    loading: tvCastLoading,
    error: tvCastError,
    data: tvCastData,
  } = useQuery(GET_TV_CAST, { variables: { id: data?.id } });
  const {
    loading: tvCrewLoading,
    error: tvCrewError,
    data: tvCrewData,
  } = useQuery(GET_TV_CREW, { variables: { id: data?.id } });
  const {
    loading: tvImagesLoading,
    error: tvImagesError,
    data: tvImagesData,
  } = useQuery(GET_TV_IMAGES, { variables: { id: data?.id } });
  const {
    loading: tvReviewLoading,
    error: tvReviewError,
    data: tvReviewData,
  } = useQuery(GET_TV_REVIEW, { variables: { id: data?.id } });
  const [getMovieDetails, { loading: moviesDetailsLoading, error: moviesDetailsError }] =
    useLazyQuery(GET_MOVIE_DETAILS);
  const [getTvDetails, { loading: tvDetailsLoading, error: tvDetailsError }] =
    useLazyQuery(GET_TV_Details);
  const [getSeasonDetails, { loading: seasonDetailsLoading, error: seasonDetailsError }] =
    useLazyQuery(GET_SEASON_DETAILS);
  const [SearchCelebrity, { loading: celebrityLoading, error: celebrityError }] =
    useLazyQuery(SEARCH_CELEBRITY);
  const {
    loading: tvGenresLoading,
    error: tvGenresError,
    data: tvGenresData,
  } = useQuery(GET_TV_GENRES);
  const {
    loading: movieGenresLoading,
    error: movieGenresError,
    data: movieGenresData,
  } = useQuery(GET_MOVIE_GENRES);
  const movieGenres: Genre[] = movieGenresData?.movieGenres;
  const tvGenres: Genre[] = tvGenresData?.tvGenres;
  const movieVideos: Trailer[] = movieTrailerData?.movieVideos;
  const movieCast: Cast[] = movieCastData?.moviesCast;
  const movieCrew: Crew[] = movieCrewData?.moviesCrew;
  const movieReview: Review[] = movieReviewData?.movieReview;
  const movieImages: Photo[] = movieImagesData?.movieImages;
  const tvVideos: Trailer[] = tvTrailerData?.tvVideos;
  const tvCast: Cast[] = tvCastData?.tvCast;
  const tvCrew: Crew[] = tvCrewData?.tvCrew;
  const tvImages: Photo[] = tvImagesData?.tvImages;
  const tvReview: Review[] = tvReviewData?.tvReview;
  const YOUTUBE_URL: string = 'https://www.youtube.com/watch?v=';
  const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';
  let trailerCount: number = 0;
  let castCount: number = 0;
  let genreCount: number = 0;

  const handleMediaDetails = (id: number, mediaType: string): void => {
    if (mediaType === 'movie') {
      getMovieDetails({ variables: { id: id } }).then((response) => {
        const result: Details = response?.data?.movieDetail;
        // console.log(response?.data?.movieDetail);
        setData(result);
      });
    } else if (mediaType === 'tv') {
      getTvDetails({ variables: { id: id } }).then((response) => {
        const result: Details = response?.data?.tvDetail;
        // console.log(response?.data?.tvDetail);
        setData(result);
        result.seasons.map((s) => {
          getSeasonDetails({ variables: { id: result.id, number: s.season_number } }).then(
            (response) => {
              const data: Season_Details = response.data?.seasonDetail;
              setSeason((prev) => (prev.some((s) => s.id === data.id) ? prev : [...prev, data]));
            }
          );
        });
      });
    }
  };

  useEffect(() => {
    data && handleMediaDetails(data?.id, data.media_type);
  }, [data?.id, data?.media_type]);

  useEffect(() => {
    setSeason((prev) =>
      prev.sort((a, b) => a.season_number - b.season_number).filter((s) => s.season_number !== 0)
    );
  }, [season.length]);

  useEffect(() => {
    season?.map((s) =>
      s?.episodes.map((e) =>
        setEpisodes((prev) => (prev.some((ep) => ep.id === e.id) ? prev : [...prev, e]))
      )
    );
    setEpisodes((prev) =>
      prev.sort((a, b) => a.season_number - b.season_number).filter((s) => s.season_number !== 0)
    );
  }, [season.length]);

  useEffect(() => {
    setTopRatedEpisodes(
      episodes
        ?.sort((a, b) => +b.vote_average - +a.vote_average)
        .filter((e) => Number(e?.vote_average) >= 8.0)
    );
  }, [episodes]);

  const handleCritics = (): void => {
    navigate('/critics', {
      state: {
        mediaName: data?.title || data?.name,
        poster: data?.poster_path,
        review: movieReview || tvReview,
      },
    });
  };

  const handleTrailer = (mediaType: string): void => {
    if (movieVideos && mediaType === 'movie') {
      setTrailer(movieVideos?.filter((t: Trailer) => t.type === 'Trailer')[0]);
    } else if (tvVideos && mediaType === 'tv') {
      setTrailer(tvVideos?.filter((t: Trailer) => t.type === 'Trailer')[0]);
    }
  };

  useEffect(() => {
    if (data && trailerCount === 0) {
      handleTrailer(data?.media_type);
    }
    trailerCount++;
  }, [data, movieVideos, tvVideos]);

  const handleVideo = (videoData: Trailer): void => {
    navigate('/videos', {
      state: {
        videoID: videoData?.key,
        name: videoData?.name,
        related: movieVideos || tvVideos,
      },
    });
  };

  const handelPhoto = (Photos: Photo[]): void => {
    data &&
      navigate('/media', {
        state: { photos: Photos, name: data?.name || data?.title, poster: data?.poster_path },
      });
    window.scrollTo({ top: 0 });
  };

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

  const handleVideoMedia = (): void => {
    if (data && (movieVideos || tvVideos || season)) {
      navigate('/media', {
        state: {
          videos: movieVideos || tvVideos,
          mediaName: data?.name || data?.title,
          mediaImage: data?.poster_path,
          season: season,
          episodes: episodes,
          topRatedEpisodes: topRatedEpisodes,
        },
      });
      window.scrollTo({ top: 0 });
    }
  };

  const handleSeason = (): void => {
    console.log(season.length);
    console.log(data.number_of_seasons);
    if (data && season.length === data.number_of_seasons) {
      navigate('/media', {
        state: {
          mediaName: data?.name,
          mediaImage: data?.poster_path,
          season: season,
          episodes: episodes,
          topRatedEpisodes: topRatedEpisodes,
        },
      });
      window.scrollTo({ top: 0 });
    }
  };

  const handleMovie = (id: number): void => {
    setCast({
      id: id,
      type: 'Movie',
      star: movieCast?.slice(0, 30),
      crew: movieCrew?.slice(0, 20),
    });
  };

  const handleTv = (id: number): void => {
    setCast({
      id: id,
      type: 'TV',
      star: tvCast?.slice(0, 30),
      crew: tvCrew?.slice(0, 20),
    });
  };

  useEffect(() => {
    if (((movieCast && movieCrew) || (tvCast && tvCrew)) && castCount === 0) {
      if (data?.media_type === 'movie' && data?.id) {
        handleMovie(data?.id);
      } else if (data?.media_type === 'tv' && data?.id) {
        handleTv(data?.id);
      }

      castCount++;
    }
  }, [(movieCast && movieCrew) || (tvCast && tvCrew)]);

  const handleDirector = (crew: Crew[]): string | undefined => {
    const director = crew?.find((c) => c?.job === 'Director');
    if (director) {
      return director?.name;
    }
  };
  // Check if there is a Director exist on the Crew array
  const isDirector = (castState: CastState): boolean => {
    if (castState?.crew) {
      const result = castState.crew?.filter((c: Crew) => c.job === 'Director');
      if (result.length !== 0) {
        return true;
      } else return false;
    } else return false;
  };

  const handleWriter = (crew: Crew[]): string | undefined => {
    const Writer = crew?.find((c) => c?.job === 'Writer');
    if (Writer) {
      return Writer?.name;
    }
  };
  // Check if there is a Writer exist on the Crew array
  const isWriter = (castState: CastState): boolean => {
    if (castState?.crew) {
      const result = castState.crew?.filter((c: Crew) => c.job === 'Writer');
      if (result.length !== 0) {
        return true;
      } else return false;
    } else return false;
  };

  const handleCelebrity = (name: string, id: number): void => {
    SearchCelebrity({ variables: { query: name } }).then((response) => {
      const data: Celebrity[] = response?.data?.searchCelebrity;
      const celebrity: Celebrity | undefined = data?.find((c) => c?.id === id);
      navigate('/celebrityDetails', { state: celebrity });
    });
  };

  const handleShow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShow(false);
    setCurrentIndex(null);
  };

  const handleClickImage = (index: number) => {
    setShow(true);
    setCurrentIndex(index);
  };

  function handleNext(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === (movieImages?.length || tvImages?.length) - 1
        ? 0
        : prevIndex !== null
        ? prevIndex + 1
        : null
    );
  }

  function handlePrev(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0
        ? (movieImages?.length || tvImages?.length) - 1
        : prevIndex !== null
        ? prevIndex - 1
        : null
    );
  }

  const currentImage = currentIndex !== null ? (movieImages || tvImages)[currentIndex] : null;

  const handleAddToList = async (e: React.MouseEvent, data: Media, list?: List) => {
    e.stopPropagation();
    const currentList = lists?.find((l) => l?.name === list?.name);
    const isExist = currentList?.movies?.some((m) => m.id === data.id);
    try {
      if (user && (data.isAdded || isExist)) {
        const deleteResponse = await axios.delete(
          `http://localhost:3000/lists/${list?.name || 'Your_Watchlist'}/${data?.id}`,
          {
            withCredentials: true,
          }
        );
        console.log(deleteResponse.data);
        const response = await axios.get(`http://localhost:3000/lists`, {
          withCredentials: true,
        });
        console.log(response.data);
        setLists(response.data);
        (list?.name === undefined || list.name === 'Your Watchlist') &&
          setData((prev) => ({ ...prev, isAdded: false }));
      } else if (user && (!data.isAdded || !isExist)) {
        const updateResponse = await axios.put(
          `http://localhost:3000/lists/${list?.name || 'Your_Watchlist'}/${data?.id}`,
          {
            ...data,
            isAdded: list?.name === 'Your Watchlist' || list?.name === undefined ? true : false,
          },
          {
            withCredentials: true,
          }
        );
        console.log(updateResponse.data);
        const response = await axios.get(`http://localhost:3000/lists`, {
          withCredentials: true,
        });
        console.log(response.data);
        setLists(response.data);
        (list === undefined || list.name === 'Your Watchlist') &&
          setData((prev) => ({ ...prev, isAdded: true }));
      }
    } catch (error: any) {
      console.error(error.response.data);
    }
    if (!user) {
      navigate('/sign');
    }
  };

  const handleList = async (list: List) => {
    try {
      const getResponse = await axios.get(
        `http://localhost:3000/lists/${
          list.name === 'Your Watchlist' ? 'Your_Watchlist' : list.name
        }`,
        {
          withCredentials: true,
        }
      );

      const media = getResponse?.data?.movies;
      navigate('/listDetails', {
        state: { title: list.name, discription: list.description, data: media },
      });
    } catch (error: any) {
      console.error(error.response.data);
    }
  };

  const handleCreate = () => {
    if (user) {
      navigate('/createList');
    } else navigate('/sign');
  };

  const handleWatchlist = async () => {
    try {
      const getResponse = await axios.get(`http://localhost:3000/lists/Watchlist`, {
        withCredentials: true,
      });

      const media = getResponse?.data?.movies;
      if (user) {
        navigate('/listDetails', {
          state: { data: media },
        });
      } else navigate('/sign');
    } catch (error: any) {
      console.error(error.response.data);
    }
  };

  //Get user lists
  useEffect(() => {
    const getLists = async () => {
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
    if (user) {
      getLists();
    }
  }, []);

  //Sync the media to the watchlist state
  useEffect(() => {
    const getWatchlist = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/lists/Your_Watchlist`, {
          withCredentials: true,
        });
        const isExist = response?.data?.movies?.find((m: Media) => m.id === data.id);
        if (!isExist) {
          setData((prev) => ({ ...prev, isAdded: false }));
        } else setData((prev) => ({ ...prev, isAdded: true }));
      } catch (error: any) {
        console.error(error.response.data);
      }
    };
    if (user) {
      getWatchlist();
    }
  }, []);

  const queries = [
    { loading: movieTrailerLoading, error: movieTrailerError },
    { loading: movieGenresLoading, error: movieGenresError },
    { loading: movieCastLoading, error: movieCastError },
    { loading: movieCrewLoading, error: movieCrewError },
    { loading: movieImagesLoading, error: movieImagesError },
    { loading: movieReviewLoading, error: movieReviewError },
    { loading: moviesDetailsLoading, error: moviesDetailsError },
    { loading: tvTrailerLoading, error: tvTrailerError },
    { loading: tvDetailsLoading, error: tvDetailsError },
    { loading: seasonDetailsLoading, error: seasonDetailsError },
    { loading: tvGenresLoading, error: tvGenresError },
    { loading: tvCastLoading, error: tvCastError },
    { loading: tvCrewLoading, error: tvCrewError },
    { loading: tvImagesLoading, error: tvImagesError },
    { loading: tvReviewLoading, error: tvReviewError },
    { loading: celebrityLoading, error: celebrityError },
  ];

  for (const { loading, error } of queries) {
    if (loading) return <p className='text-white'>Trending Loading...</p>;
    if (error) return <p className='text-white'>Error: {error.message}</p>;
  }
  console.log(episodes);
  console.log(data);
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
                <img
                  src={TMDB_URL + data?.poster_path}
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
            <img
              src={TMDB_URL + data?.poster_path}
              alt='Celebrity poster'
              loading='eager'
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
              className='group relative flex flex-1 flex-col items-center justify-center gap-2 text-lg font-medium text-white bg-gray-350 rounded-lg cursor-pointer'
              onClick={() => handelPhoto(movieImages || tvImages)}
            >
              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <Image style={{ fontSize: '2.5rem' }} />
              <span>{movieImages?.length || tvImages?.length} Images</span>
            </div>
            <div
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
              {cast && isDirector(cast) && (
                <div className='flex items-center gap-2'>
                  <span className='text-2xl text-white font-semibold'>Director</span>
                  <span className='text-lg text-secondary'>
                    {cast?.crew && handleDirector(cast?.crew)}
                  </span>
                </div>
              )}
              {cast && isWriter(cast) && (
                <div className='flex items-center gap-2'>
                  <span className='text-2xl text-white font-semibold'>Director</span>
                  <span className='text-lg text-secondary'>
                    {cast?.crew && handleWriter(cast?.crew)}
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
      {season && (
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
      {movieVideos && movieVideos?.length !== 0 && tvVideos && tvVideos?.length !== 0 && (
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
              onClick={() => handelPhoto(movieImages || tvImages)}
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
                          onClick={() => handelPhoto(movieImages || tvImages)}
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
                        <img
                          src={TMDB_URL + currentImage?.file_path}
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

                  <img
                    src={TMDB_URL + p?.file_path}
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
                  <img
                    src={TMDB_URL + c?.profile_path}
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
