import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Box,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { getToken } from "../../utils/tokenHelper";

export default function AgentBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const token = getToken();

  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/reservations/agent/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/reservations/status`,
        { reservationId: id, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
    } catch (err) {
      console.error("❌ Error updating status:", err);
      alert("Failed to update booking status.");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ Derived filtering
  const filteredBookings = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return bookings.filter(
      (b) =>
        b.carName?.toLowerCase().includes(lowerSearch) ||
        b.userEmail?.toLowerCase().includes(lowerSearch) ||
        b.status?.toLowerCase().includes(lowerSearch)
    );
  }, [bookings, search]);

  // ✅ Split into active and completed/cancelled
  const activeBookings = filteredBookings.filter(
    (b) =>
      b.status?.toLowerCase() === "pending" ||
      b.status?.toLowerCase() === "active" ||
      b.status?.toLowerCase() === "confirmed"
  );
  const completedBookings = filteredBookings.filter(
    (b) =>
      b.status?.toLowerCase() === "completed" ||
      b.status?.toLowerCase() === "cancelled"
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

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            My Car Bookings
          </Typography>
          <Typography color="text.secondary">
            Manage your car reservations, update statuses, and track customer bookings.
          </Typography>
        </Box>

        {/* 🔍 Search Bar */}
        <TextField
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          variant="outlined"
          sx={{ width: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* ✅ ACTIVE BOOKINGS SECTION */}
      <Paper
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 3,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
          Active Bookings
        </Typography>
        {activeBookings.length === 0 ? (
          <Typography color="text.secondary">
            No active bookings found for "{search || "any"}".
          </Typography>
        ) : (
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><strong>Car</strong></TableCell>
                <TableCell><strong>Booker</strong></TableCell>
                <TableCell><strong>Pickup</strong></TableCell>
                <TableCell><strong>Dropoff</strong></TableCell>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeBookings.map((b) => (
                <TableRow
                  key={b.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#fafafa" },
                    transition: "0.2s",
                  }}
                >
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

      {/* ✅ COMPLETED BOOKINGS SECTION */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          color="success.main"
          gutterBottom
        >
          Completed / Cancelled Bookings
        </Typography>
        {completedBookings.length === 0 ? (
          <Typography color="text.secondary">
            No completed or cancelled bookings found for "{search || "any"}".
          </Typography>
        ) : (
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><strong>Car</strong></TableCell>
                <TableCell><strong>Booker</strong></TableCell>
                <TableCell><strong>Pickup</strong></TableCell>
                <TableCell><strong>Dropoff</strong></TableCell>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedBookings.map((b) => (
                <TableRow
                  key={b.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#fafafa" },
                    transition: "0.2s",
                  }}
                >
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
