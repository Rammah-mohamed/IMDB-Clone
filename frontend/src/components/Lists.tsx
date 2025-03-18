import React, { useRef, useState, useCallback, useEffect } from "react";
import { Media, Trailer } from "../types/media";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// Lazy load component
const List = React.lazy(() => import("./List"));

// Type for Lists props
type ListsProps = {
  title: string;
  poster?: string;
  listFor?: string;
  data?: Media[];
  relatedVideos?: Trailer[];
};

// List titles
const titles: string[] = ["Upcoming Movies", "Popular Movies", "TV Airings", "Popular TV"];

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
    // Initialize state hooks
    const [index, setIndex] = useState<number>(0);
    const [itemWidth, setItemWidth] = useState<number>(0);

    // Initialize Ref hooks
    const containerRef = useRef<HTMLDivElement>(null);

    // Data source (prioritize in order: relatedVideos -> data -> titles)
    const content = relatedVideos || data || titles;

    useEffect(() => {
      const container = containerRef.current;
      if (!container || content?.length === 0) return;

      const measure = () => {
        const firstChild = container.firstElementChild as HTMLElement;
        if (firstChild && firstChild.offsetWidth > 0) {
          setItemWidth(firstChild.offsetWidth);
        }
      };

      const observer = new ResizeObserver(measure);
      observer.observe(container);

      // Measure once initially
      measure();

      return () => observer.disconnect();
    }, [content]);

    // Handlers to update the index
    const handleRight = useCallback((length: number) => {
      const isMobile = window.innerWidth <= 768;
      console.log("Window", window.innerWidth);
      if (isMobile) {
        setIndex((prev) => (prev + 2) % length);
      } else {
        setIndex((prev) => (prev + 3) % length);
      }
    }, []);

    const handleLeft = useCallback((length: number) => {
      const isMobile = window.innerWidth <= 768;
      console.log("Window", window.innerWidth);
      if (isMobile) {
        setIndex((prev) => (prev - 2 + length) % length);
      } else {
        setIndex((prev) => (prev - 3 + length) % length);
      }
    }, []);

    console.log([`index: ${index}`, `itemWidth: ${itemWidth}`]);

    return (
      <div className={`container ${title === "Related Videos" ? "pb-20" : ""} pb-8 h-90`}>
        <h1 className="text-3xl max-lg:text-2xl max-md:text-xl text-primary pl-5 mb-6">{title}</h1>
        <div className="group relative w-full h-full overflow-hidden">
          {/* Left Arrow */}
          <button
            data-testid="prevBtn"
            className="absolute top-1/2 left-3 p-3 max-lg:p-1.5 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden max-lg:block group-hover:block"
            style={{ transform: "translateY(-50%)" }}
            onClick={() => handleLeft(content.length)}
          >
            <ArrowBackIosIcon style={{ fontSize: "1.5rem" }} />
          </button>

          {/* Right Arrow */}
          <button
            data-testid="nextBtn"
            className="absolute top-1/2 right-3 p-3 max-lg:p-1.5 text-white hover:text-primary z-30 border-2 border-solid rounded-md hidden max-lg:block group-hover:block"
            style={{ transform: "translateY(-50%)" }}
            onClick={() => handleRight(content.length)}
          >
            <ArrowForwardIosIcon style={{ fontSize: "1.5rem" }} />
          </button>

          {/* List container */}
          <div
            ref={containerRef}
            className="flex h-full transition-transform duration-1000 ease-in-out"
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
  },
);

export default Lists;
