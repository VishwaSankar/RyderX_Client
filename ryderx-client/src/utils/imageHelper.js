export const resolveImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/400x250";

  if (url.startsWith("http")) return url;

  return `${import.meta.env.VITE_API_URL}${url}`;
};
