import axios from "axios";
import { getToken } from "../utils/tokenHelper";

const API_URL = `${import.meta.env.VITE_API_URL}/cars`;

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all cars (public)
export const getAllCars = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Get cars by location (public)
export const getCarsByLocation = async (locationId) => {
  const res = await axios.get(`${API_URL}/location/${locationId}`);
  return res.data;
};

// Get available cars (public)
export const getAvailableCars = async () => {
  const res = await axios.get(`${API_URL}/available`);
  return res.data;
};

// Get my cars (Agent only)
export const getMyCars = async () => {
  const res = await axios.get(`${API_URL}/mycars`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Create car (Admin/Agent only, multipart form)
export const createCar = async (carData) => {
  const formData = new FormData();
  Object.keys(carData).forEach((key) => {
    if (carData[key] !== null && carData[key] !== undefined) {
      formData.append(key, carData[key]);
    }
  });

  const res = await axios.post(API_URL, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update any car (Admin or owner Agent)
export const updateCar = async (id, carData) => {
  const formData = new FormData();
  Object.keys(carData).forEach((key) => {
    if (carData[key] !== null && carData[key] !== undefined) {
      formData.append(key, carData[key]);
    }
  });

  const res = await axios.put(`${API_URL}/${id}`, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update my own car (Agent only)
export const updateMyCar = async (id, carData) => {
  const formData = new FormData();
  Object.keys(carData).forEach((key) => {
    if (carData[key] !== null && carData[key] !== undefined) {
      formData.append(key, carData[key]);
    }
  });

  const res = await axios.put(`${API_URL}/my/${id}`, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete car (Admin/Agent only)
export const deleteCar = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
