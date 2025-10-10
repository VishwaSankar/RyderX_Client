import { useSearchParams } from "react-router-dom";
import { Container, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const navigate = useNavigate();

  return (
    <Container sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h4" color="green" fontWeight={700}>
        Payment Successful
      </Typography>
      <Typography sx={{ mt: 2 }}>Your booking has been confirmed!</Typography>
      <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
        Session ID: {sessionId}
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </Box>
    </Container>
  );
}
