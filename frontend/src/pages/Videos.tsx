import { useLazyQuery, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Lists from '../components/Lists';
import { Genre, Media, Trailer } from '../types/media';
import {
  GET_MOVIE_GENRES,
  GET_MOVIE_TRAILER,
  GET_TV_GENRES,
  GET_TV_TRAILER,
} from '../graphql/queries';

const Videos = () => {
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
  const [
    getMovieTrailer,
    { loading: movieTrailerLoading, error: movieTrailerError, data: movieTrailerData },
  ] = useLazyQuery(GET_MOVIE_TRAILER);
  const [getTvTrailer, { loading: tvTrailerLoading, error: tvTrailerError, data: tvTrailerData }] =
    useLazyQuery(GET_TV_TRAILER);
  const movieGenres: Genre[] = movieGenresData?.movieGenres;
  const tvGenres: Genre[] = tvGenresData?.tvGenres;
  const movieTrailer: Trailer[] = movieTrailerData?.movieVideos;
  const tvTrailer: Trailer[] = tvTrailerData?.tvVideos;
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const YOUTUBE_URL: string = 'https://www.youtube.com/watch?v=';
  const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';
  const location = useLocation();
  const data: Media = location.state.data;
  const trending: Media[] = location.state.trending;
  const videoID: string = location.state.videoID;
  const videoName: string = location.state.name;
  const videos: Trailer[] = location.state.related;

  const navigate = useNavigate();
  const [videoData, _setVideoData] = useState<Media | null>((): Media | null => {
    const savedData: Media | string = localStorage.getItem('video') ?? '';
    return savedData ? JSON.parse(savedData) : null;
  });

  useEffect(() => {
    if (data) {
      localStorage.setItem('video', JSON.stringify(data));
    }
  }, [data]);

  //Get media genre from genre IDs
  const getGenras = (mediaType: string, array: number[]): string[] => {
    for (let i = 0; i < array.length; i++) {
      if (mediaType === 'movie') {
        movieGenres?.map((g) =>
          g.id === array[i] ? setGenres((prev) => [...prev, g.name]) : null
        );
      } else if (mediaType === 'tv') {
        tvGenres?.map((g) => (g.id === array[i] ? setGenres((prev) => [...prev, g.name]) : null));
      }
    }
    return genres;
  };

  useEffect(() => {
    if (data) {
      getGenras(data?.media_type, data?.genre_ids || videoData?.genre_ids);
    } else if (videoData) {
      getGenras(videoData?.media_type, videoData?.genre_ids || videoData?.genre_ids);
    }
  }, [data, videoData]);

  //Get Media videos for movie or tv show
  const handleTrailer = (mediaType: string, id: number): void => {
    if (mediaType === 'movie') {
      getMovieTrailer({ variables: { id: id } });
    } else if (mediaType === 'tv') {
      getTvTrailer({ variables: { id: id } });
    }
  };

  useEffect(() => {
    if (data) {
      handleTrailer(data?.media_type, data?.id);
    } else if (videoData) {
      handleTrailer(videoData?.media_type, videoData?.id);
    }
    (movieTrailer || tvTrailer)?.forEach(
      (t) => t.type === 'Trailer' && setTrailer({ key: t.key, name: t.name, type: t.type })
    );
  }, [data, videoData, movieTrailer, tvTrailer]);

  const handleVideo = (videoData: Trailer): void => {
    navigate('/videos', {
      state: { videoID: videoData?.key, name: videoData?.name, related: videos },
    });
  };

  if (movieTrailerLoading) return <p className='text-white'>Movie Trailer Loading...</p>;
  if (movieTrailerError) return <p className='text-white'>Error: {movieTrailerError.message}</p>;
  if (tvTrailerLoading) return <p className='text-white'>TV Trailer Loading...</p>;
  if (tvTrailerError) return <p className='text-white'>Error: {tvTrailerError.message}</p>;
  if (movieGenresLoading) return <p className='text-white'>Movie Geres Loading...</p>;
  if (movieGenresError) return <p className='text-white'>Error: {movieGenresError.message}</p>;
  if (tvGenresLoading) return <p className='text-white'>TV Genres Loading...</p>;
  if (tvGenresError) return <p className='text-white'>Error: {tvGenresError.message}</p>;
  return (
    <div className='bg-black'>
      <Navbar />
      <div className='container flex gap-2 pt-8 mb-10 text-white' style={{ height: '85vh' }}>
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
            playing={true}
          />
        </div>
        <div className='flex-1 flex flex-col gap-6 p-5 mb-4 bg-black-100 rounded-2xl'>
          {!videoName && (
            <div className='relative flex gap-2 pb-6 border-b-2 border-gray-300'>
              <div className='group relative w-24 h-36 overflow-hidden rounded-xl cursor-pointer'>
                <span className='group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20'></span>
                <AddIcon
                  className='absolute top-0 left-0 bg-black-transparent '
                  style={{ fontSize: '1.5rem' }}
                />
                <img
                  src={TMDB_URL + (data?.poster_path || videoData?.poster_path)}
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
          )}
          <div>
            <h1 className='text-2xl font-bold mb-2'>{trailer?.name || videoName}</h1>
            {!videoName && <p className='text-gray-200'>{data?.overview || videoData?.overview}</p>}
          </div>
        </div>
      </div>
      {!videoName && (
        <>
          <Lists title={'Featured Videos'} data={trending} />
          <Lists
            title={'Related Videos'}
            relatedVideos={movieTrailer ?? tvTrailer}
            poster={data?.backdrop_path ?? videoData?.backdrop_path}
          />
        </>
      )}
      {videoName && (
        <div className='container flex flex-col gap-4 pb-10'>
          <div className='group/icon flex items-center gap-2 w-fit text-white text-4xl font-semibold pl-3 border-l-4 border-primary cursor-pointer'>
            <h1>Videos</h1>
            <ArrowForwardIosIcon className='group-hover/icon:text-primary text-white' />
            <span className='text-white text-lg'>{videos?.length}</span>
          </div>
          <div className='flex flex-wrap gap-6'>
            {videos?.map((v) => (
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
                    <span className='text-gray-200 text-xl'>{videos[0]?.name}</span>
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
      )}
    </div>
  );
};

export default Videos;
