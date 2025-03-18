const TMDB_URL: string = "https://image.tmdb.org/t/p/";
// Get the transformed Images (webp)
const getImageUrl = (path: string | undefined, quality: string) => {
  const originalUrl = `${TMDB_URL}${quality}${path}`;
  return `${import.meta.env.VITE_SHARP_API}/image?url=${encodeURIComponent(
    originalUrl,
  )}&format=webp`;
};

export default getImageUrl;
