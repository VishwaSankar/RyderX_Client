import axios from "axios";
import { getToken } from "../utils/tokenHelper";

const API_URL = `${import.meta.env.VITE_API_URL}/reservations`;

// Helper: uniform error handling
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

// 🟢 Create a new reservation
export const createReservation = async (reservationData) => {
  try {
    const token = getToken();
    const res = await axios.post(API_URL, reservationData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// 🟢 Get reservations based on user role
export const getReservations = async (roles) => {
  try {
    const token = getToken();

    let endpoint = "";
    if (roles?.includes("User")) {
      endpoint = `${API_URL}/user`;
    } else if (roles?.includes("Agent")) {
      endpoint = `${API_URL}/agent/my`;
    } else if (roles?.includes("Admin")) {
      endpoint = `${API_URL}`;
    } else {
      throw new Error("Unauthorized role to fetch reservations");
    }

    const res = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// 🟢 Cancel Reservation
export const cancelReservation = async (reservationId) => {
  try {
    const token = getToken();
    const res = await axios.delete(`${API_URL}/cancel/${reservationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// 🟢 Admin/Agent: Update Reservation Status
export const updateReservationStatus = async (reservationId, status) => {
  try {
    const token = getToken();
    const res = await axios.put(
      `${API_URL}/status`,
      { reservationId, status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    handleError(err);
  }
};
