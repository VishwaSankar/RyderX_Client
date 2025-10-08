import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

// Import Agent Sections
import AgentOverview from "../components/agent/AgentOverview";
import AgentManageCars from "../components/agent/AgentManageCars";
import AgentBookings from "../components/agent/AgentBookings";
import AgentUsers from "../components/agent/AgentUsers";
import AgentAnalytics from "../components/agent/AgentAnalytics";

const drawerWidth = 240;

export default function AgentDashboard() {
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const renderContent = () => {
    switch (selectedMenu) {
      case "overview":
        return <AgentOverview />;
      case "cars":
        return <AgentManageCars />;
      case "bookings":
        return <AgentBookings />;
      case "users":
        return <AgentUsers />;
      case "analytics":
        return <AgentAnalytics />;
      default:
        return <AgentOverview />;
    }
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#1c1f26",
            color: "white",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={700}>
            RyderX Agent
          </Typography>
        </Toolbar>
        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedMenu("overview")}>
              <ListItemIcon>
                <DashboardIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Overview" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedMenu("cars")}>
              <ListItemIcon>
                <DirectionsCarIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="My Cars" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedMenu("bookings")}>
              <ListItemIcon>
                <AssignmentIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="My Bookings" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedMenu("users")}>
              <ListItemIcon>
                <PeopleIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Booker Info" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedMenu("analytics")}>
              <ListItemIcon>
                <BarChartIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Analytics" />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)", my: 2 }} />

        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/")}>
              <ListItemIcon>
                <ArrowBackIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="View Website" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              <ListItemIcon>
                <LogoutIcon sx={{ color: "#f44336" }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#2a2e38",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
            RyderX Agent : Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {loading ? (
          <Box
            sx={{
              height: "70vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          renderContent()
        )}
      </Box>
    </Box>
  );
}
