import * as React from "react";
import {
  Box,
  Button,
  CssBaseline,
  FormLabel,
  FormControl,
  Link,
  TextField,
  Typography,
  Stack,
  Card,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Card styling
const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

const RegisterContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  justifyContent: "center",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  background: "radial-gradient(circle at 50% 50%, #f7f9fc, #ffffff)",
}));

export default function Register() {
  const { register } = useContext(AuthContext);

  const [errors, setErrors] = React.useState({});
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.firstName) {
      newErrors.firstName = "First name is required.";
      isValid = false;
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email.";
      isValid = false;
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs()) return;

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      console.log("Registration successful ✅");
    } catch (err) {
      console.error("Registration failed ❌", err);
    }
  };

  return (
    <>
      <CssBaseline />
      <RegisterContainer direction="column">
        <StyledCard variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", textAlign: "center" }}
          >
            Sign up
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            {/* First Name */}
            <FormControl>
              <FormLabel htmlFor="firstName">First Name</FormLabel>
              <TextField
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            {/* Last Name */}
            <FormControl>
              <FormLabel htmlFor="lastName">Last Name</FormLabel>
              <TextField
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </FormControl>

            {/* Phone Number */}
            <FormControl>
              <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>
              <TextField
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </FormControl>

            {/* Email */}
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            {/* Password */}
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            {/* Confirm Password */}
            <FormControl>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <TextField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            {/* Role */}
            <FormControl>
              <FormLabel htmlFor="role">Role</FormLabel>
              <TextField
                id="role"
                name="role"
                select
                value={formData.role}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Agent">Agent</MenuItem>
              </TextField>
            </FormControl>

            <Button type="submit" fullWidth variant="contained">
              Sign up
            </Button>

            <Typography sx={{ textAlign: "center", mt: 2 }}>
              Already have an account?{" "}
              <Link href="/login" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>
        </StyledCard>
      </RegisterContainer>
    </>
  );
}
