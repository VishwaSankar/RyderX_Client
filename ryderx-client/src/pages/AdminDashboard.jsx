import React, { useEffect, useState } from "react";
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
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate } from "react-router-dom";
import DashboardOverview from "../components/admin/DashboardOverview";
import ManageCars from "../components/admin/ManageCars";
import ManageBookings from "../components/admin/ManageBookings";
import ManageUsers from "../components/admin/ManageUsers";
import ManageLocations from "../components/admin/ManageLocations";
import AnalyticsSection from "../components/admin/AnalyticsSection";
import ManageAgentsAndCars from "../components/admin/ManageAgentsandCars"

const drawerWidth = 240;

export default function AdminDashboard() {
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return <DashboardOverview />;
      case "cars":
        return <ManageCars />;
      case "bookings":
        return <ManageBookings />;
      case "users":
        return <ManageUsers />;
      case "agents":
        return <ManageAgentsAndCars />;
      case "locations":
        return <ManageLocations />;
      case "analytics":
        return <AnalyticsSection />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
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
            RyderX Admin
          </Typography>
        </Toolbar>
        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedMenu("dashboard")}>
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
              <ListItemText primary="Manage Cars" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedMenu("bookings")}>
              <ListItemIcon>
                <AssignmentIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Bookings" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedMenu("users")}>
              <ListItemIcon>
                <PeopleIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedMenu("agents")}>
              <ListItemIcon>
                <GroupIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Agents & Cars" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedMenu("locations")}>
              <ListItemIcon>
                <LocationOnIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Locations" />
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

      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#2a2e38",
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            
            RydrX - Admin Dashboard
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
