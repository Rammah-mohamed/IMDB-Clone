import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Media, Trailer } from '../types/media';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Lazy load component
const List = React.lazy(() => import('./List'));

// Type for Lists props
type ListsProps = {
  title: string;
  poster?: string;
  listFor?: string;
  data?: Media[];
  relatedVideos?: Trailer[];
};

// List titles
const titles: string[] = ['Upcoming Movies', 'Popular Movies', 'TV Airings', 'Popular TV'];

// Type Guard for Media
const isMedia = (item: string | Media | Trailer): item is Media => {
  return (item as Media).id !== undefined;
};

// Type Guard for Trailer
const isTrailer = (item: string | Media | Trailer): item is Trailer => {
  return (item as Trailer).key !== undefined;
};

const Lists: React.FC<ListsProps> = React.memo(
  ({ title, data, relatedVideos, poster, listFor }) => {
    const [index, setIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate the width of each item dynamically
    const [itemWidth, setItemWidth] = useState(0);

    useEffect(() => {
      if (containerRef.current) {
        const firstChild = containerRef.current.firstElementChild as HTMLElement;
        if (firstChild) {
          setItemWidth(firstChild.offsetWidth + 4); // Adding a 4px gap
        }
      }
    }, [data, relatedVideos]);

    // Handlers to update the index
    const handleRight = useCallback((length: number) => {
      setIndex((prev) => (prev + 3) % length);
    }, []);

    const handleLeft = useCallback((length: number) => {
      setIndex((prev) => (prev - 3 + length) % length);
    }, []);

    // Data source (prioritize in order: relatedVideos -> data -> titles)
    const content = relatedVideos || data || titles;

    return (
      <div className='container pb-6 h-90'>
        <h1 className='text-3xl text-primary pl-5 mb-6'>{title}</h1>
        <div className='group relative w-full h-full overflow-hidden'>
          {/* Left Arrow */}
          <button
            className='absolute top-1/2 left-3 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block'
            style={{ transform: 'translateY(-50%)' }}
            onClick={() => handleLeft(content.length)}
          >
            <ArrowBackIosIcon style={{ fontSize: '1.5rem' }} />
          </button>

          {/* Right Arrow */}
          <button
            className='absolute top-1/2 right-3 p-3 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden group-hover:block'
            style={{ transform: 'translateY(-50%)' }}
            onClick={() => handleRight(content.length)}
          >
            <ArrowForwardIosIcon style={{ fontSize: '1.5rem' }} />
          </button>

          {/* List container */}
          <div
            ref={containerRef}
            className='flex gap-1 h-full transition-transform duration-1000 ease-in-out'
            style={{
              transform: `translateX(${-index * itemWidth}px)`,
            }}
          >
            {content.map((item, idx) => {
              if (isTrailer(item)) {
                return (
                  <List
                    key={idx}
                    trending={data}
                    containerRef={containerRef}
                    setWidth={setItemWidth}
                    title={item.name}
                    videoID={item.key}
                    poster={poster}
                  />
                );
              }

              if (isMedia(item)) {
                return (
                  <List
                    key={item.id}
                    trending={data}
                    containerRef={containerRef}
                    setWidth={setItemWidth}
                    title={item.title || item.name}
                    info={item}
                  />
                );
              }

              // Fallback for string type (titles array)
              if (listFor) {
                return (
                  <List
                    key={idx}
                    containerRef={containerRef}
                    setWidth={setItemWidth}
                    title={item as string}
                    listFor={listFor}
                  />
                );
              }
            })}
          </div>
        </div>
      </div>
    );
  }
);

export default Lists;
