import axios from "axios";
import { getToken } from "../utils/tokenHelper";

const API_URL = `${import.meta.env.VITE_API_URL}/reviews`;

const getAuthHeader = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const getReviewsByCar = async (carId) => {
  try {
    const res = await axios.get(`${API_URL}/car/${carId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching reviews:", err);
    throw err;
  }
};

export const getAverageRating = async (carId) => {
  try {
    const res = await axios.get(`${API_URL}/average/car/${carId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching average rating:", err);
    throw err;
  }
};

export const getUserReviews = async () => {
  try {
    const res = await axios.get(`${API_URL}/user`, getAuthHeader());
    return res.data;
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    throw err;
  }
};

export const addReview = async (reviewData) => {
  try {
    const res = await axios.post(API_URL, reviewData, getAuthHeader());
    return res.data;
  } catch (err) {
    console.error("Error adding review:", err);
    throw err;
  }
};

export const deleteReview = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return res.data;
  } catch (err) {
    console.error("Error deleting review:", err);
    throw err;
  }
};
