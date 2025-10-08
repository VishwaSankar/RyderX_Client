// context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser, getUserProfile } from "../services/authService";
import { setAuthData, removeAuthData, getAuthData } from "../utils/tokenHelper";
import { useNavigate } from "react-router-dom";
import MessageCard from "../components/MessageCard";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authData = getAuthData();
    if (authData?.token) {
      getUserProfile()
        .then((profile) => {
          setUser({
            username: authData.username,
            roles: Array.isArray(authData.roles) ? authData.roles : [authData.roles],
            expiration: authData.expiration,
            profile,
          });
        })
        .catch((err) => {
          console.error("❌ Profile fetch failed:", err.message);
          removeAuthData();
          setUser(null);
          setNotification({ message: err.message, severity: "error" });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const data = await loginUser(credentials);
      if (data?.token) {
        setAuthData({
          token: data.token,
          username: data.username,
          roles: data.roles,
          expiration: data.expiration,
        });
        setUser({
          username: data.username,
          roles: Array.isArray(data.roles) ? data.roles : [data.roles],
          expiration: data.expiration,
        });
        setNotification({ message: "Login successful ✅", severity: "success" });

        // 🔑 redirect by role
        if (data.roles?.includes("Admin")) {
          navigate("/admin-dashboard");
        } else if (data.roles?.includes("Agent")) {
          navigate("/agent-dashboard");
        } else {
          navigate("/");
        }
      } else {
        setNotification({ message: "Invalid login", severity: "error" });
      }
    } catch (err) {
      console.error("❌ Login failed:", err.message);
      setNotification({ message: err.message, severity: "error" });
    }
  };

  const register = async (details) => {
    try {
      const data = await registerUser(details);
      if (data?.status === "Success") {
        setNotification({ message: "Registration successful ✅", severity: "success" });
        navigate("/login");
      } else {
        setNotification({
          message: data?.message || "Registration failed",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("❌ Registration failed:", err.message);
      setNotification({ message: err.message, severity: "error" });
    }
  };

  const logout = () => {
    removeAuthData();
    setUser(null);
    setNotification({ message: "Logged out successfully", severity: "info" });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
      {notification && (
        <MessageCard
          message={notification.message}
          severity={notification.severity}
          onClose={() => setNotification(null)}
        />
      )}
    </AuthContext.Provider>
  );
};
