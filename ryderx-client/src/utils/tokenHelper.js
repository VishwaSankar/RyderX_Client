// Decode JWT payload (no verification, just base64 decode)
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1]; // payload
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to decode JWT:", err);
    return null;
  }
};

// Save full auth data to localStorage
export const setAuthData = ({ token, username, roles, expiration }) => {
  const decoded = decodeJwt(token);

  const authData = {
    token,
    username,
    roles,
    expiration,
    decoded, // store raw decoded payload for debugging
  };

  localStorage.setItem("authData", JSON.stringify(authData));

  console.log("✅ Stored authData:", authData);
};

// Get auth data from localStorage
export const getAuthData = () => {
  const data = localStorage.getItem("authData");
  return data ? JSON.parse(data) : null;
};

// Get token only
export const getToken = () => {
  const authData = getAuthData();
  return authData?.token || null;
};

// Remove auth data
export const removeAuthData = () => {
  localStorage.removeItem("authData");
  console.log("🗑️ Cleared authData from localStorage");
};
