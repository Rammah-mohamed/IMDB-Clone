import { useEffect, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GET_CELEBRITY_DETAILS,
  GET_CELEBRITY_IMAGES,
  GET_MOVIE_CAST,
  GET_MOVIE_CREW,
  GET_MOVIE_TRAILER,
  GET_TV_CAST,
  GET_TV_CREW,
  GET_TV_TRAILER,
} from '../graphql/queries';
import Navbar from '../components/Navbar';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReactPlayer from 'react-player';
import { Cast, CastState, Celebrity, Crew, Photo, Trailer } from '../types/media';
import { Image, VideoLibrary } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';

const CelebrityDetails = () => {
  const [video, setVideo] = useState<Trailer[]>([]);
  const [cast, setCast] = useState<CastState[]>([]);
  const [isDetails, setIsDetails] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const location = useLocation();
  const celebrityInfo: Celebrity = location.state;
  const navigate = useNavigate();
  const {
    loading: celebrityLoading,
    error: celebrityError,
    data,
  } = useQuery(GET_CELEBRITY_DETAILS, { variables: { id: celebrityInfo?.id } });
  const {
    loading: celebrityImagesLoading,
    error: celebrityImagesError,
    data: celebrityImagesData,
  } = useQuery(GET_CELEBRITY_IMAGES, { variables: { id: celebrityInfo?.id } });
  const [
    getMovieTrailer,
    { loading: movieTrailerLoading, error: movieTrailerError, data: _movieTrailerData },
  ] = useLazyQuery(GET_MOVIE_TRAILER);
  const [getTvTrailer, { loading: tvTrailerLoading, error: tvTrailerError, data: _tvTrailerData }] =
    useLazyQuery(GET_TV_TRAILER);
  const [getMovieCast, { loading: movieCastLoading, error: movieCastError }] =
    useLazyQuery(GET_MOVIE_CAST);
  const [getMovieCrew, { loading: movieCrewLoading, error: movieCrewError }] =
    useLazyQuery(GET_MOVIE_CREW);
  const [getTvCast, { loading: tvCastLoading, error: tvCastError }] = useLazyQuery(GET_TV_CAST);
  const [getTvCrew, { loading: tvCrewLoading, error: tvCrewError }] = useLazyQuery(GET_TV_CREW);
  const celebrityData: Celebrity = data?.celebrityDetail;
  const celebrityImages: Photo[] = celebrityImagesData?.celebrityImages;
  const YOUTUBE_URL = 'https://www.youtube.com/watch?v=';
  const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';
  let count: number = 0;
  let castCount: number = 0;

  const handleTrailer = (mediaType: string, id: number): void => {
    if (mediaType === 'movie') {
      getMovieTrailer({ variables: { id } }).then((videoData) => {
        setVideo((prev) => [
          ...prev,
          videoData?.data?.movieVideos?.filter((t: Trailer) => t.type === 'Trailer')[0],
        ]);
      });
    } else if (mediaType === 'tv') {
      getTvTrailer({ variables: { id } }).then((videoData) => {
        setVideo((prev) => [
          ...prev,
          videoData?.data?.tvVideos?.filter((t: Trailer) => t.type === 'Trailer')[0],
        ]);
      });
    }
  };

  useEffect(() => {
    if (celebrityInfo && count === 0) {
      celebrityInfo?.known_for?.map((m) => handleTrailer(m.media_type, m.id));
    }
    count++;
  }, [celebrityInfo]);

  const handleMovie = (id: number): void => {
    getMovieCast({ variables: { id } }).then((castData) => {
      getMovieCrew({ variables: { id } }).then((crewData) => {
        setCast((prev) => [
          ...prev,
          {
            id: id,
            type: 'Movie',
            star: castData?.data?.moviesCast?.slice(0, 30),
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
            star: castData?.data?.tvCast?.slice(0, 30),
            crew: crewData?.data?.tvCrew?.slice(0, 20),
          },
        ]);
      });
    });
  };

  useEffect(() => {
    if (celebrityInfo && castCount === 0) {
      celebrityInfo?.known_for?.forEach((m) => {
        if (m.media_type === 'movie' && m.id) {
          handleMovie(m.id);
        } else if (m.media_type === 'tv' && m.id) {
          handleTv(m.id);
        }
      });
      castCount++;
    }
  }, [celebrityInfo]);

  // Create a mapping of the order index for listData
  const orderMap = new Map(celebrityInfo?.known_for?.map((item, index) => [item.id, index]));

  // Sort cast based on the order in listData
  const sortedCast = cast?.sort((a, b) => {
    const orderA = orderMap?.get(a.id) ?? 0;
    const orderB = orderMap?.get(b.id) ?? 0;
    return orderA - orderB;
  });

  const handleDirector = (crew: Crew): string | undefined => {
    if (crew?.job === 'Director') {
      return crew?.name;
    }
  };
  // Check if there is a Director exist on the Crew array
  const isDirector = (castState: CastState[], index: number): boolean => {
    if (castState[index]?.crew) {
      const result = castState[index].crew?.filter((c: Crew) => c.job === 'Director');
      if (result.length !== 0) {
        return true;
      } else return false;
    } else return false;
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
      prevIndex === celebrityImages.length - 1 ? 0 : prevIndex !== null ? prevIndex + 1 : null
    );
  }

  function handlePrev(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? celebrityImages.length - 1 : prevIndex !== null ? prevIndex - 1 : null
    );
  }

  const currentImage = currentIndex !== null ? celebrityImages[currentIndex] : null;

  const handleVideo = (videoData: Trailer): void => {
    navigate('/videos', {
      state: { videoID: videoData?.key, name: videoData?.name, related: video },
    });
  };

  const queries = [
    { loading: celebrityLoading, error: celebrityError },
    { loading: celebrityImagesLoading, error: celebrityImagesError },
    { loading: movieTrailerLoading, error: movieTrailerError },
    { loading: tvTrailerLoading, error: tvTrailerError },
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
    <div>
      <Navbar />
      <div className='container flex flex-col gap-3 bg-gray-400 pt-10'>
        <div className='flex justify-between'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-5xl text-white'>{celebrityInfo?.name}</h1>
            <span className='text text-gray-200'>{celebrityInfo?.known_for_department}</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='p-1 border-2 border-green rounded-full'>
              <TrendingUpIcon className='text-green' style={{ fontSize: '1.4rem' }} />
            </div>
            <span className='text-lg font-semibold text-gray-200'>
              {celebrityInfo?.popularity.toFixed(0)}
            </span>
          </div>
        </div>
        <div className='flex gap-2' style={{ height: '30rem' }}>
          <div className='relative group flex-1 rounded-lg cursor-pointer overflow-hidden'>
            <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
            <img
              src={TMDB_URL + celebrityInfo?.profile_path}
              alt='Celebrity poster'
              loading='eager'
              className='object-cover w-full h-full'
            />
          </div>
          <div
            className='group/trailer relative flex-2.5 rounded-lg cursor-pointer overflow-hidden'
            onClick={(): void => handleVideo(video[0])}
          >
            <span className='group-hover/trailer:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
            <div className='flex items-end gap-3 absolute top-0 left-0 w-full h-full p-4 bg-overlay z-20'>
              <PlayCircleOutlineIcon style={{ fontSize: '4.5rem', color: 'white' }} />
              <div className='flex flex-col gap-1'>
                <span className='text-white text-3xl'>Play Trailer</span>
                <span className='text-gray-200 text-xl'>{video[0]?.name}</span>
              </div>
            </div>
            <ReactPlayer
              url={`${YOUTUBE_URL}${video[0]?.key}`}
              width={'100%'}
              height={'100%'}
              muted={true}
              playing={false}
            />
          </div>
          <div className='flex flex-1 flex-col gap-2 rounded-lg cursor-pointer overflow-hidden'>
            <div className='group relative flex flex-1 flex-col items-center justify-center gap-2 text-lg font-medium text-white bg-gray-350 rounded-lg cursor-pointer'>
              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <Image style={{ fontSize: '2.5rem' }} />
              <span>Images</span>
            </div>
            <div className='group relative flex flex-1 flex-col items-center justify-center gap-2 text-lg font-medium text-white bg-gray-350 rounded-lg cursor-pointer'>
              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <VideoLibrary style={{ fontSize: '2.5rem' }} />
              <span>Videos</span>
            </div>
          </div>
        </div>
        <div className='flex gap-8 p-4'>
          <div
            className='flex-2 text-white text-lg text-justify cursor-pointer'
            onClick={() => setIsDetails((prev) => !prev)}
          >
            {isDetails ? celebrityData?.biography : celebrityData?.biography.slice(0, 250) + ' ...'}
            {isDetails ? (
              <KeyboardArrowUpIcon className='cursor-pointer' style={{ fontSize: '1.8rem' }} />
            ) : (
              <KeyboardArrowDownIcon className='cursor-pointer' style={{ fontSize: '1.8rem' }} />
            )}
          </div>
          <div className='flex flex-1 flex-col gap-2 text-white text-base font-medium'>
            <p>
              Birthday <span className='pl-2 text-gray-250'>{celebrityData?.birthday}</span>
            </p>
            {celebrityData?.place_of_birth && (
              <p>
                Place of birth
                <span className='pl-2 text-gray-250'>{celebrityData?.place_of_birth}</span>
              </p>
            )}
            {celebrityData.deathday && <span>Deathday: {celebrityData?.deathday}</span>}
          </div>
        </div>
      </div>
      <div className='container flex gap-6 pt-20 bg-white'>
        <div className='flex flex-3 flex-col gap-4'>
          <div className='group/icon flex items-center gap-2 w-fit text-4xl font-semibold pl-3 border-l-4 border-primary cursor-pointer'>
            <h1>Photos</h1>
            <ArrowForwardIosIcon className='group-hover/icon:text-primary' />
            <span className='text-gray-350 text-lg'>{celebrityImages?.length}</span>
          </div>
          <div className='flex flex-wrap gap-3'>
            {celebrityImages?.map((p: Photo, index: number) => (
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
                      <div className='flex items-center gap-2'>
                        <p className='text-lg text-primary'>
                          {index + 1} Of {celebrityImages.length}
                        </p>
                        <ViewCompactIcon style={{ fontSize: '2rem', color: 'white' }} />
                      </div>
                    </div>
                    <div
                      style={{
                        width:
                          currentImage?.width > 800 ? currentImage?.width / 4 : currentImage?.width,
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

                {index < 8 && celebrityImages?.slice(0, 8).length - 1 === index && (
                  <span className='flex items-center justify-center absolute top-0 left-0 w-full h-full text-lg text-white font-medium bg-overlay-60 z-10'>
                    + {celebrityImages?.slice(8)?.length}
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
      <div className='container pt-10'>
        <h1 className='text-4xl font-semibold pl-3 border-l-4 border-primary'>Known For</h1>
      </div>
      <div className='container flex gap-6 bg-white'>
        <div className='flex flex-3 flex-col gap-10 p-6 mt-4 border-2 border-gray-100 shadow-md'>
          {celebrityInfo?.known_for?.map((m, index) => (
            <div className='flex flex-1 flex-col gap-2 cursor-pointer' key={m.id}>
              <div className='flex items-center'>
                <div className='flex flex-1  flex-row items-center gap-3'>
                  <div
                    className='group relative w-24 h-32
                overflow-hidden rounded-xl cursor-pointer'
                  >
                    <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                    <AddIcon className='absolute top-0 left-0 bg-black-transparent text-white' />
                    <img
                      src={TMDB_URL + m?.poster_path}
                      alt='poster'
                      className='object-cover w-full h-full'
                    />
                  </div>
                  <div className={`flex flex-2 flex-col gap-2 p-2 w-full text-sm`}>
                    <h1 className='flex-2 text-lg font-bold'>{m?.title}</h1>
                    <div className='flex-1 text-black-100'>
                      <span>{m?.release_date}</span>
                    </div>
                    <div className='flex text-black-100'>
                      <StarIcon className='text-primary' />
                      <p className='flex-1'>
                        {Number(m?.vote_average ?? 0).toFixed(2)}
                        <span className='flex-1 pl-2 text-gray font-semibold'>
                          {m?.vote_count.toString().length > 3
                            ? '(' + m?.vote_count.toString().slice(0, 1) + 'K)'
                            : '(' + m?.vote_count + ')'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <ErrorOutlineIcon className='text-secondary' />
              </div>
              <p className='font-semibold'>{m?.overview}</p>

              <div className='flex items-center gap-5 text-base font-medium'>
                {isDirector(sortedCast, index) && (
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
                          (s: Cast, index: number) => index < 3 && <span key={index}>{s.name}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
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
      <div className='container flex gap-6 pt-20 pb-10 bg-white'>
        <div className='flex flex-col gap-4 flex-3'>
          <div className='group/icon flex items-center gap-2 w-fit text-4xl font-semibold pl-3 border-l-4 border-primary cursor-pointer'>
            <h1>Videos</h1>
            <ArrowForwardIosIcon className='group-hover/icon:text-primary' />
            <span className='text-gray-350 text-lg'>{video?.length}</span>
          </div>
          <div className='flex flex-wrap items-center gap-6'>
            {video?.map((v) => (
              <div
                key={v?.key}
                className='group/trailer relative w-96 h-64 rounded-lg cursor-pointer overflow-hidden'
                onClick={(): void => handleVideo(v)}
              >
                <span className='group-hover/trailer:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                <div className='flex items-end gap-3 absolute top-0 left-0 w-full h-full p-4 bg-overlay z-20'>
                  <PlayCircleOutlineIcon style={{ fontSize: '4.5rem', color: 'white' }} />
                  <div className='flex flex-col gap-1'>
                    <span className='text-white text-3xl'>Play Trailer</span>
                    <span className='text-gray-200 text-xl'>{video[0]?.name}</span>
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

export default CelebrityDetails;
