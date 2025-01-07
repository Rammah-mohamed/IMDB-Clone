import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Episode, Photo, Season_Details, Trailer } from '../types/media';
import ReactPlayer from 'react-player';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';

// Lazy load the components
const Navbar = React.lazy(() => import('../components/Navbar'));
// active seasontype
type Active = {
  season: number;
  year: number | null;
};

// Menu text
const seasonMenu = ['Seasons', 'Years', 'Top-rated'];

// TMDB API image / YouTube video URLs
const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=';

const Media = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Values from location state
  const state = location?.state;
  const photos: Photo[] = state.photos;
  const videos: Trailer[] = state.videos;
  const celebrityName: string = state.name;
  const celebrityImage: Photo = state.celebrityImage;
  const mediaName: string = state.mediaName;
  const mediaImage: string = state.mediaImage;
  const poster: string = state.poster;
  const season: Season_Details[] = state.season;
  const episodes: Episode[] = state.episodes;
  const topRatedEpisodes: Episode[] = state.topRatedEpisodes;

  // Initialize state hooks
  const [show, setShow] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [currentSeason, setCurrentSeason] = useState<Season_Details>();
  const [currentYearEpisodes, setCurrentYearEpisodes] = useState<Episode[]>([]);
  const [active, setActive] = useState<string>('Seasons');
  const [Years, setYears] = useState<number[]>([]);
  const [currentActive, setCurrentActive] = useState<Active>({
    season: 1,
    year: null,
  });

  // Handle current season
  const handleCurrentSeason = (seasonNumber: number) => {
    const selectedSeason = season?.find((s) => s.season_number === seasonNumber);
    if (selectedSeason) {
      setCurrentActive((prev) => ({ ...prev, season: seasonNumber }));
      setCurrentSeason(selectedSeason);
    }
  };

  useEffect(() => {
    if (!season || season?.length === 0 || !currentActive?.season) return;
    handleCurrentSeason(currentActive?.season);
  }, [currentActive.season, season]);

  // Handle current Year
  const handleCurrentYear = (yearNumber: number) => {
    const filteredEpisodes = episodes
      .filter((s) => new Date(s.air_date).getFullYear() === yearNumber)
      .sort((a, b) => +a.episode_number - +b.episode_number);

    setCurrentActive((prev) => ({ ...prev, year: yearNumber }));
    setCurrentYearEpisodes(filteredEpisodes);
  };

  // Set the first year as default
  useEffect(() => {
    if (!season || season?.length === 0 || Years.length === 0) return;

    const selectedYear = Years[0];
    const filteredEpisodes = episodes
      .filter((s) => new Date(s.air_date).getFullYear() === selectedYear)
      .sort((a, b) => +a.episode_number - +b.episode_number);

    setCurrentActive((prev) => ({ ...prev, year: selectedYear }));
    setCurrentYearEpisodes(filteredEpisodes);
  }, [Years, season, episodes]);

  // Check for duplicate years and then set the unique years
  useEffect(() => {
    if (!season) return;
    const newYears = season?.reduce((acc, s) => {
      const year = new Date(s.air_date).getFullYear();
      if (!acc.includes(year)) {
        acc.push(year);
      }
      return acc;
    }, [] as number[]);

    setYears((prev) => [...new Set([...prev, ...newYears])]);
  }, [season]);

  const handleVideo = (videoData: Trailer): void => {
    navigate('/videos', {
      state: { videoID: videoData?.key, name: videoData?.name, related: videos },
    });
  };

  // Handle current image
  const currentImage = currentIndex === null ? null : photos[currentIndex];

  const handleShow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShow(false);
    setCurrentIndex(null);
  };

  const handleClickImage = (index: number) => {
    setShow(true);
    setCurrentIndex(index);
  };

  // Handle navigation to next / previous image
  function handleNext(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => {
      if (prevIndex === null) return 0;
      return prevIndex === photos.length - 1 ? 0 : prevIndex + 1;
    });
  }

  function handlePrev(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => {
      if (prevIndex === null) return photos.length - 1;
      return prevIndex === 0 ? photos.length - 1 : prevIndex - 1;
    });
  }

  return (
    <div>
      <Navbar />
      <div className='flex flex-col gap-3'>
        <div className='container flex flex-col gap-4 bg-gray-400 py-10'>
          <div className='flex gap-1 items-center text-white'>
            <ArrowBackIosIcon />
            <span>Back</span>
          </div>
          <div className='flex gap-3'>
            <div className='w-28 h-44 rounded-lg overflow-hidden'>
              <img
                src={
                  TMDB_URL +
                  (poster
                    ? poster
                    : photos
                    ? photos[0]?.file_path
                    : celebrityImage?.file_path || mediaImage)
                }
                loading='lazy'
                alt='Celebrity Image'
                className='object-cover w-full h-full'
              />
            </div>
            <div className='flex flex-col gap-2 self-end'>
              <span className='text-xl text-gray-250 font-medium'>
                {celebrityName || mediaName}
              </span>
              <span className='text-6xl text-white font-semibold'>
                {(videos && 'Videos') || (season && 'Episode list') || 'Photos'}
              </span>
            </div>
          </div>
        </div>
        <div className={`container flex ${season ? 'flex-col' : 'flex-row'} gap-6 py-10 bg-white`}>
          {!season ||
            (season?.length !== 0 && (
              <>
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
                          <span
                            className=' text-gray-350 font-medium'
                            style={{ fontSize: '0.8rem' }}
                          >
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
                        <span className='text-gray-350'>
                          {Number(e.vote_average).toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='flex flex-col gap-3'>
                  <ul className='flex items-center gap-3 bg-gray-200 text-black font-medium'>
                    {seasonMenu.map((m, index: number) => (
                      <li
                        key={index}
                        className={`p-4 ${
                          m === active && 'border-b-secondary border-4'
                        } cursor-pointer transition-all duration-100 ease-in`}
                        onClick={() => setActive(m)}
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                  <ul className='flex items-center gap-2 text-black'>
                    {active === 'Seasons'
                      ? season?.map((s) => (
                          <span
                            key={s.id}
                            className={`flex items-center justify-center w-11 h-11 ${
                              s.season_number === currentActive.season
                                ? 'bg-primary'
                                : 'bg-gray-250'
                            } rounded-full cursor-pointer`}
                            onClick={() => handleCurrentSeason(s.season_number)}
                          >
                            {s.season_number}
                          </span>
                        ))
                      : active === 'Years' &&
                        Years?.map((y, index) => (
                          <span
                            key={index}
                            className={`flex items-center justify-center w-11 h-11 ${
                              y === currentActive.year ? 'bg-primary' : 'bg-gray-250'
                            } rounded-full cursor-pointer`}
                            onClick={() => handleCurrentYear(y)}
                          >
                            {y}
                          </span>
                        ))}
                  </ul>
                </div>
                <div className='flex flex-col gap-6 bg-white'>
                  {(active === 'Seasons'
                    ? currentSeason?.episodes
                    : active === 'Years'
                    ? currentYearEpisodes
                    : topRatedEpisodes.slice(0, 10)
                  )?.map((e) => (
                    <div key={e.id} className='flex gap-4'>
                      <div className='flex-1 w-60 h-32 rounded-lg rounded-tl-none overflow-hidden'>
                        <img
                          src={TMDB_URL + e.still_path}
                          loading='lazy'
                          alt='episode poster'
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <div className='flex flex-3 flex-col gap-1'>
                        <div className='flex flex-col gap-3'>
                          {Number(e.vote_average) >= 8.0 && (
                            <span
                              className='text-black  uppercase font-medium bg-primary pl-2 w-2/5 rounded'
                              style={{ fontSize: '0.8rem' }}
                            >
                              Top-rated
                            </span>
                          )}
                        </div>
                        <div className='flex items-center justify-between'>
                          <h1 className='text-base font-bold mb-1 w-fit hover:text-gray-300 cursor-pointer'>
                            S{e?.season_number}.E{e?.episode_number} - {e.name}
                          </h1>
                          <span className='text-gray-300'>{e?.air_date}</span>
                        </div>
                        <p className='text-gray-350'>{e.overview}</p>
                        <div className='flex items-center gap-2'>
                          <StarIcon className='text-primary' />
                          <span className='text-gray-350'>
                            {Number(e.vote_average).toFixed(1)}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ))}

          <div className='flex flex-3 flex-wrap gap-2 '>
            {photos &&
              photos?.map((p: Photo, index: number) => (
                <div
                  key={index}
                  className='group relative w-52 h-64 rounded-lg cursor-pointer overflow-hidden'
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
                            {index + 1} Of {photos.length}
                          </p>
                          <ViewCompactIcon style={{ fontSize: '2rem', color: 'white' }} />
                        </div>
                      </div>
                      <div
                        style={{
                          width:
                            currentImage?.width >= 900
                              ? currentImage?.width / 4
                              : currentImage?.width,
                          height: '85vh',
                        }}
                      >
                        <img
                          src={TMDB_URL + currentImage?.file_path}
                          loading='lazy'
                          alt='Celebrity Image'
                          className='object-cover w-full h-full'
                        />
                      </div>
                    </div>
                  )}
                  <img
                    src={TMDB_URL + p?.file_path}
                    loading='lazy'
                    alt='Celebrity Image'
                    className='object-cover w-full h-full'
                  />
                </div>
              ))}
            {videos &&
              videos?.map((v) => (
                <div
                  key={v?.key}
                  className='group/trailer relative h-64 rounded-lg cursor-pointer overflow-hidden'
                  style={{ width: '27rem' }}
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

export default Media;
