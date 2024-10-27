import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { GET_POPULAR_PEOPLE } from '../graphql/queries';
import { useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';

interface Movie {
  id: number;
  name: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  popularity: number;
  vote_average: string;
  vote_count: string;
  release_date: string;
  genre_ids: number[];
  media_type: string;
  first_air_date: string;
}

type People = {
  name: string;
  id: number;
  gender: number;
  biography: string;
  birthday: string;
  deathday: string;
  profile_path: string;
  popularity: number;
  place_of_birth: string;
  known_for_department: string;
  known_for: Movie;
};

const PopularPeople = () => {
  const [index, setIndex] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const widthRef = useRef<HTMLDivElement>(null);
  const {
    loading: peopleLoading,
    error: peopleError,
    data: peopleData,
  } = useQuery(GET_POPULAR_PEOPLE);
  const popularPeople: People[] = peopleData?.popularPeople;
  const TMDB_URL: String = 'https://image.tmdb.org/t/p/original';

  const handleRight = (peopele: any[]): void => {
    setIndex((prev) => (prev !== peopele.length - 1 ? prev + 1 : 0));
  };

  const handleLeft = (peopele: any[]): void => {
    setIndex((prev) => (prev !== 0 ? prev - 1 : peopele.length - 1));
  };

  const handleResize = (): void => {
    if (widthRef.current) {
      setWidth(widthRef.current.getBoundingClientRect().width);
    }
  };

  useEffect(() => {
    if (widthRef.current && popularPeople) {
      setWidth(widthRef.current.getBoundingClientRect().width);
      window.addEventListener('resize', handleResize);
    }

    return (): void => window.removeEventListener('resize', handleResize);
  }, [popularPeople]);

  if (peopleLoading) return <p className="text-white">Trending Loading...</p>;
  if (peopleError) return <p className="text-white">Error: {peopleError.message}</p>;
  return (
    <div className="container py-8">
      <div className="group flex items-center gap-2 text-2xl text-white p-3 mb-4 border-l-4 border-primary cursor-pointer">
        <h1>Most popular celebrities</h1>
        <ArrowForwardIosIcon className="group-hover:text-primary" />
      </div>
      <div className="group relative p-4 overflow-hidden">
        <button
          className="absolute top-1/2 left-3 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block"
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => handleLeft(popularPeople)}
        >
          <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <button
          className="absolute top-1/2 right-3 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block"
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => handleRight(popularPeople)}
        >
          <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <div
          className="flex items-center gap-4 transition-transform duration-500 cursor-pointer"
          style={{ transform: `translateX(${-(width * index + 16 * (index + 1))}px` }}
        >
          {popularPeople.map((p) => (
            <div className="group/icon relative flex flex-col gap-2" key={p.id} ref={widthRef}>
              <span className="group-hover/icon:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20"></span>
              <div className="w-44 h-44">
                <img
                  src={TMDB_URL + p.profile_path}
                  alt="Person Image"
                  className="object-cover w-full h-full rounded-full"
                />
              </div>
              <h1 className=" text-white text-xl text-center font-semibold">{p.name}</h1>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularPeople;
