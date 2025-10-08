import axios from "axios";
import { getToken, removeAuthData } from "../utils/tokenHelper";

const API_BASE = import.meta.env.VITE_API_URL;

// Axios instance
const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT dynamically
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized! Logging out...");
      removeAuthData();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper for resolving image URLs
const resolveImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/300x180?text=No+Image";
  if (path.startsWith("http")) return path;
  const base = import.meta.env.VITE_API_URL.replace("/api", "");
  return `${base}${path.startsWith("/") ? path : "/" + path}`;
};

//
// 🚘 CAR MANAGEMENT
//
export const getAgentCars = async () => {
  const res = await api.get("/cars/mycars");
  return res.data.map((car) => ({
    ...car,
    imageUrl: resolveImageUrl(car.imageUrl),
  }));
};

export const createAgentCar = async (carData) => {
  const formData = new FormData();
  Object.entries(carData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) formData.append(key, value);
  });

  const res = await api.post("/cars", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateAgentCar = async (id, data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) formData.append(key, value);
  });

  const res = await api.put(`/cars/my/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteAgentCar = async (id) => {
  const res = await api.delete(`/cars/${id}`);
  return res.data;
};

//
// 📅 BOOKINGS MANAGEMENT
//
export const getAgentBookings = async () => {
  const res = await api.get("/reservations/agent/my");
  return res.data;
};

export const updateAgentBookingStatus = async (id, status) => {
  const res = await api.put(`/reservations/${id}/status`, { status });
  return res.data;
};

//
// 👤 USERS WHO BOOKED AGENT’S CARS
//
export const getBookersForAgent = async () => {
  const res = await api.get("/reservations/agent/bookers");
  return res.data;
};

//
// 📈 ANALYTICS
//
export const getAgentRevenue = async () => {
  const res = await api.get("/reservations/agent/my");
  const completed = res.data.filter(
    (r) =>
      r.status?.toLowerCase() === "completed" ||
      r.status?.toLowerCase() === "paid"
  );
  return completed.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
};

export const getAgentSummary = async () => {
  const [cars, bookings] = await Promise.all([
    getAgentCars(),
    getAgentBookings(),
  ]);
  const totalRevenue = await getAgentRevenue();

  return {
    totalCars: cars.length,
    activeBookings: bookings.filter(
      (b) =>
        b.status?.toLowerCase() === "active" ||
        b.status?.toLowerCase() === "pending"
    ).length,
    totalRevenue,
  };
};
