import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import { getToken } from "../../utils/tokenHelper";

export default function AgentUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/reservations/agent/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Extract unique users
      const uniqueUsers = Object.values(
        res.data.reduce((acc, b) => {
          if (!acc[b.userEmail]) {
            acc[b.userEmail] = {
              email: b.userEmail,
              carName: b.carName,
              status: b.status,
            };
          }
          return acc;
        }, {})
      );

      setUsers(uniqueUsers);
    } catch (err) {
      console.error("❌ Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (email) => {
    try {
      setLoadingBookings(true);
      const token = getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/reservations/agent/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Filter bookings by this user's email
      const filtered = res.data.filter((b) => b.userEmail === email);
      setUserBookings(filtered);
    } catch (err) {
      console.error("❌ Error fetching user bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //  Filtered users by search
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  //  Derived summary data
  const totalUsers = users.length;
  const activeBookings = users.filter(
    (u) =>
      u.status?.toLowerCase() === "active" ||
      u.status?.toLowerCase() === "confirmed"
  ).length;
  const completedBookings = users.filter(
    (u) => u.status?.toLowerCase() === "completed"
  ).length;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "active":
      case "confirmed":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const handleViewBookings = (email) => {
    setSelectedUser(email);
    setOpenDialog(true);
    fetchUserBookings(email);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setUserBookings([]);
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Bookers Information
          </Typography>
          <Typography color="text.secondary">
            View details of customers who booked your cars.
          </Typography>
        </Box>
        <TextField
          label="Search by email"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 250 }}
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            title: "Total Unique Bookers",
            value: totalUsers,
            color: "linear-gradient(135deg,#e3f2fd,#bbdefb)",
          },
          {
            title: "Active Bookings",
            value: activeBookings,
            color: "linear-gradient(135deg,#f3e5f5,#e1bee7)",
          },
          {
            title: "Completed Bookings",
            value: completedBookings,
            color: "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
          },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                background: item.color,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">
                  {item.title}
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Users Table */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          All Bookers
        </Typography>
        {filteredUsers.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={2}>
            No users found.
          </Typography>
        ) : (
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>
                  <strong>User</strong>
                </TableCell>
                <TableCell>
                  <strong>Car Booked</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u, idx) => (
                <TableRow
                  key={idx}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#fafafa" },
                    transition: "0.2s",
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: "#90caf9",
                          color: "#0d47a1",
                          fontWeight: 700,
                        }}
                      >
                        {u.email.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography>{u.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography>{u.carName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.status}
                      color={getStatusColor(u.status)}
                      sx={{
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: "#d81b60",
                        color: "#d81b60",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          backgroundColor: "rgba(216,27,96,0.08)",
                          borderColor: "#ad1457",
                        },
                      }}
                      onClick={() => handleViewBookings(u.email)}
                    >
                      View Bookings
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* User Bookings Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#d81b60" }}>
          {selectedUser ? `Bookings of ${selectedUser}` : "User Bookings"}
        </DialogTitle>
        <DialogContent dividers>
          {loadingBookings ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : userBookings.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" py={2}>
              No bookings found for this user.
            </Typography>
          ) : (
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>
                    <strong>Car</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Pickup</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Dropoff</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Total (₹)</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userBookings.map((b, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{b.carName}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {b.pickupLocation}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(b.pickupAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {b.dropoffLocation}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(b.dropoffAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={b.status}
                        color={getStatusColor(b.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700}>
                        ₹{b.totalPrice}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#d81b60",
              "&:hover": { color: "#ad1457" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
