// src/context/MediaLengthContext.tsx
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

interface MediaLengthContextProps {
  mediaLength: number;
  setMediaLength: React.Dispatch<React.SetStateAction<number>>;
  fetchMediaLength: () => Promise<void>;
}

const MediaLengthContext = createContext<MediaLengthContextProps | undefined>(undefined);

export const MediaLengthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mediaLength, setMediaLength] = useState<number>(0);

  const fetchMediaLength = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_MONGODB_API}/lists/Your_Watchlist`, {
        withCredentials: true,
      });
      setMediaLength(response.data?.movies?.length || 0);
    } catch (error: any) {
      console.error(
        error.response ? `Server Error: ${error.response.data}` : `Error: ${error.message}`,
      );
    }
  };

  return (
    <MediaLengthContext.Provider value={{ mediaLength, setMediaLength, fetchMediaLength }}>
      {children}
    </MediaLengthContext.Provider>
  );
};

export const useMediaLength = () => {
  const context = useContext(MediaLengthContext);
  if (!context) {
    throw new Error("useMediaLength must be used within a MediaLengthProvider");
  }
  return context;
};
