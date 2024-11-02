import { useRef, useState } from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import List from './List';
import { Media, Trailer } from '../types/media';

type ListsProps = {
  title: String;
  poster?: string;
  listFor?: string;
  data?: Media[];
  relatedVideos?: Trailer[];
};

const titles: string[] = ['Upcomings Movies', 'Popular Movies', 'TV Airings', 'Popular TV'];

const Lists: React.FC<ListsProps> = ({ title, data, relatedVideos, poster, listFor }) => {
  const [index, setIndex] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLDivElement>(null);

  const handleRight = (dataArray: Media[] | Trailer[] | string | undefined): void => {
    dataArray && setIndex((prev) => (prev !== dataArray.length - 1 ? prev + 1 : 0));
  };

  const handleLeft = (dataArray: Media[] | Trailer[] | string | undefined): void => {
    dataArray && setIndex((prev) => (prev !== 0 ? prev - 1 : dataArray.length - 1));
  };

  return (
    <div className='container pb-6'>
      <h1 className='text-3xl text-primary pl-5 mb-6'>{title}</h1>
      <div className='group relative overflow-hidden'>
        <button
          className='absolute top-1/2 left-3 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block'
          style={{ top: `${height / 2}px`, transform: 'translateY(-50%)' }}
          onClick={() => handleLeft(listFor || data || relatedVideos)}
        >
          <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <button
          className='absolute top-1/2 right-3 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block'
          style={{ top: `${height / 2}px`, transform: 'translateY(-50%)' }}
          onClick={() => handleRight(listFor || data || relatedVideos)}
        >
          <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
        </button>
        <div
          className='flex gap-1 transition-transform duration-500'
          style={{
            transform: `translateX(${-(width * index + 4 * (index + 1))}px)`,
          }}
        >
          {listFor &&
            titles.map((t: string, index: number) => (
              <List
                key={index}
                setWidth={setWidth}
                setHeight={setHeight}
                containerRef={containerRef}
                heightRef={heightRef}
                title={t}
                listFor={listFor}
              />
            ))}
          {data &&
            data?.map((e: any) => (
              <List
                key={e.id}
                setWidth={setWidth}
                setHeight={setHeight}
                containerRef={containerRef}
                heightRef={heightRef}
                title={e.title || e.name}
                info={e}
                trending={data}
              />
            ))}
          {relatedVideos &&
            relatedVideos.map((e: any, index: number) => (
              <List
                key={index}
                setWidth={setWidth}
                setHeight={setHeight}
                containerRef={containerRef}
                heightRef={heightRef}
                title={e.name}
                videoID={e.key}
                trending={data}
                poster={poster}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Lists;
