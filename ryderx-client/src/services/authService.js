import axios from "axios";
import { getToken } from "../utils/tokenHelper";

const API_URL = `${import.meta.env.VITE_API_URL}/authentication`;

// Handle API errors gracefully
const handleError = (error) => {
  if (error.response) {
    throw new Error(
      error.response.data.message ||
        error.response.data.Message ||
        "Request failed"
    );
  } else if (error.request) {
    throw new Error("No response from server. Please try again.");
  } else {
    throw new Error(error.message || "Unexpected error occurred");
  }
};

// Register a new user
export const registerUser = async (details) => {
  try {
    const res = await axios.post(`${API_URL}/register`, details);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const res = await axios.post(`${API_URL}/login`, credentials);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Google OAuth login
export const loginWithGoogle = async (idToken) => {
  try {
    const res = await axios.post(`${API_URL}/external-login`, {
      provider: "google",
      idToken,
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Get logged-in user profile
export const getUserProfile = async () => {
  try {
    const token = getToken();
    const res = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Update logged-in user profile
export const updateUserProfile = async (profileData) => {
  try {
    const token = getToken();
    const res = await axios.put(`${API_URL}/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Get user by ID (Admin or Agent only)
export const getUserById = async (id) => {
  try {
    const token = getToken();
    const res = await axios.get(`${API_URL}/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Get user by Email (Admin or Agent only)
export const getUserByEmail = async (email) => {
  try {
    const token = getToken();
    const res = await axios.get(`${API_URL}/user/by-email/${email}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Upload user avatar (future support)
export const uploadUserAvatar = async (file) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_URL}/profile/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (err) {
    handleError(err);
  }
};
