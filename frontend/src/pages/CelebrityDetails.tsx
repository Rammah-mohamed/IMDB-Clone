import React, { useCallback, useEffect, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { Cast, CastState, Celebrity, Crew, Photo, Trailer } from '../types/media';
import ReactPlayer from 'react-player';
import {
  GET_CELEBRITY,
  GET_MOVIE_CAST,
  GET_MOVIE_CREW,
  GET_MOVIE_TRAILER,
  GET_TV_CAST,
  GET_TV_CREW,
  GET_TV_TRAILER,
} from '../graphql/queries';
import { Image, VideoLibrary } from '@mui/icons-material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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
import { LazyLoadImage } from 'react-lazy-load-image-component';
import getImageUrl from '../utils/getImages';

// Lazy load the component
const Navbar = React.lazy(() => import('../components/Navbar'));

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
  movieTrailer: GET_MOVIE_TRAILER,
  movieCast: GET_MOVIE_CAST,
  movieCrew: GET_MOVIE_CREW,
  tvTrailer: GET_TV_TRAILER,
  tvCast: GET_TV_CAST,
  tvCrew: GET_TV_CREW,
};

// YouTube video URL
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=';

const CelebrityDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const celebrityInfo: Celebrity = location.state;

  // State hooks
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [castData, setCastData] = useState<CastState[]>([]);
  const [isDetails, setIsDetails] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Celebrity Details Query
  const {
    data: celebrityDetails,
    loading: isCelebrityLoading,
    error: celebrityError,
  } = useQuery(GET_CELEBRITY, { variables: { id: celebrityInfo?.id }, fetchPolicy: 'cache-first' });

  const celebrityData = celebrityDetails?.celebrityDetail;
  const celebrityImages = celebrityDetails?.celebrityImages ?? [];

  // Custom hook for lazy queries
  const useLazyQueries = useCallback(() => {
    return Object.entries(QUERY_CONFIG).reduce((acc, [key, query]) => {
      const [fetch, { loading, error, data }] = useLazyQuery(query);
      acc[key] = { fetch, loading, error, data };
      return acc;
    }, {} as Queries);
  }, []);

  const { movieTrailer, movieCast, movieCrew, tvTrailer, tvCast, tvCrew } = useLazyQueries();

  // Fetch media trailers
  useEffect(() => {
    if (celebrityInfo?.known_for) {
      const fetchTrailers = celebrityInfo.known_for.map((media) => {
        const fetchTrailer = media.media_type === 'movie' ? movieTrailer.fetch : tvTrailer.fetch;
        return fetchTrailer({ variables: { id: media.id } }).then((res) => {
          const videos =
            media.media_type === 'movie' ? res?.data?.movieVideos : res?.data?.tvVideos;

          // Find the first trailer of type 'Trailer'
          return videos?.find((t: Trailer) => t.type === 'Trailer');
        });
      });

      // Wait for all trailers to be fetched
      Promise.all(fetchTrailers).then((trailers) => {
        const uniqueTrailers = trailers.filter(Boolean);
        setTrailers([...uniqueTrailers]);
      });
    }
  }, [celebrityInfo, movieTrailer.fetch, tvTrailer.fetch]);

  // Fetch cast and crew data
  useEffect(() => {
    if (celebrityInfo?.known_for) {
      celebrityInfo.known_for.forEach((media) => {
        const fetchCast = media.media_type === 'movie' ? movieCast.fetch : tvCast.fetch;
        const fetchCrew = media.media_type === 'movie' ? movieCrew.fetch : tvCrew.fetch;

        Promise.all([
          fetchCast({ variables: { id: media.id } }),
          fetchCrew({ variables: { id: media.id } }),
        ]).then(([castRes, crewRes]) => {
          setCastData((prev) => [
            ...prev,
            {
              id: media.id,
              type: media.media_type,
              star:
                media.media_type === 'movie'
                  ? castRes?.data?.moviesCast?.slice(0, 30)
                  : castRes?.data?.tvCast?.slice(0, 30),
              crew:
                media.media_type === 'movie'
                  ? crewRes?.data?.moviesCrew?.slice(0, 30)
                  : crewRes?.data?.tvCrew?.slice(0, 30),
            },
          ]);
        });
      });
    }
  }, [celebrityInfo, movieCast.fetch, movieCrew.fetch, tvCast.fetch, tvCrew.fetch]);

  // Create a mapping of the order index for celebrityInfo
  const orderMap = new Map(celebrityInfo?.known_for?.map((item, index) => [item.id, index]));

  // Sort cast based on the order in cast
  const sortedCast = castData?.sort((a, b) => {
    const orderA = orderMap?.get(a.id) ?? 0;
    const orderB = orderMap?.get(b.id) ?? 0;
    return orderA - orderB;
  });

  // Function to get the name of the Director from the crew
  const getDirectorName = (crew: Crew): string | undefined =>
    crew?.job === 'Director' ? crew.name : undefined;

  // Check if a Director exists in the crew array at a given index
  const hasDirector = (castState: CastState[], index: number): boolean =>
    castState[index]?.crew?.some((c: Crew) => c.job === 'Director') ?? false;

  // Handle image modal
  const handleImageModal = (index: number) => {
    console.log('T');
    setShowImageModal(true);
    setCurrentImageIndex(index);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('T');
    setCurrentImageIndex((prevIndex) =>
      prevIndex === celebrityImages.length - 1 ? 0 : (prevIndex ?? 0) + 1
    );
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? celebrityImages.length - 1 : (prevIndex ?? 1) - 1
    );
  };

  const closeImageModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowImageModal(false);
    setCurrentImageIndex(0);
  };

  const currentImage = celebrityImages[currentImageIndex];

  // Handle navigation
  const handleVideo = (videoData: Trailer): void => {
    navigate('/videos', {
      state: { videoID: videoData?.key, name: videoData?.name, related: trailers },
    });
  };

  const handelPhoto = (Photos: Photo[]): void => {
    celebrityInfo && navigate('/media', { state: { photos: Photos, name: celebrityInfo?.name } });
  };

  const handelVideoMedia = (videos: Trailer[]): void => {
    if (celebrityImages && celebrityInfo) {
      navigate('/media', {
        state: {
          videos: videos,
          name: celebrityInfo?.name,
          celebrityImage: celebrityImages[0],
        },
      });
    }
  };

  // Loading and error handling
  const isLoading = [
    isCelebrityLoading,
    movieTrailer.loading,
    tvTrailer.loading,
    movieCast.loading,
    tvCast.loading,
    movieCrew.loading,
    tvCrew.loading,
  ].some(Boolean);

  const errors = [
    celebrityError,
    movieTrailer.error,
    tvTrailer.error,
    movieCast.error,
    tvCast.error,
    movieCrew.error,
    tvCrew.error,
  ].filter(Boolean);

  if (isLoading) {
    return (
      <div
        role='status'
        className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'
      ></div>
    );
  }

  if (errors.length) {
    return (
      <ul className='text-sm text-white'>
        {errors.map((err, idx) => (
          <li key={idx}>{err.message}</li>
        ))}
      </ul>
    );
  }
  return (
    <div>
      <Navbar />
      <div className='flex flex-col gap-3 bg-gray-400 pt-10 max-md:p-4'>
        <div className='container flex justify-between'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-5xl max-md:text-3xl text-white'>{celebrityInfo?.name}</h1>
            <span className='text text-gray-200'>{celebrityInfo?.known_for_department}</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='p-1 border-2 border-green rounded-full'>
              <TrendingUpIcon className='text-green' style={{ fontSize: '1.4rem' }} />
            </div>
            <span className='text-lg max-md:text-base font-semibold text-gray-200'>
              {celebrityInfo?.popularity?.toFixed(0)}
            </span>
          </div>
        </div>
        <div
          className='container flex gap-2'
          style={{ height: window.innerWidth <= 1024 ? '30rem' : '20rem' }}
        >
          <div className='relative group flex-1 rounded-lg cursor-pointer overflow-hidden'>
            <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
            <LazyLoadImage
              src={getImageUrl(celebrityInfo?.profile_path, 'w342')}
              alt='Celebrity poster'
              loading='lazy'
              className='object-cover w-full h-full'
            />
          </div>
          <div
            className='group/trailer relative flex-2.5 max-md:flex-2 rounded-lg cursor-pointer overflow-hidden'
            onClick={(): void => handleVideo(trailers[0])}
          >
            <span className='group-hover/trailer:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
            <div className='flex items-end gap-3 max-md:gap-2 absolute top-0 left-0 w-full h-full p-4 max-md:p-3 bg-overlay z-20'>
              <PlayCircleOutlineIcon style={{ fontSize: '4.5rem', color: 'white' }} />
              <div className='flex flex-col gap-1'>
                <span className='text-white text-3xl max-md:text-2xl'>Play Trailer</span>
                <span className='text-gray-200 text-xl max-md:text-lg'>{trailers[0]?.name}</span>
              </div>
            </div>
            <ReactPlayer
              url={`${YOUTUBE_URL}${trailers[0]?.key}`}
              width={'100%'}
              height={'100%'}
              muted={true}
              playing={false}
            />
          </div>
          <div className='flex flex-1 flex-col gap-2 rounded-lg cursor-pointer overflow-hidden'>
            <div
              className='group relative flex flex-1 flex-col items-center justify-center gap-2 text-lg max-md:text-base font-medium text-white bg-gray-350 rounded-lg cursor-pointer'
              onClick={() => handelPhoto(celebrityImages)}
            >
              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <Image style={{ fontSize: '2.5rem' }} />
              <span>{celebrityImages.length} Images</span>
            </div>
            <div
              className='group relative flex flex-1 flex-col items-center justify-center gap-2 text-lg max-md:text-base font-medium text-white bg-gray-350 rounded-lg cursor-pointer'
              onClick={() => handelVideoMedia(trailers)}
            >
              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <VideoLibrary style={{ fontSize: '2.5rem' }} />
              <span>{trailers.length} Videos</span>
            </div>
          </div>
        </div>
        <div className='container flex gap-8 p-4 max-md:gap-6 max-md:p-3'>
          <div
            className='flex-2 text-white text-lg max-md:text-base text-justify cursor-pointer'
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
      <div className='container flex gap-6 pt-20 max-md:gap-4 max-md:p-14 bg-white'>
        <div className='flex flex-3 flex-col gap-4 max-md:gap-3'>
          <div
            className='group/icon flex items-center max-md:justify-center gap-2 w-fit text-4xl font-semibold pl-3 max-md:pl-2 border-l-4 border-primary cursor-pointer'
            onClick={() => handelPhoto(celebrityImages)}
          >
            <h1>Photos</h1>
            <ArrowForwardIosIcon className='group-hover/icon:text-primary' />
            <span className='text-gray-350 text-lg max-md:text-base'>
              {celebrityImages?.length}
            </span>
          </div>
          <div className='flex flex-wrap max-md:justify-center gap-3 max-md:gap-2'>
            {celebrityImages?.map((p: Photo, index: number) => (
              <div
                key={index}
                className={`${
                  showImageModal && currentImage && currentImageIndex === index
                    ? 'block'
                    : index < 8
                    ? 'block'
                    : 'hidden'
                } group relative w-52 h-64 max-md:w-44 max-md:h-52 rounded-lg cursor-pointer overflow-hidden`}
                onClick={(): void => handleImageModal(index)}
              >
                <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-30'></span>

                {showImageModal && currentImage && currentImageIndex === index && (
                  <div className='flex flex-col items-center gap-4 max-md:gap-3 fixed left-0 top-0 w-screen h-screen p-6 max-md:p-4 bg-black z-30'>
                    <button
                      className='absolute top-1/2 left-8 p-3 text-white hover:text-primary border-2 border-solid rounded-md z-40'
                      onClick={handlePrevImage}
                    >
                      <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
                    </button>
                    <button
                      className='absolute top-1/2 right-8 p-3 text-white hover:text-primary border-2 border-solid rounded-md z-40'
                      onClick={handleNextImage}
                    >
                      <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
                    </button>
                    <div className='flex w-full px-28 max-md:px-20 items-center justify-between text-white'>
                      <div
                        className='flex items-center gap-2 cursor-pointer'
                        onClick={closeImageModal}
                      >
                        <CloseIcon data-testid='close' style={{ fontSize: '1.5rem' }} />
                        <span className='text-lg max-md:text-base'>Close</span>
                      </div>
                      <div
                        className='flex items-center gap-2'
                        onClick={() => handelPhoto(celebrityImages)}
                      >
                        <p className='text-lg max-md:text-base text-primary'>
                          {index + 1} Of {celebrityImages.length}
                        </p>
                        <ViewCompactIcon style={{ fontSize: '2rem', color: 'white' }} />
                      </div>
                    </div>
                    <div
                      style={{
                        width:
                          currentImage?.width >= 1000
                            ? currentImage?.width / 2
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

                {index < 8 && celebrityImages?.slice(0, 8).length - 1 === index && (
                  <span className='flex items-center justify-center absolute top-0 left-0 w-full h-full text-lg text-white font-medium bg-overlay-60 z-10'>
                    + {celebrityImages?.slice(8)?.length}
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
        <div className='max-lg:hidden flex flex-1 flex-col gap-4 max-md:gap-3'>
          <h1 className='text-3xl max-md:text-2xl font-semibold pl-3 border-l-4 border-primary'>
            More to explore
          </h1>
          <div className='flex flex-col gap-3 p-4 border-2 border-gray-250 rounded-sm'>
            <h2 className='text-2xl max-md:text-xl font-medium'>Feedback</h2>
            <p className='text-secondary hover:underline cursor-pointer'>
              Tell us what you think about this feature.
            </p>
            <p className='text-secondary hover:underline cursor-pointer'>Report this list.</p>
          </div>
        </div>
      </div>
      <div className='container pt-10 max-md:p-6'>
        <h1 className='text-4xl max-md:text-2xl font-semibold pl-3 border-l-4 border-primary'>
          Known For
        </h1>
      </div>
      <div className='container flex gap-6 max-md:gap-4 bg-white'>
        <div className='flex flex-3 flex-col gap-10 p-6 max-md:gap-6 max-md:p-5 mt-4 border-2 border-gray-100 shadow-md'>
          {celebrityInfo?.known_for?.map((m, index) => (
            <div className='flex flex-1 flex-col gap-2 cursor-pointer' key={index}>
              <div className='flex items-center'>
                <div className='flex flex-1  flex-row items-center gap-3 max-md:gap-2'>
                  <div className='group relative w-24 h-32 max-md:w-20 max-md:h-28 max-lg:w-32 max-lg:h-48 overflow-hidden rounded-xl cursor-pointer'>
                    <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                    <AddIcon className='absolute top-0 left-0 bg-black-transparent text-white' />
                    <LazyLoadImage
                      src={getImageUrl(m?.poster_path, 'w154')}
                      loading='lazy'
                      alt='poster'
                      className='object-cover w-full h-full'
                    />
                  </div>
                  <div className={`flex flex-2 flex-col gap-2 p-2 w-full text-sm`}>
                    <h1 className='flex-2 text-lg max-md:text-base max-lg:text-2xl font-bold'>
                      {m?.title || m?.name}
                    </h1>
                    <div className='flex-1 text-black-100 max-lg:text-xl'>
                      <span>{m?.release_date || m.first_air_date}</span>
                    </div>
                    <div className='flex text-black-100 max-md:tex-sm max-lg:text-xl'>
                      <StarIcon className='text-primary' />
                      <p className='flex-1'>
                        {Number(m?.vote_average ?? 0).toFixed(2)}
                        <span className='flex-1 pl-2 text-gray font-semibold'>
                          {m?.vote_count?.toString().length > 3
                            ? '(' + m?.vote_count?.toString().slice(0, 1) + 'K)'
                            : '(' + m?.vote_count + ')'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <ErrorOutlineIcon className='text-secondary' />
              </div>
              <p className='font-semibold text-sm max-lg:text-lg'>{m?.overview}</p>

              <div className='flex items-center gap-5 text-base max-md:gap-3 max-md:text-sm max-lg:text-xl font-medium'>
                {hasDirector(sortedCast, index) && (
                  <div key={index} className='flex gap-3'>
                    <span>Director</span>
                    <span className='text-secondary'>
                      {sortedCast[index]?.crew?.map((c: Crew) => getDirectorName(c))}
                    </span>
                  </div>
                )}

                <div className='flex gap-3 max-md:gap-2'>
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
        <div className='max-lg:hidden flex flex-1 flex-col gap-4'>
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
      <div className='container flex gap-6 pt-20 pb-10 max-md:gap-4 max-md:pt-14 px-14 max-md:pb-6 bg-white'>
        <div className='flex flex-col gap-4 flex-3 max-md:gap-3 max-md:flex-2'>
          <div
            className='group/icon flex items-center gap-2 w-fit text-4xl font-semibold pl-3 border-l-4 border-primary cursor-pointer'
            onClick={() => handelVideoMedia(trailers)}
          >
            <h1>Videos</h1>
            <ArrowForwardIosIcon className='group-hover/icon:text-primary' />
            <span className='text-gray-350 text-lg max-md:text-base'>{trailers?.length}</span>
          </div>
          <div className='flex flex-wrap max-md:justify-center items-center gap-6 max-md:gap-4'>
            {trailers?.map((v, index) => (
              <div
                key={index}
                className='group/trailer relative h-64 max-md:h-52 rounded-lg cursor-pointer overflow-hidden'
                style={{ width: '27rem' }}
                onClick={(): void => handleVideo(v)}
              >
                <span className='group-hover/trailer:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                <div className='flex items-end gap-3 absolute top-0 left-0 w-full h-full p-4 bg-overlay z-20'>
                  <PlayCircleOutlineIcon style={{ fontSize: '4.5rem', color: 'white' }} />
                  <div className='flex flex-col gap-1'>
                    <span className='text-white text-3xl max-md:text-xl'>Play Trailer</span>
                    <span className='text-gray-200 text-xl max-md:text-lg'>
                      {trailers[0]?.name}
                    </span>
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
        <div className='max-lg:hidden flex flex-1 flex-col gap-4'>
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
