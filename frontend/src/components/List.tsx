import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ListIcon from '@mui/icons-material/List';
import { DocumentNode, gql, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Info {
  name?: string;
  title?: string;
  id: number;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  popularity: number;
  media_type: string;
  genre_ids: number[];
  first_air_date?: string;
}

type Listprops = {
  title: String;
  videoID?: String;
  poster?: string;
  info?: Info;
  trending?: Info[] | any[];
  query?: DocumentNode;
  containerRef: React.RefObject<HTMLDivElement>;
  heightRef: React.RefObject<HTMLDivElement>;
  setWidth: React.Dispatch<React.SetStateAction<number>>;
  setHeight: React.Dispatch<React.SetStateAction<number>>;
};

type Upcomings = {
  title: string;
  id: number;
  overview: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  popularity: number;
};

type PopularMovies = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  popularity: number;
  genre_ids: number[];
};

type TvAirings = {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  first_air_date: string;
};

type TvPopular = {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  first_air_date: string;
};

const List: React.FC<Listprops> = ({
  title,
  query,
  containerRef,
  heightRef,
  setWidth,
  setHeight,
  info,
  trending,
  videoID,
  poster,
}) => {
  const { loading, error, data } = useQuery(
    query ??
      gql`
        query {
          __typename
        }
      `,
    { skip: !query }
  );
  const upcomings: Upcomings[] = data?.upcomingMovies;
  const popularMovies: PopularMovies[] = data?.popularMovies;
  const tvAirings: TvAirings[] = data?.tvAiring;
  const tvPopular: TvPopular[] = data?.tvPopular;
  const TMDB_URL: string = 'https://image.tmdb.org/t/p/original';
  const navigate = useNavigate();
  let imageURL: any;

  //Get The Image For each List
  if (upcomings) {
    imageURL = TMDB_URL + upcomings[0]?.backdrop_path;
  } else if (tvAirings) {
    imageURL = TMDB_URL + tvAirings[2]?.backdrop_path;
  } else if (tvPopular) {
    imageURL = TMDB_URL + tvPopular[1]?.backdrop_path;
  } else if (popularMovies) {
    imageURL = TMDB_URL + popularMovies[1]?.backdrop_path;
  } else if (poster) {
    imageURL = TMDB_URL + poster;
  }

  const handleResize = (): void => {
    if (heightRef.current) {
      setHeight(heightRef.current.getBoundingClientRect().height);
    }
  };

  //Get the feature container width and height when the app is mount or window gets resized
  useEffect(() => {
    if (
      (upcomings || popularMovies || tvAirings || tvPopular || info || poster) &&
      containerRef.current &&
      heightRef.current
    ) {
      window.addEventListener('resize', handleResize);
      setWidth(containerRef.current.getBoundingClientRect().width);
      setHeight(heightRef.current.getBoundingClientRect().height);
    }
    return (): void => window.removeEventListener('resize', handleResize);
  }, [upcomings, popularMovies, tvAirings, tvPopular, info, poster]);

  const handleTrailer = (): void => {
    navigate('/videos', { state: { data: info, trending: trending, videoID: videoID } });
    window.scrollTo({ top: 0 });
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-white">Error: {error.message}</p>;

  return (
    <div
      ref={containerRef}
      className="pl-4 cursor-pointer"
      style={{ flex: '0 0 33%' }}
      onClick={handleTrailer}
    >
      <div className="group/icon relative mb-3 rounded-2xl overflow-hidden" ref={heightRef}>
        <span className="group-hover/icon:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20"></span>
        <img
          src={imageURL || TMDB_URL + info?.backdrop_path}
          alt="List Image"
          loading="lazy"
          className="object-cover w-full h-full"
        />
        {info || videoID ? (
          <PlayCircleOutlineIcon
            className="absolute left-1 bottom-1 text-white group-hover/icon:text-primary"
            style={{ fontSize: '2rem' }}
          />
        ) : (
          <ListIcon
            className="absolute left-1 bottom-1 text-white group-hover/icon:text-primary"
            style={{ fontSize: '2rem' }}
          />
        )}
      </div>
      <div>
        <h1 className="text-2xl text-white mb-3 hover:underline">{title}</h1>
        {info && <p className="text-gray-300">{info.overview?.slice(0, 90)}...</p>}
      </div>
    </div>
  );
};

export default List;
