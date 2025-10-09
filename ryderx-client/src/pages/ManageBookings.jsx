import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Stack,
  Rating,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PaymentIcon from "@mui/icons-material/CurrencyRupee";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import MonetizationOnIcon from "@mui/icons-material/CurrencyRupee";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { AuthContext } from "../context/AuthContext";
import { getReservations, cancelReservation } from "../services/reservationService";
import {
  getUserBookingHistory,
  getAgentBookingHistories,
  getAllBookingHistories,
} from "../services/bookingHistoryService";
import { addReview, getUserReviews } from "../services/reviewService";
import { getToken } from "../utils/tokenHelper";

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
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userReviews, setUserReviews] = useState([]);
  const [viewReviewDialogOpen, setViewReviewDialogOpen] = useState(false);
  const [viewReviewData, setViewReviewData] = useState(null);

  const [searchActive, setSearchActive] = useState("");
  const [sortActive, setSortActive] = useState("desc");
  const [searchPast, setSearchPast] = useState("");
  const [sortPast, setSortPast] = useState("desc");

  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getReservations(user?.roles);
      let history = [];

      if (user?.roles?.includes("Agent")) history = await getAgentBookingHistories();
      else if (user?.roles?.includes("User")) history = await getUserBookingHistory();
      else if (user?.roles?.includes("Admin")) history = await getAllBookingHistories();

      setBookings(data || []);
      setPastBookings(history || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const res = await getUserReviews();
      setUserReviews(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error fetching user reviews:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchUserReviews();
    }
  }, [user]);

  const findReviewForBooking = (booking) => {
    if (!userReviews?.length) return null;
    return (
      userReviews.find(
        (r) =>
          r.bookingId === booking.id ||
          r.carId === booking.carId ||
          (r.carMake === booking.carMake && r.carModel === booking.carModel)
      ) || null
    );
  };

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

  const handleAutoCancel = async (b) => {
    try {
      await cancelReservation(b.id);
      setExpiredBookings((prev) => ({ ...prev, [b.id]: true }));
      setDialogMessage(`⏰ Payment time expired. ${b.carMake} ${b.carModel} was auto-cancelled.`);
      setDialogOpen(true);
      localStorage.removeItem(`timer_start_${b.id}`);
      fetchBookings();
    } catch (err) {
      console.error("Auto cancel failed:", err);
    }
  };

  useEffect(() => {
    if (!bookings || bookings.length === 0) return;
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        bookings
          .filter((b) => b.status?.toLowerCase() === "pending")
          .forEach((b) => {
            const key = `timer_start_${b.id}`;
            let start = localStorage.getItem(key);
            if (!start) {
              start = Date.now();
              localStorage.setItem(key, start);
            }
            const elapsed = Math.floor((Date.now() - parseInt(start, 10)) / 1000);
            const remaining = Math.max(600 - elapsed, 0);
            updated[b.id] = remaining;
            if (remaining === 0 && !expiredBookings[b.id]) handleAutoCancel(b);
          });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bookings]);

  const handlePayNow = async (b) => {
    try {
      const token = getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-checkout-session`, {
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
      });
      if (!response.ok) throw new Error("Failed to create Stripe session");
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert("Failed to redirect to Stripe.");
    } catch (err) {
      console.error("Stripe checkout error:", err);
      alert("Unable to start payment. Please try again.");
    }
  };
function calculateRefundAmount(booking) {
  const now = new Date();
  const pickup = new Date(booking.pickupAt);
  const hoursBeforePickup = (pickup - now) / (1000 * 60 * 60);

  // Refund rules (you can modify these as needed)
  if (hoursBeforePickup >= 24) return booking.totalPrice; // full refund
  if (hoursBeforePickup >= 6) return booking.totalPrice * 0.5; // 50% refund
  return booking.totalPrice * 0.25; // 25% refund if < 6 hours left
}
  const handlePrintBooking = (b) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("RyderX Booking Details", 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.line(14, 32, 200, 32);
    doc.text(`Car: ${b.carMake} ${b.carModel}`, 14, 45);
    doc.text(`Pickup: ${b.pickupLocation}`, 14, 55);
    doc.text(`Pickup Time: ${new Date(b.pickupAt).toLocaleString()}`, 14, 65);
    doc.text(`Drop-off: ${b.dropoffLocation}`, 14, 75);
    doc.text(`Drop-off Time: ${new Date(b.dropoffAt).toLocaleString()}`, 14, 85);
    doc.text(`Status: ${b.status}`, 14, 95);
    doc.text(`Total: ${formatCurrencyINR(b.totalPrice)}`, 14, 105);
    doc.text(`User: ${b.userEmail}`, 14, 115);
    doc.save(`Booking_${b.id}.pdf`);
  };

  const handleAddReview = async () => {
    if (!rating) return alert("Please select a rating before submitting.");
    try {
      await addReview({
        bookingId: reviewBooking?.id,
        carId: reviewBooking?.carId,
        rating,
        comment,
      });
      setReviewDialogOpen(false);
      setRating(0);
      setComment("");
      setReviewBooking(null);
      await fetchUserReviews();
      alert("✅ Review submitted successfully!");
    } catch (err) {
      alert("Failed to submit review. Please try again.");
      console.error("Review submission error:", err);
    }
  };

   // 🕒 Live countdown for pickup/drop time
  useEffect(() => {
    if (!bookings || bookings.length === 0) return;

    const interval = setInterval(() => {
      const updated = {};
      const now = new Date();

      bookings.forEach((b) => {
        const pickup = new Date(b.pickupAt);
        const dropoff = new Date(b.dropoffAt);

        if (now < pickup) {
          const diff = pickup - now;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          updated[b.id] = `🕒 ${hours}h ${minutes}m left for pickup`;
        } else if (now >= pickup && now < dropoff) {
          const diff = dropoff - now;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          updated[b.id] = `⏳ ${hours}h ${minutes}m left for drop-off`;
        } else {
          updated[b.id] = "✅ Trip completed";
        }
      });

      setPickupTimers(updated);
    }, 60000); // updates every minute

    return () => clearInterval(interval);
  }, [bookings]);


  const getStatusColor = (status) => {
    const lower = status?.toLowerCase();
    if (lower === "pending") return "warning";
    if (lower === "confirmed" || lower === "active") return "success";
    if (lower === "completed") return "info";
    if (lower === "cancelled") return "error";
    return "default";
  };

  const activeBookings = useMemo(() => {
    const query = searchActive.toLowerCase();
    const filtered = bookings.filter((b) =>
      ["active", "pending", "confirmed"].includes(b.status?.toLowerCase())
    );
    return filtered
      .filter(
        (b) =>
          b.carMake?.toLowerCase().includes(query) ||
          b.carModel?.toLowerCase().includes(query) ||
          b.pickupLocation?.toLowerCase().includes(query) ||
          b.dropoffLocation?.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.pickupAt);
        const dateB = new Date(b.createdAt || b.pickupAt);
        return sortActive === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [bookings, searchActive, sortActive]);

  const filteredPast = useMemo(() => {
    const query = searchPast.toLowerCase();
    const filtered = pastBookings.filter(
      (b) =>
        b.carMake?.toLowerCase().includes(query) ||
        b.carModel?.toLowerCase().includes(query) ||
        b.pickupLocation?.toLowerCase().includes(query) ||
        b.dropoffLocation?.toLowerCase().includes(query)
    );
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.pickupAt);
      const dateB = new Date(b.createdAt || b.pickupAt);
      return sortPast === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [pastBookings, searchPast, sortPast]);

  const AlignedText = ({ icon, text, strong }) => (
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon}
      <Typography color="text.secondary">
        {strong ? <strong>{text}</strong> : text}
      </Typography>
    </Stack>
  );

  if (!user)
    return (
      <Box sx={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h5" fontWeight={700} color="error">
          Please log in to view your bookings.
        </Typography>
        <Button variant="contained" color="secondary" onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </Box>
    );

  if (loading)
    return (
      <Box sx={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress color="secondary" />
      </Box>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box mb={5} textAlign="center">
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
        >
          <DirectionsCarIcon color="secondary" fontSize="large" />
          Manage Bookings
        </Typography>
        <Divider sx={{ width: "100px", height: 3, backgroundColor: "#d81b60", mx: "auto", mt: 1 }} />
      </Box>

      <Typography variant="h6" fontWeight={700} mb={2} color="#333">
        Active Bookings
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <TextField
          placeholder="Search active bookings..."
          value={searchActive}
          onChange={(e) => setSearchActive(e.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Sort by Created Date"
          value={sortActive}
          onChange={(e) => setSortActive(e.target.value)}
          sx={{ width: { xs: "100%", sm: "250px" } }}
        >
          <MenuItem value="desc">Newest First</MenuItem>
          <MenuItem value="asc">Oldest First</MenuItem>
        </TextField>
      </Stack>

      {activeBookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3, color: "text.secondary" }}>
          No active bookings found.
        </Paper>
      ) : (
        activeBookings.map((b) => {
          const timeLeft = timers[b.id] || 0;
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          const isExpired = expiredBookings[b.id];
          return (
            <Card key={b.id} sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: "0px 6px 18px rgba(0,0,0,0.1)", background: "linear-gradient(145deg, #ffffff, #f8f8f8)" }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DirectionsCarIcon color="secondary" /> {b.carName || "Unknown"}
              </Typography>
              <Chip label={b.status} color={getStatusColor(b.status)} size="small" sx={{ mt: 1, mb: 2 }} />
              <AlignedText icon={<PlaceIcon fontSize="small" />} text={`Pickup: ${b.pickupLocation}`} />
              <AlignedText icon={<AccessTimeIcon fontSize="small" />} text={new Date(b.pickupAt).toLocaleString()} />
              <AlignedText icon={<PlaceIcon fontSize="small" />} text={`Drop-off: ${b.dropoffLocation}`} />
              <AlignedText icon={<AccessTimeIcon fontSize="small" />} text={new Date(b.dropoffAt).toLocaleString()} />
              <AlignedText icon={<MonetizationOnIcon fontSize="small" color="success" />} text={`Total: ${formatCurrencyINR(b.totalPrice)}`} strong />
              {b.status?.toLowerCase() === "pending" && (
                <Typography variant="body2" fontWeight={700} color={isExpired ? "error.main" : "secondary.main"} sx={{ mt: 1 }}>
                  {isExpired ? "Payment time expired" : `⏱ Payment expires in ${minutes}:${seconds.toString().padStart(2, "0")}`}
                </Typography>
              )}
              <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                <Button variant="outlined" startIcon={<InfoOutlinedIcon />} onClick={() => setSelectedBooking(b)}>View</Button>
                {b.status?.toLowerCase() === "pending" && !isExpired && (
                  <Button variant="contained" color="secondary" startIcon={<PaymentIcon />} onClick={() => handlePayNow(b)}>Pay Now</Button>
                )}
                <Button variant="contained" color="error" startIcon={<CancelIcon />} onClick={() => { setBookingToCancel(b); setCancelDialogOpen(true); }}>Cancel</Button>
              </Stack>
            </Card>
          );
        })
      )}

      <Typography variant="h6" fontWeight={700} mt={6} mb={2} color="#333">
        Past Bookings
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <TextField
          placeholder="Search past bookings..."
          value={searchPast}
          onChange={(e) => setSearchPast(e.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Sort by Created Date"
          value={sortPast}
          onChange={(e) => setSortPast(e.target.value)}
          sx={{ width: { xs: "100%", sm: "250px" } }}
        >
          <MenuItem value="desc">Newest First</MenuItem>
          <MenuItem value="asc">Oldest First</MenuItem>
        </TextField>
      </Stack>

      {filteredPast.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
          <Typography color="text.secondary">No past bookings available.</Typography>
        </Paper>
      ) : (
        filteredPast.map((b) => {
          const review = findReviewForBooking(b);
          return (
            <Card key={b.id} sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: "0px 4px 14px rgba(0,0,0,0.08)", background: "linear-gradient(145deg, #ffffff, #f8f8f8)" }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DirectionsCarIcon color="secondary" /> {b.carMake || "Unknown"} {b.carModel || ""}
              </Typography>
              <Chip label={b.status} color={getStatusColor(b.status)} size="small" sx={{ mt: 1, mb: 2 }} />
              <AlignedText icon={<PlaceIcon fontSize="small" />} text={`Pickup: ${b.pickupLocation}`} />
              <AlignedText icon={<PlaceIcon fontSize="small" />} text={`Drop-off: ${b.dropoffLocation}`} />
              <AlignedText icon={<AccessTimeIcon fontSize="small" />} text={new Date(b.pickupAt).toLocaleString()} />
              <AlignedText icon={<MonetizationOnIcon fontSize="small" color="success" />} text={`Total: ${formatCurrencyINR(b.totalPrice)}`} strong />
              <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                <Button variant="outlined" startIcon={<InfoOutlinedIcon />} onClick={() => setSelectedBooking(b)}>Details</Button>
                {/* <Button variant="contained" color="secondary" startIcon={<PictureAsPdfIcon />} onClick={() => handlePrintBooking(b)}>PDF</Button> */}
                {/* {b.status?.toLowerCase() === "completed" && (
                  review ? (
                    <Button variant="contained" color="primary" onClick={() => handleOpenViewReview(review)}>View Review</Button>
                  ) : (
                    <Button variant="contained" color="primary" onClick={() => { setReviewBooking(b); setReviewDialogOpen(true); }}>Leave Review</Button>
                  )
                )} */}
              </Stack>
            </Card>
          );
        })
      )}

      <Dialog open={!!selectedBooking} onClose={() => setSelectedBooking(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Booking Details</DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <Box>
              <Typography variant="h6">{selectedBooking.carMake} {selectedBooking.carModel}</Typography>
              <Chip label={selectedBooking.status} color={getStatusColor(selectedBooking.status)} size="small" sx={{ mb: 2 }} />
              <Typography>Pickup: {selectedBooking.pickupLocation}</Typography>
              <Typography>Pickup Time: {new Date(selectedBooking.pickupAt).toLocaleString()}</Typography>
              <Typography>Drop-off: {selectedBooking.dropoffLocation}</Typography>
              <Typography>Drop-off Time: {new Date(selectedBooking.dropoffAt).toLocaleString()}</Typography>
              <Typography fontWeight={700}>Total: {formatCurrencyINR(selectedBooking.totalPrice)}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" startIcon={<PictureAsPdfIcon />} onClick={() => handlePrintBooking(selectedBooking)}>Download PDF</Button>
          <Button onClick={() => setSelectedBooking(null)}>Close</Button>
        </DialogActions>
      </Dialog>

       {/* Cancel Dialog with Refund Info */}
<Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="xs" fullWidth>
  <DialogTitle fontWeight={700}>Cancel Booking</DialogTitle>
  <DialogContent dividers>
    {bookingToCancel ? (
      bookingToCancel.status?.toLowerCase() === "confirmed" ? (
        (() => {
          const refundAmount = calculateRefundAmount(bookingToCancel);
          return (
            <>
              <Typography gutterBottom>
                You’re about to cancel your confirmed booking for{" "}
                <strong>
                  {bookingToCancel.carMake} {bookingToCancel.carModel}
                </strong>.
              </Typography>
              <Typography gutterBottom>
                Based on your pickup time, a refund of{" "}
                <strong style={{ color: "green" }}>
                  {formatCurrencyINR(refundAmount.toFixed(0))}
                </strong>{" "}
                will be issued to your original payment method.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (Refunds may take 3–5 business days to process.)
              </Typography>
            </>
          );
        })()
      ) : (
        <Typography>
          Are you sure you want to cancel{" "}
          <strong>{bookingToCancel.carName || "this booking"}</strong>?
        </Typography>
      )
    ) : (
      <Typography>No booking selected.</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setCancelDialogOpen(false)}>No</Button>
    <Button color="error" onClick={handleConfirmCancel}>
      Yes, Cancel
    </Button>
  </DialogActions>
</Dialog>

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