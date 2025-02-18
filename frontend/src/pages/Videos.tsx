import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/client';
import { Genre, Media, Trailer } from '../types/media';
import { GET_GENRES, GET_MOVIE_TRAILER, GET_TV_TRAILER } from '../graphql/queries';
import { debounce } from 'lodash';
import ReactPlayer from 'react-player';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import getImageUrl from '../utils/getImages';
import { LazyLoadImage } from 'react-lazy-load-image-component';

// Lazy load the components
const Navbar = React.lazy(() => import('../components/Navbar'));
const Lists = React.lazy(() => import('../components/Lists'));

// YouTube video URL
const YOUTUBE_URL: string = 'https://www.youtube.com/watch?v=';

const Videos = () => {
  const location = useLocation();

  // Values from location state
  const state = location?.state;
  const data: Media = state.data;
  const trending: Media[] = state.trending;
  const videoID: string = state.videoID;
  const videoName: string = state.name;
  const videos: Trailer[] = state.related;

  // States
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);
  const [videoData, setVideoData] = useState<Media | null>(() => {
    try {
      const savedData = localStorage.getItem('video');
      return savedData ? JSON.parse(savedData) : null;
    } catch {
      return null;
    }
  });

  const [genres, setGenres] = useState<string[]>([]);
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(true);

  // Update localStorage whenever `data` changes
  useEffect(() => {
    if (data) {
      localStorage.setItem('video', JSON.stringify(data));
      setVideoData(data);
    }
  }, [data]);

  // GraphQL queries
  const {
    data: genresData,
    loading: genresLoading,
    error: genresError,
  } = useQuery(GET_GENRES, {
    fetchPolicy: 'cache-first',
  });

  const [getMovieTrailer] = useLazyQuery(GET_MOVIE_TRAILER);
  const [GetTVTrailer] = useLazyQuery(GET_TV_TRAILER);

  const movieGenres: Genre[] = genresData?.movieGenres || [];
  const tvGenres: Genre[] = genresData?.tvGenres || [];
  const [movieTrailer, setMovieTrailer] = useState<Trailer[]>([]);
  const [tvTrailer, setTvTrailer] = useState<Trailer[]>([]);

  // Responsive container
  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch media videos funtions with memoized debounced functions
  const fetchMovieTrailer = useCallback(
    (id: number) =>
      new Promise<any>((resolve, reject) => {
        debounce(async () => {
          try {
            const response = await getMovieTrailer({ variables: { id } });
            resolve(response.data); // Resolve with response data
          } catch (err) {
            reject(err); // Reject on error
          }
        }, 300)();
      }),
    [getMovieTrailer]
  );

  const fetchTvTrailer = useCallback(
    (id: number) =>
      new Promise<any>((resolve, reject) => {
        debounce(async () => {
          try {
            const response = await GetTVTrailer({ variables: { id } });
            resolve(response.data); // Resolve with response data
          } catch (err) {
            reject(err); // Reject on error
          }
        }, 300)();
      }),
    [GetTVTrailer]
  );

  // Fetch genres and trailers based on media type
  useEffect(() => {
    const targetData = data || videoData;
    if (!targetData) return;

    const mediaType = targetData.media_type || targetData.__typename?.slice(0.5).toLowerCase();

    const genreList = mediaType === 'movie' ? movieGenres : tvGenres;
    const genreNames = genreList
      .filter((genre) => targetData.genre_ids.includes(genre.id))
      .map((genre) => genre.name);

    if (JSON.stringify(genreNames) !== JSON.stringify(genres)) {
      setGenres(genreNames);
    }

    const fetchTrailer = mediaType === 'movie' ? fetchMovieTrailer : fetchTvTrailer;

    if (fetchTrailer && targetData.id) {
      setLoadingTrailer(true);
      fetchTrailer(targetData.id)
        .then((response) => {
          if (mediaType === 'movie') {
            setMovieTrailer(response?.movieVideos);
            setTvTrailer([]);
          } else {
            setTvTrailer(response?.tvVideos);
            setMovieTrailer([]);
          }
        })
        .catch((error) => {
          console.error('Error fetching trailer:', error);
        })
        .finally(() => {
          setLoadingTrailer(false);
        });
    }
  }, [data, videoData, movieGenres, tvGenres, genres, fetchMovieTrailer, fetchTvTrailer]);

  // Set the selected trailer
  useEffect(() => {
    const allTrailers = movieTrailer.length > 0 ? movieTrailer : tvTrailer;
    const foundTrailer = allTrailers.find((trailer) => trailer.type === 'Trailer');

    if (foundTrailer) {
      setTrailer(foundTrailer);
    }
  }, [movieTrailer, tvTrailer]);

  // Render loading or error state
  if (genresLoading)
    return (
      <div className='animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100'></div>
    );
  if (genresError) return <div className='text-black text-sm'>Error: {genresError?.message}</div>;

  return (
    <div className='bg-black min-h-screen'>
      <Navbar />
      <div
        className='container flex gap-2 pt-8 mb-10 text-white'
        style={{ height: containerWidth >= 1024 ? '85vh' : '50vh' }}
      >
        <div className='group relative flex-2 mb-4 rounded-2xl overflow-hidden'>
          <Link
            to={'/'}
            className='absolute left-3 top-3 p-3 bg-black-100 rounded-full z-30  opacity-0 group-hover:opacity-100 transition-opacity'
          >
            <CloseIcon style={{ fontSize: '2rem' }} />
          </Link>
          <ReactPlayer
            url={`${YOUTUBE_URL}${videoID ? videoID : trailer?.key}`}
            width={'100%'}
            height={'100%'}
            controls={true}
            playing={false}
          />
        </div>
        <div className='max-lg:hidden flex-1 flex flex-col gap-6 p-5 mb-4 bg-black-100 rounded-2xl'>
          <div className='relative flex gap-2 pb-6 border-b-2 border-gray-300'>
            <div className='group relative w-24 h-36 overflow-hidden rounded-xl cursor-pointer'>
              <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
              <AddIcon
                className='absolute top-0 left-0 bg-black-transparent '
                style={{ fontSize: '1.5rem' }}
              />
              <LazyLoadImage
                src={getImageUrl(data?.poster_path || videoData?.poster_path, 'w154')}
                loading='lazy'
                alt={
                  data?.media_type === 'movie' || (videoData && videoData?.media_type === 'movie')
                    ? 'Movie Poster'
                    : 'TV Show Poster'
                }
                className='object-cover w-full h-full'
              />
            </div>
            <div className='flex flex-col gap-2 font-semibold'>
              <h2>
                {data?.media_type === 'movie' || (videoData && videoData?.media_type === 'movie')
                  ? data?.title || videoData?.title
                  : data?.name || videoData?.name}
              </h2>
              <div className='flex flex-wrap items-center gap-2 text-sm text-gray-250'>
                {genres.map((g: string, index: number) => (
                  <p key={index}>{g}</p>
                ))}
              </div>
            </div>
            <KeyboardArrowRightIcon className='absolute right-3 top-0' />
          </div>
          <div>
            <h1 className='text-2xl font-bold mb-2'>{trailer?.name || videoName}</h1>
            {<p className='text-gray-200'>{data?.overview || videoData?.overview}</p>}
          </div>
        </div>
      </div>
      {!videoName ? (
        <>
          {trending && <Lists title={'Featured Videos'} data={trending} />}
          {!loadingTrailer && (movieTrailer.length !== 0 || tvTrailer.length !== 0) && (
            <Lists
              title='Related Videos'
              data={trending}
              relatedVideos={movieTrailer.length !== 0 ? movieTrailer : tvTrailer}
              poster={data?.backdrop_path || videoData?.backdrop_path}
            />
          )}
        </>
      ) : (
        <Lists title={'Related Videos'} relatedVideos={videos} poster={data.backdrop_path} />
      )}
    </div>
  );
};

export default Videos;
