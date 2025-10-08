import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Select,
  Divider,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { getAllReservations } from "../../services/adminService";
import axios from "axios";
import { getToken } from "../../utils/tokenHelper";

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");

  const fetchBookings = async () => {
    const data = await getAllReservations();
    setBookings(data || []);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, status) => {
    const token = getToken();
    await axios.put(
      `${import.meta.env.VITE_API_URL}/reservations/status`,
      { reservationId: id, status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchBookings();
  };

  // ✅ Separate bookings by status
  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status?.toLowerCase() === "pending" ||
          b.status?.toLowerCase() === "confirmed" ||
          b.status?.toLowerCase() === "active"
      ),
    [bookings]
  );

  const completedBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status?.toLowerCase() === "completed" ||
          b.status?.toLowerCase() === "cancelled"
      ),
    [bookings]
  );

  const filteredActive = activeBookings.filter(
    (b) =>
      b.carName?.toLowerCase().includes(search.toLowerCase()) ||
      b.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCompleted = completedBookings.filter(
    (b) =>
      b.carName?.toLowerCase().includes(search.toLowerCase()) ||
      b.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const getAvailableStatusOptions = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return ["Confirmed", "Completed", "Cancelled"];
      case "pending":
      case "active":
        return ["Pending", "Confirmed", "Completed", "Cancelled"];
      default:
        return [status];
    }
  };

  const isStatusLocked = (status) => {
    const lower = status.toLowerCase();
    return lower === "completed" || lower === "cancelled";
  };

  // ✅ Summary stats
  const totalBookings = bookings.length;
  const totalCompleted = completedBookings.filter((b) => b.status === "Completed").length;
  const totalCancelled = completedBookings.filter((b) => b.status === "Cancelled").length;
  const totalActive = activeBookings.length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Manage Bookings
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Track, filter, and update all customer bookings here.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            title: "Total Bookings",
            value: totalBookings,
            color: "linear-gradient(135deg,#e3f2fd,#bbdefb)",
            icon: <EventAvailableIcon color="secondary" />,
          },
          {
            title: "Active Bookings",
            value: totalActive,
            color: "linear-gradient(135deg,#f3e5f5,#e1bee7)",
            icon: <HourglassBottomIcon color="secondary" />,
          },
          {
            title: "Completed",
            value: totalCompleted,
            color: "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
            icon: <DoneAllIcon color="success" />,
          },
          {
            title: "Cancelled",
            value: totalCancelled,
            color: "linear-gradient(135deg,#ffebee,#ffcdd2)",
            icon: <CancelIcon color="error" />,
          },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                background: item.color,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{item.title}</Typography>
                  {item.icon}
                </Box>
                <Typography variant="h4" fontWeight={800} mt={1}>
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
        placeholder="Search bookings by user email or car name..."
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

      {/* ✅ ACTIVE BOOKINGS */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 5, boxShadow: "0px 4px 10px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
          Active Bookings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {filteredActive.length === 0 ? (
          <Typography color="text.secondary">No active bookings found.</Typography>
        ) : (
          <Table>
            <TableHead sx={{ background: "#f5f5f5" }}>
              <TableRow>
                <TableCell><strong>Car</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Pickup</strong></TableCell>
                <TableCell><strong>Dropoff</strong></TableCell>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActive.map((b) => (
                <TableRow key={b.id} hover sx={{ "&:hover": { background: "#fafafa" } }}>
                  <TableCell>{b.carName}</TableCell>
                  <TableCell>{b.userEmail}</TableCell>
                  <TableCell>{b.pickupAt?.split("T")[0]}</TableCell>
                  <TableCell>{b.dropoffAt?.split("T")[0]}</TableCell>
                  <TableCell>₹{b.totalPrice}</TableCell>
                  <TableCell>
                    <Select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      disabled={isStatusLocked(b.status)}
                      sx={{
                        bgcolor:
                          b.status === "Confirmed"
                            ? "#fff8e1"
                            : b.status === "Pending"
                            ? "#e3f2fd"
                            : b.status === "Active"
                            ? "#f3e5f5"
                            : "transparent",
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      {getAvailableStatusOptions(b.status).map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* ✅ COMPLETED BOOKINGS */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0px 4px 10px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6" fontWeight={700} color="success.main" gutterBottom>
          Completed / Cancelled Bookings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {filteredCompleted.length === 0 ? (
          <Typography color="text.secondary">
            No completed or cancelled bookings found.
          </Typography>
        ) : (
          <Table>
            <TableHead sx={{ background: "#f5f5f5" }}>
              <TableRow>
                <TableCell><strong>Car</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Pickup</strong></TableCell>
                <TableCell><strong>Dropoff</strong></TableCell>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompleted.map((b) => (
                <TableRow key={b.id} hover sx={{ "&:hover": { background: "#fafafa" } }}>
                  <TableCell>{b.carName}</TableCell>
                  <TableCell>{b.userEmail}</TableCell>
                  <TableCell>{b.pickupAt?.split("T")[0]}</TableCell>
                  <TableCell>{b.dropoffAt?.split("T")[0]}</TableCell>
                  <TableCell>₹{b.totalPrice}</TableCell>
                  <TableCell>
                    <Select
                      value={b.status}
                      disabled
                      sx={{
                        bgcolor:
                          b.status === "Completed"
                            ? "#e8f5e9"
                            : b.status === "Cancelled"
                            ? "#ffebee"
                            : "transparent",
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      <MenuItem value={b.status}>{b.status}</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
