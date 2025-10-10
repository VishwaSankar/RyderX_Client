import { Container, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <Container sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h4" color="error" fontWeight={700}>
        Payment Cancelled
      </Typography>
      <Typography sx={{ mt: 2 }}>You can try the payment again anytime.</Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}
