import axios from "axios";
import { getToken, removeAuthData } from "../utils/tokenHelper";

const API_BASE = import.meta.env.VITE_API_URL;

// Create Axios instance with interceptor for JWT
const api = axios.create({
  baseURL: API_BASE,
});

// Request Interceptor: attach JWT token dynamically
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized! Clearing session...");
      removeAuthData();
      window.location.href = "/login"; // redirect to login page
    }
    return Promise.reject(error);
  }
);

// Helper: Resolve both full & relative image URLs
const resolveImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/300x180?text=No+Image";
  if (path.startsWith("http")) return path;
  const base = import.meta.env.VITE_API_URL.replace("/api", "");
  return `${base}${path.startsWith("/") ? path : "/" + path}`;
};



export const getAllCars = async () => {
  const res = await api.get("/cars");
  return res.data.map((car) => ({
    ...car,
    imageUrl: resolveImageUrl(car.imageUrl),
  }));
};

export const createCar = async (carData) => {
  const formData = new FormData();
  Object.entries(carData).forEach(([key, value]) => formData.append(key, value));

  const res = await api.post("/cars", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateCar = async (id, data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => formData.append(key, value));

  const res = await api.put(`/cars/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteCar = async (id) => {
  const res = await api.delete(`/cars/${id}`);
  return res.data;
};



export const getAllLocations = async () => {
  const res = await api.get("/locations");
  return res.data;
};

export const createLocation = async (data) => {
  const res = await api.post("/locations", data);
  return res.data;
};

export const deleteLocation = async (id) => {
  const res = await api.delete(`/locations/${id}`);
  return res.data;
};



export const getAllReservations = async () => {
  const res = await api.get("/reservations");
  return res.data;
};



export const getTotalRevenue = async () => {
  const res = await api.get("/reservations");

  const completed = res.data.filter(
    (r) =>
      r.status?.toLowerCase() === "completed"
  );

  const total = completed.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  return total;
};



export const getAllUsers = async () => {
  const res = await api.get("/authentication/all-users");
  return res.data;
};
