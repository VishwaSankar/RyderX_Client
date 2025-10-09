import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="md"
      sx={{
        textAlign: "center",
        py: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <ErrorOutlineIcon
        sx={{
          fontSize: 120,
          color: "#d81b60",
          mb: 3,
        }}
      />

      <Typography
        variant="h2"
        sx={{
          fontWeight: 800,
          color: "#333",
          mb: 2,
          fontSize: { xs: "2.5rem", md: "3.5rem" },
        }}
      >
        404
      </Typography>

      <Typography
        variant="h5"
        sx={{
          mb: 2,
          color: "#555",
          fontWeight: 500,
        }}
      >
        Oops! The page you're looking for doesn’t exist.
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          mb: 4,
          maxWidth: 500,
        }}
      >
        It might have been moved, deleted, or the URL might be incorrect.
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{
          backgroundColor: "#d81b60",
          textTransform: "none",
          fontWeight: 600,
          px: 4,
          py: 1,
          borderRadius: "50px",
          "&:hover": { backgroundColor: "#ad1457" },
        }}
      >
        Go Back Home
      </Button>
    </Container>
  );
}
