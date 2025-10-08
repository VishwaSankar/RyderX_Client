import { Box, Container, Divider, Typography, Link, Stack, IconButton } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        color: "#333",
        py: 5,
        mt: 8,
        borderTop: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={4}
        >
          {/* Left side: Brand info */}
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ color: "#d81b60", mb: 1 }}
            >
              RyderX
            </Typography>
            <Typography variant="body2" sx={{ color: "#555", maxWidth: 320 }}>
              Drive Bangalore your way — seamless self-drive rentals, trusted service,
              and a ride that’s truly yours.
            </Typography>
          </Box>

          {/* Center links */}
          <Stack
            direction="row"
            spacing={3}
            sx={{
              "& a": {
                fontWeight: 600,
                color: "#333",
                textDecoration: "none",
                transition: "0.2s",
              },
              "& a:hover": {
                color: "#d81b60",
              },
            }}
          >
            <Link href="/about">About</Link>
            <Link href="/vehicles">Vehicles</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/faq">FAQ</Link>
          </Stack>

          {/* Right side: Socials */}
          <Stack direction="row" spacing={1.5}>
            <IconButton
              href="https://instagram.com/"
              target="_blank"
              sx={{
                color: "#d81b60",
                "&:hover": { transform: "scale(1.15)" },
                transition: "0.2s",
              }}
            >
              <InstagramIcon />
            </IconButton>
            <IconButton
              href="https://youtube.com/"
              target="_blank"
              sx={{
                color: "#d81b60",
                "&:hover": { transform: "scale(1.15)" },
                transition: "0.2s",
              }}
            >
              <YouTubeIcon />
            </IconButton>
            <IconButton
              href="https://linkedin.com/"
              target="_blank"
              sx={{
                color: "#d81b60",
                "&:hover": { transform: "scale(1.15)" },
                transition: "0.2s",
              }}
            >
              <LinkedInIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Divider sx={{ my: 4, borderColor: "rgba(0,0,0,0.08)" }} />

        <Typography
          variant="body2"
          align="center"
          sx={{ color: "#777", fontSize: "0.9rem" }}
        >
          © {year} <strong style={{ color: "#d81b60" }}>RyderX</strong>. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
