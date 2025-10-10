import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Collapse,
  IconButton,
  Box,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PeopleIcon from "@mui/icons-material/People";
import axios from "axios";
import { getAllUsers } from "../../services/adminService";
import { getToken } from "../../utils/tokenHelper";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [bookings, setBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  //  Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await getAllUsers();
        const filteredUsers = allUsers.filter((u) =>
          u.roles?.includes("User")
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  //  Fetch bookings for each user
  const fetchUserBookings = async (userId) => {
    try {
      const token = getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/reservations/admin/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) => ({ ...prev, [userId]: res.data }));
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    }
  };

  const toggleExpand = (id) => {
    if (expanded === id) setExpanded(null);
    else {
      setExpanded(id);
      if (!bookings[id]) fetchUserBookings(id);
    }
  };

  // ✅ Filtered users (search by name/email)
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        `${u.firstName || ""} ${u.lastName || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // ✅ Summary Stats
  const totalUsers = users.length;
  const totalBookings = Object.values(bookings).flat().length;

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="secondary" />
      </Box>
    );

  return (
    <Box>
      {/* Header Section */}
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Manage Users
      </Typography>
      <Typography color="text.secondary" mb={3}>
        View all registered users, their details, and booking history.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        {[
          {
            title: "Total Users",
            value: totalUsers,
            icon: <PeopleIcon color="secondary" />,
            color: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
          },
          {
            title: "Total Bookings",
            value: totalBookings,
            icon: <DirectionsCarIcon color="secondary" />,
            color: "linear-gradient(135deg, #f3e5f5, #e1bee7)",
          },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                background: item.color,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">{item.title}</Typography>
                  {item.icon}
                </Box>
                <Typography variant="h4" fontWeight={800}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* User Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ background: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell align="center"><strong>Bookings</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <React.Fragment key={u.id}>
                  <TableRow
                    hover
                    sx={{
                      transition: "0.3s",
                      "&:hover": { background: "#fafafa" },
                    }}
                  >
                    <TableCell>
                      {u.firstName} {u.lastName}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        {u.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        {u.phoneNumber || "-"}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => toggleExpand(u.id)}>
                        {expanded === u.id ? (
                          <ExpandLessIcon color="secondary" />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* Expandable Booking Details */}
                  <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0 }}>
                      <Collapse in={expanded === u.id} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 2 }}>
                          <Typography variant="subtitle1" fontWeight={600} mb={1}>
                            User Bookings:
                          </Typography>
                          {(bookings[u.id] || []).length === 0 ? (
                            <Typography color="text.secondary" ml={1}>
                              No bookings found.
                            </Typography>
                          ) : (
                            (bookings[u.id] || []).map((b) => (
                              <Paper
                                key={b.id}
                                sx={{
                                  p: 2,
                                  mb: 1,
                                  borderRadius: 2,
                                  background: "#f9f9f9",
                                }}
                              >
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Box>
                                    <Typography variant="body1" fontWeight={600}>
                                      {b.carName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      ₹{b.totalPrice} •{" "}
                                      {new Date(b.pickupAt).toLocaleDateString()} →{" "}
                                      {new Date(b.dropoffAt).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={b.status}
                                    color={
                                      b.status === "Completed"
                                        ? "success"
                                        : b.status === "Cancelled"
                                        ? "error"
                                        : b.status === "Confirmed"
                                        ? "primary"
                                        : "warning"
                                    }
                                  />
                                </Box>
                              </Paper>
                            ))
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
