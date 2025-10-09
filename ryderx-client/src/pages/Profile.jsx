import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Collapse,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getToken } from "../utils/tokenHelper";
import { getUserProfile, updateUserProfile } from "../services/authService";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("********");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // 'success' | 'error' | 'warning'
  const [showAlert, setShowAlert] = useState(false);

  const showMuiAlert = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchProfile() {
      try {
        const data = await getUserProfile();
        if (data) {
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setEmail(data.email || "");
          setPhoneNumber(data.phoneNumber || "");
          setDateOfBirth(data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "");
          setStreet(data.street || "");
          setCity(data.city || "");
          setState(data.state || "");
          setZipCode(data.zipCode || "");
          setCountry(data.country || "");
          setDriverLicenseNumber(data.driverLicenseNumber || "");
          setLicenseExpiryDate(
            data.licenseExpiryDate ? data.licenseExpiryDate.split("T")[0] : ""
          );
          setAvatarUrl(data.avatarUrl || data.AvatarUrl || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }

    fetchProfile();
  }, [navigate]);

  // ✅ Fetch Booking History
  const fetchBookingHistory = async () => {
    const token = getToken();
    if (!token) return navigate("/login");
    try {
      setLoadingBookings(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/bookinghistories/user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error fetching booking history:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookingHistory();
    }
  }, [activeTab]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/authentication/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const uploadedUrl = res?.data?.avatarUrl || res?.data?.AvatarUrl || "";
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        showMuiAlert("✅ Avatar updated successfully!", "success");
      } else {
        showMuiAlert("❌ Avatar uploaded but server did not return URL.", "warning");
      }
    } catch (err) {
      const message =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message ||
        "Upload failed";
      showMuiAlert(`❌ Failed to upload avatar: ${message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // ✅ Validation: Must be 18+ and DL must be valid
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      const isBirthdayPassed = monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0);
      const actualAge = isBirthdayPassed ? age : age - 1;

      if (actualAge < 18) {
        showMuiAlert("🚫 You must be at least 18 years old to book or update your profile.", "error");
        return;
      }
    }

    if (licenseExpiryDate) {
      const expiry = new Date(licenseExpiryDate);
      const today = new Date();
      if (expiry < today) {
        showMuiAlert("🚫 Your driver license has expired. Please update with a valid one.", "error");
        return;
      }
    }

    try {
      setSaving(true);
      const profileData = {
        firstName,
        lastName,
        phoneNumber,
        street,
        city,
        state,
        zipCode,
        country,
        driverLicenseNumber,
        avatarUrl,
        licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      };

      const res = await updateUserProfile(profileData);
      const message =
        res?.message || res?.Message || "✅ Profile updated successfully!";
      showMuiAlert(message, "success");
    } catch (err) {
      const message = err?.message || "Failed to update profile";
      showMuiAlert(`❌ Failed to update profile: ${message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container sx={{ py: 6 }}>
      {/* ✅ Global Alert Display */}
      <Collapse in={showAlert}>
        <Alert
          severity={alertType}
          sx={{
            mb: 3,
            borderRadius: 2,
            fontWeight: 600,
            backgroundColor:
              alertType === "success"
                ? "#e8f5e9"
                : alertType === "error"
                ? "#ffebee"
                : "#fffde7",
          }}
        >
          {alertMessage}
        </Alert>
      </Collapse>

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "none",
              border: "1px solid #eee",
            }}
          >
            <Typography
              variant="h4"
              color="black"
              sx={{ mb: 2, fontWeight: 700 }}
            >
              My Account
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Avatar
                src={avatarUrl || "/default-avatar.png"}
                alt="User Avatar"
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "30px",
                  borderColor: "#d81b60",
                  color: "#d81b60",
                  "&:hover": { borderColor: "#ad1457", color: "#ad1457" },
                }}
              >
                {uploading ? "Uploading..." : "Change Avatar"}
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleAvatarChange}
                />
              </Button>
            </Box>

            <List>
              <ListItem
                button
                selected={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
              >
                <ListItemText sx={{ cursor: "pointer" }} primary="Profile" />
              </ListItem>
              <ListItem
                button
                selected={activeTab === "bookings"}
                onClick={() => setActiveTab("bookings")}
              >
                <ListItemText
                  sx={{ cursor: "pointer" }}
                  primary="Booking History"
                />
              </ListItem>
              <ListItem
                button
                selected={activeTab === "address"}
                onClick={() => setActiveTab("address")}
              >
                <ListItemText sx={{ cursor: "pointer" }} primary="Address" />
              </ListItem>
              <ListItem
                button
                selected={activeTab === "license"}
                onClick={() => setActiveTab("license")}
              >
                <ListItemText sx={{ cursor: "pointer" }} primary="Driver licence" />
              </ListItem>
              <Divider sx={{ my: 2 }} />
              <ListItem
                button
                onClick={() => {
                  localStorage.removeItem("authData");
                  navigate("/login");
                }}
              >
                <ListItemText sx={{ cursor: "pointer" }} primary="Sign out" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 1 }}>
            {activeTab === "profile" && (
              <>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
                  Profile
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <Typography variant="body1">
                        <strong>First name</strong>
                        <br />
                        {firstName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <Typography variant="body1">
                        <strong>Last name</strong>
                        <br />
                        {lastName}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                    mb: 3,
                  }}
                >
                  <Typography variant="body1">
                    <strong>Email address</strong>
                    <br />
                    {email}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                    mb: 3,
                  }}
                >
                  <Typography variant="body1">
                    <strong>Password</strong>
                    <br />
                    {password}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  🔒 Your personal information is secure and encrypted.
                </Typography>

                <Button
                  variant="contained"
                  disabled={saving}
                  sx={{
                    backgroundColor: "#d81b60",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                    py: 1,
                    borderRadius: "50px",
                    "&:hover": { backgroundColor: "#ad1457" },
                  }}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save profile"}
                </Button>
              </>
            )}

            {/* ✅ Booking History Tab */}
            {activeTab === "bookings" && (
              <>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
                  Booking History
                </Typography>

                {loadingBookings ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress color="secondary" />
                  </Box>
                ) : bookings.length === 0 ? (
                  <Typography>No booking history found.</Typography>
                ) : (
                  bookings.map((b) => (
                    <Box
                      key={b.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: "1px solid #eee",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body1">
                        <b>
                          {b.carMake} {b.carModel}
                        </b>{" "}
                        – {new Date(b.pickupAt).toLocaleDateString()} to{" "}
                        {new Date(b.dropoffAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {b.pickupLocation} → {b.dropoffLocation}
                      </Typography>
                      <Typography variant="body2">
                        <b>Status:</b> {b.status}
                      </Typography>
                      <Typography variant="body2">
                        <b>Total:</b> ₹{b.totalPrice}
                      </Typography>
                    </Box>
                  ))
                )}
              </>
            )}

            {/* Address */}
            {activeTab === "address" && (
              <>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
                  Address & Phone
                </Typography>
                <TextField
                  fullWidth
                  label="Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Zip Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  disabled={saving}
                  sx={{
                    backgroundColor: "#d81b60",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                    py: 1,
                    borderRadius: "50px",
                    "&:hover": { backgroundColor: "#ad1457" },
                  }}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save address"}
                </Button>
              </>
            )}

            {/* License */}
            {activeTab === "license" && (
              <>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
                  Driver Licence
                </Typography>
                <TextField
                  fullWidth
                  label="License Number"
                  value={driverLicenseNumber}
                  onChange={(e) => setDriverLicenseNumber(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  value={licenseExpiryDate}
                  onChange={(e) => setLicenseExpiryDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 3 }}
                />
                <Button
                  variant="contained"
                  disabled={saving}
                  sx={{
                    backgroundColor: "#d81b60",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                    py: 1,
                    borderRadius: "50px",
                    "&:hover": { backgroundColor: "#ad1457" },
                  }}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save licence"}
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
