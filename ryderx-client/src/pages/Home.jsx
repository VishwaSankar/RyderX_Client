import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllLocations } from "../services/locationService";

export default function Home() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [locations, setLocations] = useState([]);

  // Default dates
  const now = new Date();
  const defaultPickup = new Date(now.getTime() + 60 * 60 * 1000);
  const defaultDropoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [pickupDate, setPickupDate] = useState(defaultPickup.toISOString().slice(0, 16));
  const [dropoffDate, setDropoffDate] = useState(defaultDropoff.toISOString().slice(0, 16));

  // Load locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getAllLocations();
        setLocations(data);
        if (data.length > 0) {
          setPickup(data[0].name);
          setDropoff(data[0].name);
        }
      } catch (err) {
        console.error("Failed to load locations:", err.message);
      }
    };
    fetchLocations();
  }, []);

  const handleSearch = () => {
    navigate(
      `/vehicles?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(
        dropoff
      )}&pickupDate=${encodeURIComponent(pickupDate)}&dropoffDate=${encodeURIComponent(
        dropoffDate
      )}`
    );
  };

  // Shared field style
  const glassField = {
    "& .MuiOutlinedInput-root": {
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(10px)",
      borderRadius: "10px",
      color: "#fff",
      fontWeight: 500,
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.4)",
      },
      "&:hover fieldset": {
        borderColor: "#fff",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#d81b60",
        boxShadow: "0 0 10px rgba(216,27,96,0.6)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.9)",
      fontWeight: 500,
    },
    "& .MuiSelect-icon": {
      color: "#fff",
    },
  };

  // Dropdown styling
  const menuProps = {
    PaperProps: {
      sx: {
        background: "rgba(25, 25, 25, 0.9)",
        backdropFilter: "blur(12px)",
        color: "#fff",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0px 8px 30px rgba(0,0,0,0.4)",
        "& .MuiMenuItem-root": {
          fontWeight: 500,
          transition: "0.2s",
          "&:hover": {
            background: "rgba(216,27,96,0.25)",
          },
        },
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)),
          url("https://images.unsplash.com/photo-1525609004556-c46c7d6cf023")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        color: "white",
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 2,
            fontFamily: "Montserrat, sans-serif",
            textAlign: "center",
          }}
        >
          Drive Bangalore Your Way
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 4,
            fontFamily: "Poppins, sans-serif",
            textAlign: "center",
            opacity: 0.9,
          }}
        >
          Book your car rental hassle-free. From airport pickups to city drives,{" "}
          <strong>RYDRX</strong> has you covered.
        </Typography>

        <Paper
          sx={{
            p: 4,
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(15px)",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0px 8px 30px rgba(0,0,0,0.2)",
          }}
        >
          <Grid container spacing={3}>
            {/* Pick-up Location */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Pick-up Location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                fullWidth
                variant="outlined"
                sx={glassField}
                SelectProps={menuProps}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.name}>
                    {loc.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Drop-off Location */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Drop-off Location"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                fullWidth
                variant="outlined"
                sx={glassField}
                SelectProps={menuProps}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.name}>
                    {loc.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Pick-up Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pick-up Date & Time"
                type="datetime-local"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                  style: { color: "rgba(255,255,255,0.85)", fontWeight: 500 },
                }}
                InputProps={{
                  style: { color: "#fff", fontWeight: 500 },
                }}
                inputProps={{ min: now.toISOString().slice(0, 16) }}
                sx={glassField}
              />
            </Grid>

            {/* Drop-off Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Drop-off Date & Time"
                type="datetime-local"
                value={dropoffDate}
                onChange={(e) => setDropoffDate(e.target.value)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                  style: { color: "rgba(255,255,255,0.85)", fontWeight: 500 },
                }}
                InputProps={{
                  style: { color: "#fff", fontWeight: 500 },
                }}
                inputProps={{ min: pickupDate }}
                sx={glassField}
              />
            </Grid>

            {/* Search Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSearch}
                sx={{
                  backgroundColor: "#d81b60",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  py: 1.5,
                  borderRadius: "10px",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "#ad1457",
                    boxShadow: "0 0 20px rgba(216,27,96,0.6)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Find My Car
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
