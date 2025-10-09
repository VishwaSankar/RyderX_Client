import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  MenuItem,
  Slider,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { resolveImageUrl } from "../utils/imageHelper";

const API_URL = `${import.meta.env.VITE_API_URL}/cars`;

const cities = [
  "Kempegowda International Airport",
  "Majestic Bus Stand",
  "KSR Railway Station",
  "Indiranagar",
  "Whitefield",
  "Electronic City",
  "Koramangala",
  "Brigade Road",
];

export default function Vehicles() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate();

  const now = new Date();
  const defaultPickup = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    now.getHours(),
    now.getMinutes()
  );
  const defaultDropoff = new Date(defaultPickup.getTime() + 24 * 60 * 60 * 1000);

  const initialPickup = queryParams.get("pickup") || "Kempegowda International Airport";
  const initialDropoff = queryParams.get("dropoff") || "Kempegowda International Airport";
  const initialPickupDate = queryParams.get("pickupDate") || defaultPickup.toISOString().slice(0, 16);
  const initialDropoffDate = queryParams.get("dropoffDate") || defaultDropoff.toISOString().slice(0, 16);

  const [pickup, setPickup] = useState(initialPickup);
  const [dropoff, setDropoff] = useState(initialDropoff);
  const [pickupDate, setPickupDate] = useState(initialPickupDate);
  const [dropoffDate, setDropoffDate] = useState(initialDropoffDate);

  const [cars, setCars] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);

  const [priceRange, setPriceRange] = useState([1000, 3000]);
  const [category, setCategory] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [minSeats, setMinSeats] = useState("");
  const [make, setMake] = useState("");
  const [availability, setAvailability] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);

  // 🚗 Fetch cars
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get(API_URL);
        setCars(res.data);
      } catch (err) {
        console.error("Error fetching cars:", err);
      }
    };
    fetchCars();
  }, []);

  // 🔍 Filter cars
  useEffect(() => {
    const filtered = cars.filter(
      (car) =>
        car.locationName === pickup &&
        car.pricePerDay >= priceRange[0] &&
        car.pricePerDay <= priceRange[1] &&
        (category ? car.category === category : true) &&
        (fuelType ? car.fuelType === fuelType : true) &&
        (transmission ? car.transmission === transmission : true) &&
        (minSeats ? car.seats >= parseInt(minSeats) : true) &&
        (make ? car.make === make : true) &&
        (availability ? car.isAvailable === (availability === "Available") : true)
    );
    setFilteredVehicles(filtered);
  }, [
    cars,
    pickup,
    priceRange,
    category,
    fuelType,
    transmission,
    minSeats,
    make,
    availability,
  ]);

  const handleBook = (car) => {
    navigate(`/book/${car.id}`, {
      state: { car, pickup, dropoff, pickupDate, dropoffDate },
    });
  };

  // 🧭 Search validation
  const handleSearch = () => {
    const pickupTime = new Date(pickupDate);
    const dropoffTime = new Date(dropoffDate);
    const minPickup = defaultPickup;

    if (pickupTime < minPickup) {
      alert("Pickup date must be at least 1 day after today.");
      return;
    }

    if (dropoffTime <= pickupTime) {
      alert("Drop-off date must be after pickup date.");
      return;
    }

    navigate(
      `/vehicles?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(
        dropoff
      )}&pickupDate=${encodeURIComponent(pickupDate)}&dropoffDate=${encodeURIComponent(
        dropoffDate
      )}`
    );
  };

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Home &gt; Vehicles
      </Typography>

      <Typography
        variant="h4"
        fontWeight={800}
        fontFamily="Montserrat, sans-serif"
        gutterBottom
      >
        Vehicles for rent in {pickup}
      </Typography>

      {/* Booking Form */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <TextField
            select
            label="Pick-up"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            sx={{ minWidth: 250 }}
          >
            {cities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Drop-off"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            sx={{ minWidth: 250 }}
          >
            {cities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>

          {/* Pickup Date */}
          <TextField
            type="datetime-local"
            label="Pick-up Date & Time"
            value={pickupDate}
            onChange={(e) => {
              const newPickup = new Date(e.target.value);
              const newDrop = new Date(newPickup.getTime() + 24 * 60 * 60 * 1000);
              setPickupDate(e.target.value);
              setDropoffDate(newDrop.toISOString().slice(0, 16));
            }}
            inputProps={{
              min: defaultPickup.toISOString().slice(0, 16),
            }}
          />

          {/* Drop-off Date */}
          <TextField
            type="datetime-local"
            label="Drop-off Date & Time"
            value={dropoffDate}
            onChange={(e) => setDropoffDate(e.target.value)}
            inputProps={{
              min: new Date(
                new Date(pickupDate).getTime() + 24 * 60 * 60 * 1000
              )
                .toISOString()
                .slice(0, 16),
            }}
          />

          <Button
            variant="contained"
            color="secondary"
            sx={{ borderRadius: "30px", px: 4 }}
            onClick={handleSearch}
          >
            Search my car
          </Button>
        </Box>
      </Paper>

      {/* Filters */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          boxShadow: "0px 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Typography sx={{ fontWeight: 600, fontSize: "1rem", mb: 1 }}>
              Price per Day (₹)
            </Typography>
            <Slider
              value={priceRange}
              onChange={(e, newValue) => setPriceRange(newValue)}
              valueLabelDisplay="auto"
              min={1000}
              max={8000}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Small cars">Small cars</MenuItem>
              <MenuItem value="Electric vehicles">Electric vehicles</MenuItem>
              <MenuItem value="Hybrid cars">Hybrid cars</MenuItem>
              <MenuItem value="SUVs">SUVs</MenuItem>
              <MenuItem value="Sedans">Sedans</MenuItem>
              <MenuItem value="Jeeps">Jeeps</MenuItem>
              <MenuItem value="Luxury">Luxury</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Fuel Type"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              fullWidth
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Petrol">Petrol</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
              <MenuItem value="Electric">Electric</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Transmission"
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              fullWidth
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Manual">Manual</MenuItem>
              <MenuItem value="Automatic">Automatic</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Min Seats"
              type="number"
              value={minSeats}
              onChange={(e) => setMinSeats(e.target.value)}
              fullWidth
              sx={{ minWidth: 200 }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              fullWidth
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Unavailable">Unavailable</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Vehicle Cards */}
      <Grid container spacing={3}>
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((car) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={car.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                onClick={() => setSelectedCar(car)}
                sx={{
                  width: 320,
                  borderRadius: 4,
                  backgroundColor: "#fff",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={resolveImageUrl(car.imageUrl)}
                  alt={car.model}
                  sx={{ height: 180, objectFit: "cover" }}
                />
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {car.make} {car.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {car.year
                      ? `${new Date().getFullYear() - car.year} year(s) old`
                      : "1 - 3 year(s) old"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                      color: "text.secondary",
                    }}
                  >
                    <DirectionsCarIcon sx={{ fontSize: 20, color: "#616161" }} />
                    <Typography
                      variant="body2"
                      sx={{ textTransform: "capitalize", fontWeight: 600 }}
                    >
                      {car.category || "Vehicle"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 1,
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="h5" color="secondary" fontWeight={800}>
                        ₹{car.pricePerDay}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {" "}
                          /day
                        </Typography>
                      </Typography>
                    </Box>
                   {car.isAvailable ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(car);
                        }}
                        sx={{
                          backgroundColor: "#d81b60",
                          color: "#fff",
                          fontWeight: 600,
                          borderRadius: "20px",
                          textTransform: "none",
                          px: 2.5,
                          py: 0.7,
                          "&:hover": {
                            backgroundColor: "#ad1457",
                            boxShadow: "0 0 10px rgba(216,27,96,0.5)",
                          },
                        }}
                      >
                        Book now
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          borderRadius: "20px",
                          color: "#999",
                          borderColor: "#ccc",
                          textTransform: "none",
                          px: 2.5,
                          py: 0.7,
                          fontWeight: 600,
                        }}
                      >
                        Sold Out
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <SettingsIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          {car.transmission}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocalGasStationIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          {car.fuelType}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        fontWeight: 600,
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      + info
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ width: "100%" }}
          >
            No vehicles match your filters 🚗
          </Typography>
        )}
      </Grid>

      {/* Car Dialog */}
      {selectedCar && (
        <Dialog
          open={!!selectedCar}
          onClose={() => setSelectedCar(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent sx={{ position: "relative", p: 3 }}>
            <IconButton
              onClick={() => setSelectedCar(null)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h5" fontWeight={800} gutterBottom>
              {selectedCar.make} {selectedCar.model}
            </Typography>

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <img
                src={selectedCar.imageUrl || "https://via.placeholder.com/400x250"}
                alt={selectedCar.model}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: 8,
                  objectFit: "cover",
                }}
              />

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Vehicle Info
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label={`${selectedCar.year} Model`} />
                </Box>

                <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DirectionsCarIcon fontSize="small" />
                    <Typography>{selectedCar.category}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocalGasStationIcon fontSize="small" />
                    <Typography>{selectedCar.fuelType}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SettingsIcon fontSize="small" />
                    <Typography>{selectedCar.transmission}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PeopleIcon fontSize="small" />
                    <Typography>{selectedCar.seats} Seats</Typography>
                  </Box>
                </Box>

                <Typography variant="h6" color="secondary" fontWeight={800} mt={2}>
                  ₹{selectedCar.pricePerDay}/day
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Booking Details
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnIcon fontSize="small" />
                  <Typography>Pickup: {pickup}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography>{new Date(pickupDate).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnIcon fontSize="small" />
                  <Typography>Dropoff: {dropoff}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography>{new Date(dropoffDate).toLocaleString()}</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              {selectedCar.isAvailable ? (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => handleBook(selectedCar)}
                >
                  Book Now
                </Button>
              ) : (
                <Button variant="outlined" color="error" fullWidth disabled>
                  Sold Out
                </Button>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
}
