import axios from "axios";
import { getToken, removeAuthData } from "../utils/tokenHelper";

const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(" Unauthorized! Redirecting to login...");
      removeAuthData();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


export const getUserBookingHistory = async () => {
  const res = await api.get("/bookinghistories/user");
  return res.data;
};


export const getAllBookingHistories = async () => {
  const res = await api.get("/bookinghistories");
  return res.data;
};

export const getAgentBookingHistories = async () => {
  const res = await api.get("/bookinghistories/agent/my");
  return res.data;
};
