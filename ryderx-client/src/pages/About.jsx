import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SecurityIcon from "@mui/icons-material/Security";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SpeedIcon from "@mui/icons-material/Speed";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fff 0%, #fdf1f6 100%)",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
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
              lineHeight: 1.7,
              mb: 8,
            }}
          >
            RyderX is a next-generation car rental platform built to make
            self-drive rentals easy, transparent, and exciting. Whether you're
            exploring the city or planning a long trip, RyderX ensures a smooth
            and reliable experience — from booking to return.
          </Typography>
        </motion.div>

        {/* What You Can Do Section */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            sx={{
              color: "#222",
              mb: 5,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            What You Can Do on RyderX
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {[
              {
                icon: <DirectionsCarIcon sx={{ fontSize: 42, color: "#d81b60" }} />,
                title: "Book Self-Drive Cars",
                text: "Choose from a wide range of vehicles — from hatchbacks to SUVs and luxury rides.",
              },
              {
                icon: <SpeedIcon sx={{ fontSize: 42, color: "#d81b60" }} />,
                title: "Seamless Vehicle Search",
                text: "Pick your locations, set your times, and find the best cars instantly with real-time availability.",
              },
              {
                icon: <LocalOfferIcon sx={{ fontSize: 42, color: "#d81b60" }} />,
                title: "Transparent Pricing",
                text: "No hidden charges. What you see is what you pay — all taxes and add-ons included upfront.",
              },
              {
                icon: <SecurityIcon sx={{ fontSize: 42, color: "#d81b60" }} />,
                title: "Secure Payments",
                text: "Pay safely through Stripe — a globally trusted and secure payment gateway.",
              },
              {
                icon: <SupportAgentIcon sx={{ fontSize: 42, color: "#d81b60" }} />,
                title: "24/7 Customer Support",
                text: "Need help? Our team is ready to assist you — before, during, and after your trip.",
              },
              {
                icon: <EmojiEventsIcon sx={{ fontSize: 42, color: "#d81b60" }} />,
                title: "Earn Rewards",
                text: "Frequent user? Enjoy exclusive offers, loyalty discounts, and premium upgrades.",
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    height: "100%",
                    textAlign: "center",
                    borderRadius: 4,
                    background: "#fff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 8px 26px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>{item.icon}</Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    sx={{ color: "#222" }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#555",
                      fontFamily: "Poppins, sans-serif",
                      lineHeight: 1.7,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Box sx={{ mt: { xs: 8, md: 12 }, textAlign: "center" }}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="#222"
              sx={{
                mb: 5,
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Why Choose RyderX?
            </Typography>

            {/* Centered Cards Grid */}
            <Grid container spacing={4} justifyContent="center">
              {[
                {
                  icon: <SecurityIcon sx={{ fontSize: 42, color: "#d81b60" }} />,
                  title: "Top-Notch Safety",
                  text: "All cars are thoroughly inspected and sanitized before each trip to ensure maximum safety.",
                },
                {
                  icon: <DirectionsCarIcon sx={{ fontSize: 42, color: "#d81b60" }} />,
                  title: "Variety of Choices",
                  text: "Compact cars for the city or SUVs for the long drive — we’ve got it all.",
                },
                {
                  icon: <EmojiEventsIcon sx={{ fontSize: 42, color: "#d81b60" }} />,
                  title: "Customer Satisfaction",
                  text: "Our commitment to excellence has made us one of the most trusted rental services in the region.",
                },
              ].map((feature, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 4,
                      height: "100%",
                      borderRadius: 4,
                      backgroundColor: "#fff",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 8px 26px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      sx={{ color: "#222" }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#555",
                        fontFamily: "Poppins, sans-serif",
                        lineHeight: 1.7,
                      }}
                    >
                      {feature.text}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Call to Action */}
            <Box sx={{ mt: 6 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#555",
                  maxWidth: 800,
                  mx: "auto",
                  mb: 4,
                  fontFamily: "Poppins, sans-serif",
                  lineHeight: 1.6,
                }}
              >
                From the moment you visit our website to the time you drop off
                your vehicle, we’ve designed every step to be fast, safe, and
                customer-first. Our mission is simple —{" "}
                <strong>
                  to put the power of the drive back in your hands.
                </strong>
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/vehicles")}
                sx={{
                  backgroundColor: "#d81b60",
                  borderRadius: "30px",
                  px: 4,
                  py: 1.3,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: "#ad1457",
                    boxShadow: "0 0 15px rgba(216,27,96,0.4)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Start Exploring
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
