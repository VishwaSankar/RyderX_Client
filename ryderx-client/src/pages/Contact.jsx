import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import SubjectIcon from "@mui/icons-material/Subject";
import MessageIcon from "@mui/icons-material/Message";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate EmailJS or backend mail API here
    console.log("Form Submitted:", formData);
    setSubmitted(true);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        py: 10,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          <motion.div variants={fadeUp}>
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
              Contact RYDRX
            </Typography>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Typography
              variant="h6"
              textAlign="center"
              sx={{
                mb: 6,
                color: "#555",
                fontFamily: "Poppins, sans-serif",
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Have a question, partnership idea, or want to become an agent?  
              Reach out to us and we’ll get back to you within 24 hours.
            </Typography>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Paper
              elevation={4}
              sx={{
                p: 5,
                borderRadius: 4,
                backgroundColor: "#fafafa",
                boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
              }}
            >
              {submitted ? (
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    color: "#2e7d32",
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  ✅ Message Sent Successfully!  
                  <br />
                  We’ll contact you soon.
                </Typography>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Name */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ color: "#d81b60", mr: 1 }} />,
                        }}
                      />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ color: "#d81b60", mr: 1 }} />,
                        }}
                      />
                    </Grid>

                    {/* Subject */}
                    <Grid item xs={12}>
                      <TextField
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: <SubjectIcon sx={{ color: "#d81b60", mr: 1 }} />,
                        }}
                      />
                    </Grid>

                    {/* Message */}
                    <Grid item xs={12}>
                      <TextField
                        label="Message"
                        name="message"
                        multiline
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: <MessageIcon sx={{ color: "#d81b60", mr: 1 }} />,
                        }}
                      />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{
                          backgroundColor: "#d81b60",
                          py: 1.5,
                          fontWeight: 700,
                          borderRadius: "10px",
                          textTransform: "none",
                          fontSize: "1rem",
                          transition: "0.3s",
                          "&:hover": {
                            backgroundColor: "#ad1457",
                            boxShadow: "0 0 20px rgba(216,27,96,0.4)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Paper>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}
