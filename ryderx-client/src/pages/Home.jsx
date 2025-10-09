import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllLocations } from "../services/locationService";

export default function Home() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [locations, setLocations] = useState([]);

  const now = new Date();
  const defaultPickup = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    now.getHours(),
    now.getMinutes()
  );
  const defaultDropoff = new Date(defaultPickup.getTime() + 24 * 60 * 60 * 1000);

  const [pickupDate, setPickupDate] = useState(defaultPickup.toISOString().slice(0, 16));
  const [dropoffDate, setDropoffDate] = useState(defaultDropoff.toISOString().slice(0, 16));

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
    const pickupTime = new Date(pickupDate);
    const dropoffTime = new Date(dropoffDate);

    if (pickupTime < defaultPickup) {
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

  // ✅ Animation Variants for smooth easing
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 },
    },
  };

  const glassField = {
    "& .MuiOutlinedInput-root": {
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(10px)",
      borderRadius: "10px",
      color: "#fff",
      fontWeight: 500,
      "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
      "&:hover fieldset": { borderColor: "#fff" },
      "&.Mui-focused fieldset": {
        borderColor: "#d81b60",
        boxShadow: "0 0 10px rgba(216,27,96,0.6)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.9)",
      fontWeight: 500,
    },
    "& .MuiSelect-icon": { color: "#fff" },
  };

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
          "&:hover": { background: "rgba(216,27,96,0.25)" },
        },
      },
    },
  };

  return (
    <>
      {/* HERO SECTION */}
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
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp}>
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
            </motion.div>

            <motion.div variants={fadeUp}>
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
            </motion.div>

            <motion.div variants={fadeUp}>
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
                      onChange={(e) => {
                        const newPickup = new Date(e.target.value);
                        const newDrop = new Date(newPickup.getTime() + 24 * 60 * 60 * 1000);
                        setPickupDate(e.target.value);
                        setDropoffDate(newDrop.toISOString().slice(0, 16));
                      }}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                        style: { color: "rgba(255,255,255,0.85)", fontWeight: 500 },
                      }}
                      InputProps={{ style: { color: "#fff", fontWeight: 500 } }}
                      inputProps={{
                        min: defaultPickup.toISOString().slice(0, 16),
                      }}
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
                      InputProps={{ style: { color: "#fff", fontWeight: 500 } }}
                      inputProps={{
                        min: new Date(
                          new Date(pickupDate).getTime() + 24 * 60 * 60 * 1000
                        )
                          .toISOString()
                          .slice(0, 16),
                      }}
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
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      {/* ABOUT SECTION */}
      <Box sx={{ backgroundColor: "#fff", py: 10 }}>
        <Container maxWidth="md">
          <Divider sx={{ mb: 6, borderColor: "rgba(0,0,0,0.1)" }} />
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              fontWeight={800}
              textAlign="center"
              sx={{
                mb: 2,
                fontFamily: "Montserrat, sans-serif",
                color: "#d81b60",
              }}
            >
              About RyderX
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              sx={{
                maxWidth: 800,
                mx: "auto",
                color: "#555",
                fontFamily: "Poppins, sans-serif",
                lineHeight: 1.6,
                mb: 6,
              }}
            >
              RyderX is a next-generation car rental platform built to make self-drive rentals easy,
              transparent, and exciting. Whether you're exploring the city or planning a long trip, 
              RyderX ensures a smooth and reliable experience — from booking to return.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* WHY CHOOSE SECTION */}
      <Box sx={{ py: 10, backgroundColor: "#fdf1f6" }}>
        <Container maxWidth="lg">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Typography
              variant="h4"
              fontWeight={800}
              textAlign="center"
              sx={{ color: "#d81b60", mb: 6 }}
            >
              Why Choose RYDRX
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              {[
                {
                  icon: <DirectionsCarIcon sx={{ fontSize: 40, color: "#d81b60" }} />,
                  title: "Wide Car Selection",
                  text: "From compact city cars to luxury SUVs, RYDRX has the right vehicle for every trip.",
                },
                {
                  icon: <SecurityIcon sx={{ fontSize: 40, color: "#d81b60" }} />,
                  title: "Trusted & Safe",
                  text: "All vehicles are verified, insured, and regularly serviced for your safety.",
                },
                {
                  icon: <LocalOfferIcon sx={{ fontSize: 40, color: "#d81b60" }} />,
                  title: "Transparent Pricing",
                  text: "No surprises. You see what you pay for — clear, upfront pricing with no hidden costs.",
                },
                {
                  icon: <SupportAgentIcon sx={{ fontSize: 40, color: "#d81b60" }} />,
                  title: "24/7 Support",
                  text: "Our dedicated support team is always here to help — anytime, anywhere.",
                },
                {
                  icon: <EmojiEventsIcon sx={{ fontSize: 40, color: "#d81b60" }} />,
                  title: "Reward System",
                  text: "Earn points and exclusive deals every time you book with RYDRX.",
                },
              ].map((feature, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: 4,
                      height: "100%",
                      backgroundColor: "#fff",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#555", lineHeight: 1.6 }}
                    >
                      {feature.text}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </>
  );
}
