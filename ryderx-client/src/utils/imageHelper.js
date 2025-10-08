export const resolveImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/400x250";

  // If already an absolute URL (like https://localhost:7189/...), return as is
  if (url.startsWith("http")) return url;

  // Else, prepend your backend base URL
  return `${import.meta.env.VITE_API_URL}${url}`;
};
