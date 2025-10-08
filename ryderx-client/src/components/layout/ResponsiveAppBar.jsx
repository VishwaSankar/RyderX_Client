import * as React from "react";
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  Container,
  Paper,
  Grow,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getUserProfile } from "../../services/authService";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LoginIcon from "@mui/icons-material/Login";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"; // ✅ Added car icon

const navLinks = [
  {
    label: "Vehicles",
    path: "/vehicles",
    submenu: [
      {
        label: "Small cars",
        path: "/vehicles/small",
        image: "https://cdn.pixabay.com/photo/2017/10/05/15/06/car-2819680_1280.jpg",
      },
      {
        label: "Electric vehicles",
        path: "/vehicles/electric",
        image: "https://cdn.pixabay.com/photo/2022/12/10/20/35/desert-7647700_1280.jpg",
      },
      {
        label: "Hybrid cars",
        path: "/vehicles/hybrid",
        image: "https://cdn.pixabay.com/photo/2020/06/07/20/49/toyota-rav-4-5272096_1280.jpg",
      },
      {
        label: "Large cars / SUVs",
        path: "/vehicles/suv",
        image: "https://cdn.pixabay.com/photo/2020/06/13/19/25/car-5295558_1280.jpg",
      },
      {
        label: "Jeeps",
        path: "/vehicles/4wd",
        image: "https://cdn.pixabay.com/photo/2017/07/19/00/30/jeep-2517549_1280.jpg",
      },
    ],
  },
  {
    label: "Locations",
    path: "/locations",
    submenu: [
      { label: "Kempegowda International Airport", image: "https://cdn.pixabay.com/photo/2019/09/05/15/25/airbus-4454338_1280.jpg" },
      { label: "Majestic Bus Stand", image: "https://cdn.pixabay.com/photo/2017/09/21/02/19/bus-2770364_1280.jpg" },
      { label: "KSR Railway Station", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/36/bb/40/platform-no-5.jpg?w=1200&h=-1&s=1" },
      { label: "Indiranagar", image: "https://static.wixstatic.com/media/3a848c_3bdd0aaa4d9d49f5b3c37b97c3645ed2~mv2.jpg/v1/fill/w_765,h_563,al_c,q_85/indiranagar%20bangalore.jpg" },
      { label: "Whitefield", image: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prestige_Shantiniketan_In_Whitefield_Main_Road.jpg" },
      { label: "Electronic City", image: "https://www.colive.com/blog/wp-content/uploads/2024/05/pg-in-Electronic-City-2.png" },
      { label: "Koramangala", image: "https://s1.dmcdn.net/v/NWumI1Qx4e3-aOnEf/x1080" },
      { label: "MG Road / Brigade Road", image: "https://www.hindustantimes.com/ht-img/img/2023/05/10/550x309/mg_road_1683712914635_1683712958627.png" },
    ],
  },
  { label: "Deals", path: "/deals" },
  { label: "Help", path: "/help" },
  { label: "About Us", path: "/about" },
];

function ResponsiveAppBar() {
  const { user, logout } = useContext(AuthContext);
  const [hovered, setHovered] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [profile, setProfile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (user) {
          const data = await getUserProfile();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    }
    fetchProfile();
  }, [user]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLocationClick = (locationLabel) => {
    navigate(`/vehicles?pickup=${encodeURIComponent(locationLabel)}&dropoff=${encodeURIComponent(locationLabel)}`);
    setMobileOpen(false);
  };
  const handleSubmenuClick = (label) => setOpenSubmenu(openSubmenu === label ? null : label);
  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleProfileSettings = () => {
    handleMenuClose();
    navigate("/profile");
  };
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <>
      {/* Top App Bar */}
      <AppBar position="static" sx={{ backgroundColor: "#f5f5f5", color: "#d81b60", boxShadow: "none" }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "flex-end", gap: 2.2, minHeight: "48px !important", px: { xs: 1, sm: 2 } }}>
            <Button startIcon={<MailOutlineIcon />} component={Link} to="/contact" sx={{ color: "#d81b60", textTransform: "none", fontWeight: 800 }}>
              Contact
            </Button>
            <Button startIcon={<AssignmentTurnedInIcon />} component={Link} to="/manage" sx={{ color: "#d81b60", textTransform: "none", fontWeight: 800 }}>
              My Booking
            </Button>

            {user && (
              <>
                {user.roles?.includes("User") && (
                  <Button startIcon={<AccountCircleIcon />} component={Link} to="/profile" sx={{ color: "#d81b60", textTransform: "none", fontWeight: 800 }}>
                    My Profile
                  </Button>
                )}
                {user.roles?.includes("Admin") && (
                  <Button startIcon={<AccountCircleIcon />} component={Link} to="/admin-dashboard" sx={{ color: "#d81b60", textTransform: "none", fontWeight: 800 }}>
                    Admin Dashboard
                  </Button>
                )}
                {user.roles?.includes("Agent") && (
                  <Button startIcon={<AccountCircleIcon />} component={Link} to="/agent-dashboard" sx={{ color: "#d81b60", textTransform: "none", fontWeight: 800 }}>
                    Agent Dashboard
                  </Button>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                    <Avatar
                      src={profile?.avatarUrl || "/default-avatar.png"}
                      alt={profile?.firstName || "User"}
                      sx={{ width: 40, height: 40, border: "2px solid #d81b60" }}
                    />
                  </IconButton>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: "#d81b60",
                      fontFamily: "Montserrat, sans-serif",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={handleAvatarClick}
                  >
                    Hey, {profile?.firstName || "Rider"} {profile?.lastName}
                  </Typography>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
                        minWidth: 250,
                      },
                    }}
                  >
                    <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Avatar
                        src={profile?.avatarUrl || "/default-avatar.png"}
                        alt="User Avatar"
                        sx={{ width: 100, height: 100, mb: 1, border: "2px solid #d81b60" }}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#d81b60" }}>
                        {profile?.firstName} {profile?.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "gray", textAlign: "center" }}>
                        {profile?.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleProfileSettings}>
                      <SettingsIcon sx={{ mr: 1, color: "#d81b60" }} /> Profile Settings
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1, color: "#d81b60" }} /> Logout
                    </MenuItem>
                  </Menu>
                </Box>
              </>
            )}

            {!user && (
              <Button component={Link} to="/login" startIcon={<LoginIcon />} sx={{ color: "#d81b60", textTransform: "none", fontWeight: 800 }}>
                Sign in
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Navigation Bar */}
      <AppBar position="relative" sx={{ backgroundColor: "#fff", color: "#000", boxShadow: "0px 1px 4px rgba(0,0,0,0.1)" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ position: "relative" }}>
            {/* ✅ Added car icon before RYDRX */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "#d81b60",
                mr: 6,
              }}
            >
              <DirectionsCarIcon sx={{ fontSize: 43, mr: 1, color: "#d81b60" }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontFamily: "Montserrat, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                RYDRX
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 3, position: "relative" }}>
              {navLinks.map((link) => (
                <Box key={link.label} onMouseEnter={() => setHovered(link.label)} onMouseLeave={() => setHovered(null)} sx={{ position: "relative" }}>
                  <Button
                    component={Link}
                    to={link.submenu ? "#" : link.path}
                    sx={{
                      color: "#1a237e",
                      fontWeight: 800,
                      fontFamily: "Montserrat, sans-serif",
                      textTransform: "none",
                      fontSize: "0.95rem",
                    }}
                  >
                    {link.label}
                  </Button>

                  {link.submenu && (
                    <Grow in={hovered === link.label} timeout={300}>
                      <Paper
                        elevation={4}
                        sx={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          p: 3,
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 3,
                          borderTop: "2px solid #d81b60",
                          zIndex: 1200,
                          backgroundColor: "#fff",
                          minWidth: "700px",
                          boxShadow: "0px 6px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        {link.submenu.map((item) => (
                          <Box
                            key={item.label}
                            onClick={() => handleLocationClick(item.label)}
                            sx={{
                              textDecoration: "none",
                              color: "#000",
                              textAlign: "center",
                              cursor: "pointer",
                              "&:hover": { color: "#d81b60" },
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.label}
                              style={{
                                width: "160px",
                                height: "90px",
                                borderRadius: "8px",
                                objectFit: "cover",
                                marginBottom: "10px",
                                transition: "transform 0.2s ease",
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            />
                            <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "Montserrat, sans-serif" }}>
                              {item.label}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    </Grow>
                  )}
                </Box>
              ))}
            </Box>

            {/* Mobile Menu Icon */}
            <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ display: { xs: "flex", md: "none" } }}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer for Mobile */}
      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 260, p: 2 }}>
          <List>
            {navLinks.map((link) => (
              <React.Fragment key={link.label}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => (link.submenu ? handleSubmenuClick(link.label) : navigate(link.path))}>
                    <ListItemText primary={link.label} />
                    {link.submenu && (openSubmenu === link.label ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                </ListItem>
                {link.submenu && (
                  <Collapse in={openSubmenu === link.label} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {link.submenu.map((item) => (
                        <ListItemButton key={item.label} sx={{ pl: 4 }} onClick={() => handleLocationClick(item.label)}>
                          <ListItemText primary={item.label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default ResponsiveAppBar;
