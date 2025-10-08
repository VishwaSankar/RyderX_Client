import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaymentIcon from "@mui/icons-material/Payment";
import { resolveImageUrl } from "../utils/imageHelper";
import { loadStripe } from "@stripe/stripe-js";

import { createReservation } from "../services/reservationService";
import { getToken, getAuthData } from "../utils/tokenHelper";
import { getUserProfile } from "../services/authService";

const vehicleData = [
  {
    id: 1,
    make: "Suzuki",
    model: "Swift Hybrid",
    year: 2022,
    licensePlate: "KA01AB1234",
    pricePerDay: 1800,
    isAvailable: true,
    category: "Hatchback",
    fuelType: "Hybrid",
    transmission: "Automatic",
    seats: 5,
    img: "https://cdn.pixabay.com/photo/2016/11/29/06/18/suzuki-1863139_1280.jpg",
    location: "Kempegowda International Airport",
  },
];

function formatCurrencyINR(n) {
  return `₹${n}`;
}

function daysBetween(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const diff = end - start;
  if (isNaN(diff) || diff <= 0) return 1;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
function PaymentCountdown({ reservationId, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!reservationId) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpired(true);
          handleAutoCancel();
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [reservationId]);

  const handleAutoCancel = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/reservations/cancel/${reservationId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
    } catch (err) {
      console.error("Auto-cancel failed:", err);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        textAlign: "center",
        backgroundColor: expired ? "error.light" : "rgba(216,27,96,0.1)",
        border: expired
          ? "1px solid rgba(244,67,54,0.6)"
          : "1px solid rgba(216,27,96,0.3)",
      }}
    >
      {!expired ? (
        <>
          <Typography fontWeight={700} color="error.main">
            Payment expires in {minutes}:{seconds.toString().padStart(2, "0")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please complete your payment before the timer runs out.
          </Typography>
        </>
      ) : (
        <Typography color="error.main" fontWeight={700}>
          Payment session expired — reservation cancelled.
        </Typography>
      )}
    </Box>
  );
}

export default function BookingPage() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const state = routerLocation.state || {};

  const [step, setStep] = useState(0);
  const [locations, setLocations] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [reservationId, setReservationId] = useState(null);

  const authData = getAuthData();
  const token = getToken();

  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const roles = authData?.roles || [];
    if (roles.includes("Admin") || roles.includes("Agent")) {
      setDialogMessage("Access restricted. Only users can make reservations.");
      setDialogOpen(true);
      setTimeout(() => navigate("/"), 1500);
      return;
    }

    async function fetchUserProfile() {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setFirstName(profile.firstName || "");
          setLastName(profile.lastName || "");
          setEmail(profile.email || "");
          setPhone(profile.phoneNumber || "");
          setCountry(profile.country || "India");
          setDriverLicenseNumber(profile.driverLicenseNumber || "");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    }

    fetchUserProfile();
  }, [token, navigate]);

  const initialCar =
    state.car ||
    vehicleData.find((v) => String(v.id) === String(paramId)) ||
    vehicleData[0];

  const [pickup, setPickup] = useState(state.pickup || "");
  const [dropoff, setDropoff] = useState(state.dropoff || "");
  const [pickupDate, setPickupDate] = useState(
    state.pickupDate || "2025-10-01T10:00"
  );
  const [dropoffDate, setDropoffDate] = useState(
    state.dropoffDate || "2025-10-04T10:00"
  );

  const [car] = useState(initialCar);

  const [roadCare, setRoadCare] = useState(true);
  const [additionalDriver, setAdditionalDriver] = useState(false);
  const [childSeat, setChildSeat] = useState(false);

  const roadCareFlat = 300;
  const additionalDriverFlat = 200;
  const childSeatFlat = 150;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [howFound, setHowFound] = useState("GOOGLE SEARCH");
  const [travelReason, setTravelReason] = useState("Leisure");

  const days = daysBetween(pickupDate, dropoffDate);
  const vehicleSubtotal = car.pricePerDay * days;
  const roadCareTotal = roadCare ? roadCareFlat : 0;
  const addDriverTotal = additionalDriver ? additionalDriverFlat : 0;
  const childSeatTotal = childSeat ? childSeatFlat : 0;
  const grandTotal = vehicleSubtotal + roadCareTotal + addDriverTotal + childSeatTotal;

    useEffect(() => {
  const now = new Date();
  const minPickup = new Date(now.getTime() + 60 * 60 * 1000);
  if (new Date(pickupDate) < minPickup) {
    const newPickup = minPickup.toISOString().slice(0, 16);
    setPickupDate(newPickup);
  }

  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  if (dropoff <= pickup) {
    const newDropoff = new Date(pickup.getTime() + 24 * 60 * 60 * 1000);
    setDropoffDate(newDropoff.toISOString().slice(0, 16));
  }
}, [pickupDate, dropoffDate]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/locations`);
        const data = await res.json();
        setLocations(data);
        if (!state.pickup && data.length > 0) setPickup(data[0].name);
        if (!state.dropoff && data.length > 0) setDropoff(data[0].name);
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    }
    fetchLocations();
  }, [state.pickup, state.dropoff]);

  const step1Valid = useMemo(
    () => dropoff && new Date(dropoffDate) > new Date(pickupDate),
    [dropoff, pickupDate, dropoffDate]
  );
  const step2Valid = useMemo(() => !!car, [car]);
  const step3Valid = useMemo(
    () =>
      firstName.trim() &&
      lastName.trim() &&
      /\S+@\S+\.\S+/.test(email) &&
      phone.trim(),
    [firstName, lastName, email, phone]
  );

  const goNext = async () => {
    if (step === 0 && !step1Valid)
      return alert("Please set valid pickup & dropoff dates.");
    if (step === 1 && !step2Valid) return alert("Select a vehicle.");
    if (step === 2 && !step3Valid) return alert("Fill hirer details.");

    if (step === 2) {
      try {
        const pickupLoc = locations.find((l) => l.name === pickup);
        const dropoffLoc = locations.find((l) => l.name === dropoff);
        if (!pickupLoc || !dropoffLoc)
          throw new Error("Invalid pickup or dropoff location");

        const dto = {
          carId: car.id,
          pickupAt: new Date(pickupDate).toISOString(),
          dropoffAt: new Date(dropoffDate).toISOString(),
          pickupLocationId: pickupLoc.id,
          dropoffLocationId: dropoffLoc.id,
          roadCare,
          additionalDriver,
          childSeat,
        };

        const res = await createReservation(dto);
        setReservationId(res.reservationId);
        setDialogMessage("✅ Reservation created successfully! Proceed to payment.");
        setDialogOpen(true);
        setStep(3);
        return;
      } catch (err) {
        console.error("Error creating reservation:", err);
        setDialogMessage(`❌ Failed: ${err.message}`);
        setDialogOpen(true);
        return;
      }
    }

    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  //  STRIPE CHECKOUT INTEGRATION
  const handleConfirmPayment = async () => {
    if (!reservationId) {
      setDialogMessage("Reservation not found. Please go back and create reservation again.");
      setDialogOpen(true);
      return;
    }

    try {
      setDialogMessage("Processing payment... Please wait.");
      setDialogOpen(true);

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reservationId: reservationId,
            amount: grandTotal,
                paymentMethod: "Stripe",

          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create Stripe checkout session");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
      } else {
        throw new Error("Invalid checkout URL");
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
      setDialogMessage(`❌ Payment initialization failed: ${err.message}`);
      setDialogOpen(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight={800}>
          Book your vehicle
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {["1", "2", "3", "4"].map((n, idx) => (
            <Box
              key={n}
              onClick={() => setStep(idx)}
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: idx === step ? "primary.main" : "grey.200",
                color: idx === step ? "common.white" : "text.primary",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {n}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 4, flexDirection: { xs: "column", md: "row" } }}>
        {/* Left Side (Steps) */}
        <Box sx={{ flex: 1 }}>
          {/* Step 1 */}
          {step === 0 && (
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                1. Trip details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField select label="Pick-up location" value={pickup} onChange={(e) => setPickup(e.target.value)} fullWidth disabled>
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.name}>
                        {loc.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select label="Drop-off location" value={dropoff} onChange={(e) => setDropoff(e.target.value)} fullWidth>
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.name}>
                        {loc.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField type="datetime-local" label="Pick-up Date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} fullWidth  disabled/>
                </Grid>
                <Grid item xs={12} sm={6}>
  <TextField
    type="datetime-local"
    label="Drop-off Date"
    value={dropoffDate}
    onChange={(e) => setDropoffDate(e.target.value)}
    fullWidth
  />
</Grid>
              </Grid>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button variant="contained" onClick={goNext}>
                  Next
                </Button>
              </Box>
            </Paper>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                2. Vehicle & Extras
              </Typography>
              <Card variant="outlined" sx={{ display: "flex", mb: 3 }}>
                <CardMedia component="img" image={resolveImageUrl(car.imageUrl)} sx={{ width: 200, objectFit: "cover" }} />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} color="black">
                    {car.make} {car.model}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {car.year} • {car.seats} seats • {car.fuelType} • {car.transmission}
                  </Typography>
                  <Typography fontWeight={700} fontSize="1.1rem" color="primary">
                    {formatCurrencyINR(car.pricePerDay)}/day
                  </Typography>
                </CardContent>
              </Card>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography fontWeight={600} gutterBottom>
                  Add-ons
                </Typography>
                <FormControlLabel control={<Checkbox checked={roadCare} onChange={(e) => setRoadCare(e.target.checked)} />} label={`Road Care (+${formatCurrencyINR(300)})`} />
                <FormControlLabel control={<Checkbox checked={additionalDriver} onChange={(e) => setAdditionalDriver(e.target.checked)} />} label={`Additional Driver (+${formatCurrencyINR(200)})`} />
                <FormControlLabel control={<Checkbox checked={childSeat} onChange={(e) => setChildSeat(e.target.checked)} />} label={`Child Seat (+${formatCurrencyINR(150)})`} />
              </Paper>
              <Typography fontWeight={600}>Subtotal: {formatCurrencyINR(grandTotal)}</Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button onClick={goBack}>Back</Button>
                <Button variant="contained" onClick={goNext}>
                  Next
                </Button>
              </Box>
            </Paper>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight={700}>
                3. Hirer Details
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                The Hirer's name must match the name on the driver licence and credit/debit card
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Driver License Number"
                    value={driverLicenseNumber}
                    onChange={(e) => setDriverLicenseNumber(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField select label="How did you find us?" value={howFound} onChange={(e) => setHowFound(e.target.value)} fullWidth>
                    {["GOOGLE SEARCH", "FRIEND", "SOCIAL", "OTHER"].map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Travel reason</FormLabel>
                    <RadioGroup row value={travelReason} onChange={(e) => setTravelReason(e.target.value)}>
                      <FormControlLabel value="Leisure" control={<Radio />} label="Leisure" />
                      <FormControlLabel value="Business" control={<Radio />} label="Business" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button onClick={goBack}>Back</Button>
                <Button variant="contained" onClick={goNext}>
                  Make Reservation & Pay
                </Button>
              </Box>
            </Paper>
          )}

          {/* Step 4 */}
          {step === 3 && (
  <Paper sx={{ p: 4, borderRadius: 2 }}>
    <Typography variant="h5" gutterBottom fontWeight={700}>
      4. Payment
    </Typography>
    <Typography variant="body2" color="text.secondary" mb={3}>
      You’ll be securely redirected to Stripe Checkout to complete your payment.
    </Typography>

    {/* Timer Section */}
    <PaymentCountdown
      reservationId={reservationId}
      onExpire={() => {
        setDialogMessage("⏰ Payment session expired! Your reservation was automatically cancelled.");
        setDialogOpen(true);
        setStep(0);
      }}
    />

    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
      <Button onClick={goBack}>Back</Button>
      <Button
        variant="contained"
        startIcon={<PaymentIcon />}
        onClick={handleConfirmPayment}
        disabled={!reservationId}
      >
        Pay {formatCurrencyINR(grandTotal)}
      </Button>
    </Box>
  </Paper>
)}

        </Box>

        {/* Right Side (Summary) */}
        <Box sx={{ width: { xs: "100%", md: 380 }, flexShrink: 0 }}>
          <Paper sx={{ p: 3, borderRadius: 2, position: "sticky", top: 100 }}>
            <Typography variant="h6" mb={2} fontWeight={700} color="black">
              Booking Summary
            </Typography>
            <Typography fontWeight={700} color="primary.main">Pick-up</Typography>
            <Typography>{pickup}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {new Date(pickupDate).toLocaleDateString()} {new Date(pickupDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Typography>
            <Typography fontWeight={700} sx={{ color: "success.main" }}>Drop-off</Typography>
            <Typography>{dropoff}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {new Date(dropoffDate).toLocaleDateString()} {new Date(dropoffDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <CardMedia component="img" image={resolveImageUrl(car.imageUrl) || car.img} sx={{ width: 100, borderRadius: 1 }} />
              <Box>
                <Typography fontWeight={600}>{car.make} {car.model}</Typography>
                <Typography variant="body2" color="text.secondary">{formatCurrencyINR(car.pricePerDay)}/day × {days} days</Typography>
                <Typography color="error.main" fontWeight={700}>{formatCurrencyINR(vehicleSubtotal)}</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography>Basic Insurance: Free</Typography>
            <Typography>Road Care: {roadCare ? formatCurrencyINR(roadCareTotal) : "₹0"}</Typography>
            <Typography>Additional Driver: {additionalDriver ? formatCurrencyINR(addDriverTotal) : "₹0"}</Typography>
            <Typography>Child Seat: {childSeat ? formatCurrencyINR(childSeatTotal) : "₹0"}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="black" fontWeight={700}>
              Grand Total:
              <Typography variant="h4" color="error.main" fontWeight="700">{formatCurrencyINR(grandTotal)} /-</Typography>
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle color="black">Reservation Status</DialogTitle>
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
