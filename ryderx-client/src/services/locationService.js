import axios from "axios";
import { getToken } from "../utils/tokenHelper";

const API_URL = `${import.meta.env.VITE_API_URL}/locations`;

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all locations (public)
export const getAllLocations = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Get location by Id (public)
export const getLocationById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// Get cars at location (public)
export const getCarsAtLocation = async (id) => {
  const res = await axios.get(`${API_URL}/${id}/cars`);
  return res.data;
};

// Create location (Admin/Agent)
export const createLocation = async (data) => {
  const res = await axios.post(API_URL, data, { headers: getAuthHeaders() });
  return res.data;
};

// Update location (Admin/Agent)
export const updateLocation = async (data) => {
  const res = await axios.put(API_URL, data, { headers: getAuthHeaders() });
  return res.data;
};

// Delete location (Admin only)
export const deleteLocation = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  return res.data;
};
