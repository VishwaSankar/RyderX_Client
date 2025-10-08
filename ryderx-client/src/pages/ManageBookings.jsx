import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardMedia,
  CardActions,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { AuthContext } from "../context/AuthContext";
import {
  getReservations,
  cancelReservation,
} from "../services/reservationService";
import {
  getUserBookingHistory,
  getAgentBookingHistories,
  getAllBookingHistories,
} from "../services/bookingHistoryService";
import { getToken } from "../utils/tokenHelper";
import { resolveImageUrl } from "../utils/imageHelper";

function formatCurrencyINR(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

export default function ManageBookings() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [timers, setTimers] = useState({});
  const [expiredBookings, setExpiredBookings] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const navigate = useNavigate();

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getReservations(user?.roles);
      setBookings(data || []);

      let history = [];
      if (user?.roles?.includes("Agent")) {
        history = await getAgentBookingHistories();
      } else if (user?.roles?.includes("User")) {
        history = await getUserBookingHistory();
      } else if (user?.roles?.includes("Admin")) {
        history = await getAllBookingHistories();
      }
      setPastBookings(history || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  // Cancel booking manually
  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
      await cancelReservation(bookingToCancel.id);
      setCancelDialogOpen(false);
      setBookingToCancel(null);
      localStorage.removeItem(`timer_start_${bookingToCancel.id}`);
      fetchBookings();
    } catch (err) {
      alert(err.message || "Error cancelling booking.");
    }
  };

  // Auto cancel logic for timer expiry
  const handleAutoCancel = async (b) => {
    try {
      await cancelReservation(b.id);
      setExpiredBookings((prev) => ({ ...prev, [b.id]: true }));
      setDialogMessage(`⏰ Payment time expired. ${b.carName} was auto-cancelled.`);
      setDialogOpen(true);
      localStorage.removeItem(`timer_start_${b.id}`);
      fetchBookings();
    } catch (err) {
      console.error("Auto cancel failed:", err);
    }
  };

  // Timer logic with persistence in localStorage
  useEffect(() => {
    if (!bookings || bookings.length === 0) return;

    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };

        bookings
          .filter((b) => b.status?.toLowerCase() === "pending")
          .forEach((b) => {
            const key = `timer_start_${b.id}`;
            let startTime = localStorage.getItem(key);

            // If no start time exists, set one now
            if (!startTime) {
              startTime = Date.now();
              localStorage.setItem(key, startTime);
            }

            const elapsed = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
            const remaining = Math.max(600 - elapsed, 0); // 10 min = 600s

            updatedTimers[b.id] = remaining;

            if (remaining === 0 && !expiredBookings[b.id]) {
              handleAutoCancel(b);
            }
          });

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [bookings]);

  // Payment
  const handlePayNow = async (b) => {
    try {
      const token = getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reservationId: b.id,
            amount: b.totalPrice,
            paymentMethod: "Stripe",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to create Stripe session");
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert("Failed to redirect to Stripe.");
    } catch (err) {
      console.error("Stripe checkout error:", err);
      alert("Unable to start payment. Please try again.");
    }
  };

  // PDF
  const handlePrintBooking = (b) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("RyderX Booking Details", 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.line(14, 32, 200, 32);
    doc.text(`Car: ${b.carName}`, 14, 45);
    doc.text(`Pickup: ${b.pickupLocation}`, 14, 55);
    doc.text(`Pickup Time: ${new Date(b.pickupAt).toLocaleString()}`, 14, 65);
    doc.text(`Drop-off: ${b.dropoffLocation}`, 14, 75);
    doc.text(`Drop-off Time: ${new Date(b.dropoffAt).toLocaleString()}`, 14, 85);
    doc.text(`Status: ${b.status}`, 14, 95);
    doc.text(`Total: ${formatCurrencyINR(b.totalPrice)}`, 14, 105);
    doc.text(`User: ${b.userEmail}`, 14, 115);
    doc.save(`Booking_${b.id}.pdf`);
  };

  const getStatusColor = (status) => {
    const lower = status?.toLowerCase();
    if (lower === "pending") return "warning";
    if (lower === "confirmed" || lower === "active") return "success";
    if (lower === "completed") return "info";
    if (lower === "cancelled") return "error";
    return "default";
  };

  const activeBookings = bookings.filter((b) =>
    ["active", "pending", "confirmed"].includes(b.status?.toLowerCase())
  );

  // UI States
  if (!user)
    return (
      <Box
        sx={{
          height: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5" fontWeight={700} color="error">
          Please log in to view your bookings.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </Box>
    );

  if (loading)
    return (
      <Box
        sx={{
          height: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight={800}
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1, color: "#222" }}
        >
          <DirectionsCarIcon color="secondary" fontSize="large" />
          Manage Bookings
        </Typography>
        <Divider sx={{ width: "100px", height: 3, backgroundColor: "#d81b60" }} />
      </Box>

      {/* Active Bookings */}
      <Typography variant="h6" fontWeight={700} mb={2} color="#333">
        Active Bookings
      </Typography>

      {activeBookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3, color: "text.secondary" }}>
          No active bookings at the moment.
        </Paper>
      ) : (
        activeBookings.map((b) => {
          const timeLeft = timers[b.id] || 0;
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          const isExpired = expiredBookings[b.id];

          return (
            <Card
              key={b.id}
              sx={{
                display: "flex",
                flexDirection: "row",
                mb: 3,
                borderRadius: 3,
                boxShadow: "0px 6px 18px rgba(0,0,0,0.08)",
                overflow: "hidden",
                transition: "0.25s ease",
                "&:hover": { transform: "translateY(-3px)" },
              }}
            >
              <CardMedia
                component="img"
                sx={{ width: 240, height: 170, objectFit: "cover" }}
                image={resolveImageUrl(b.imageUrl)}
                alt={b.carName}
              />
              <Box sx={{ flex: 1, p: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  {b.carName}
                </Typography>
                <Chip
                  label={b.status}
                  color={getStatusColor(b.status)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Pickup: {b.pickupLocation} — {new Date(b.pickupAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drop-off: {b.dropoffLocation} — {new Date(b.dropoffAt).toLocaleString()}
                </Typography>
                <Typography fontWeight={700} mt={1.5}>
                  Total: {formatCurrencyINR(b.totalPrice)}
                </Typography>

                {b.status?.toLowerCase() === "pending" && (
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={isExpired ? "error.main" : "secondary.main"}
                    sx={{ mt: 1 }}
                  >
                    {isExpired
                      ? "Payment time expired"
                      : `⏱ Payment expires in ${minutes}:${seconds
                          .toString()
                          .padStart(2, "0")}`}
                  </Typography>
                )}
              </Box>
              <Divider orientation="vertical" flexItem />
              <CardActions
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                  p: 2,
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<InfoOutlinedIcon />}
                  onClick={() => setSelectedBooking(b)}
                >
                  View
                </Button>
                {b.status?.toLowerCase() === "pending" && !isExpired && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PaymentIcon />}
                    onClick={() => handlePayNow(b)}
                  >
                    Pay Now
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setBookingToCancel(b);
                    setCancelDialogOpen(true);
                  }}
                >
                  Cancel
                </Button>
              </CardActions>
            </Card>
          );
        })
      )}

      {/* Past Bookings */}
      <Typography variant="h6" fontWeight={700} mt={6} mb={2} color="#333">
        Past Bookings
      </Typography>
      {pastBookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
          <Typography color="text.secondary">No past bookings available.</Typography>
        </Paper>
      ) : (
        pastBookings.map((b) => (
          <Card
            key={b.id}
            sx={{
              display: "flex",
              flexDirection: "row",
              mb: 3,
              borderRadius: 3,
              boxShadow: "0px 4px 14px rgba(0,0,0,0.06)",
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            <CardMedia
              component="img"
              sx={{ width: 240, height: 170, objectFit: "cover" }}
              image={resolveImageUrl(b.imageUrl)}
              alt={b.carName}
            />
            <Box sx={{ flex: 1, p: 3 }}>
              <Typography variant="h6" fontWeight={700}>
                {b.carName}
              </Typography>
              <Chip
                label={b.status}
                color={getStatusColor(b.status)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Pickup: {b.pickupLocation} — {new Date(b.pickupAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drop-off: {b.dropoffLocation} — {new Date(b.dropoffAt).toLocaleString()}
              </Typography>
              <Typography fontWeight={700} mt={1.5}>
                Total: {formatCurrencyINR(b.totalPrice)}
              </Typography>
            </Box>
            <CardActions
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 1,
                p: 2,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<InfoOutlinedIcon />}
                onClick={() => setSelectedBooking(b)}
              >
                Details
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => handlePrintBooking(b)}
              >
                PDF
              </Button>
            </CardActions>
          </Card>
        ))
      )}

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onClose={() => setSelectedBooking(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Booking Details</DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <Box>
              <img
                src={resolveImageUrl(selectedBooking.imageUrl)}
                alt={selectedBooking.carName}
                style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
              />
              <Typography variant="h6">{selectedBooking.carName}</Typography>
              <Chip
                label={selectedBooking.status}
                color={getStatusColor(selectedBooking.status)}
                size="small"
                sx={{ mb: 2 }}
              />
              <Typography>Pickup: {selectedBooking.pickupLocation}</Typography>
              <Typography>
                Pickup Time: {new Date(selectedBooking.pickupAt).toLocaleString()}
              </Typography>
              <Typography>Drop-off: {selectedBooking.dropoffLocation}</Typography>
              <Typography>
                Drop-off Time: {new Date(selectedBooking.dropoffAt).toLocaleString()}
              </Typography>
              <Typography fontWeight={700}>
                Total: {formatCurrencyINR(selectedBooking.totalPrice)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => handlePrintBooking(selectedBooking)}
          >
            Download PDF
          </Button>
          <Button onClick={() => setSelectedBooking(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Cancel Booking</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to cancel{" "}
            <strong>{bookingToCancel?.carName || "this booking"}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No</Button>
          <Button color="error" onClick={handleConfirmCancel}>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Timer Expiry Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Payment Expired</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
