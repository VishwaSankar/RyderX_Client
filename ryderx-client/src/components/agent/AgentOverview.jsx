import React, { useEffect, useState, useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import axios from "axios";
import { getToken } from "../../utils/tokenHelper";

export default function AgentOverview() {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const api = import.meta.env.VITE_API_URL;

      const [carsRes, bookingsRes] = await Promise.all([
        axios.get(`${api}/cars/mycars`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${api}/reservations/agent/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allCars = carsRes.data || [];
      const allBookings = bookingsRes.data || [];

      // ✅ Revenue from only completed bookings
      const completedRevenue = allBookings
        .filter((b) => b.status?.toLowerCase() === "completed")
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      setCars(allCars);
      setBookings(allBookings);
      setRevenue(completedRevenue);
    } catch (error) {
      console.error("❌ Error fetching agent overview:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Derived Insights
  const totalCars = cars.length;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(
    (b) =>
      b.status?.toLowerCase() === "active" ||
      b.status?.toLowerCase() === "confirmed" ||
      b.status?.toLowerCase() === "pending"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status?.toLowerCase() === "completed"
  ).length;

  const avgBookingValue = useMemo(() => {
    if (completedBookings === 0) return 0;
    return revenue / completedBookings;
  }, [completedBookings, revenue]);

  // ✅ Top Booked Car (from all bookings)
  const topCar = useMemo(() => {
    const carCount = {};
    bookings.forEach((b) => {
      carCount[b.carName] = (carCount[b.carName] || 0) + 1;
    });
    const sorted = Object.entries(carCount).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : null;
  }, [bookings]);

  // ✅ Top Revenue Car (from completed only)
  const topRevenueCar = useMemo(() => {
    const revenueMap = {};
    bookings
      .filter((b) => b.status?.toLowerCase() === "completed")
      .forEach((b) => {
        if (!b.carName) return;
        revenueMap[b.carName] =
          (revenueMap[b.carName] || 0) + (parseFloat(b.totalPrice) || 0);
      });
    const sorted = Object.entries(revenueMap).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : null;
  }, [bookings]);

  if (loading)
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Loading Agent Dashboard...
        </Typography>
        <LinearProgress color="secondary" />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Agent Dashboard Overview
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Quick insights into your fleet, bookings, and completed revenue.
      </Typography>

      {/* Key Stats */}
      <Grid container spacing={3}>
        {[
          {
            title: "My Cars",
            value: totalCars,
            color: "linear-gradient(135deg,#e3f2fd,#bbdefb)",
          },
          {
            title: "Total Bookings",
            value: totalBookings,
            color: "linear-gradient(135deg,#f3e5f5,#e1bee7)",
          },
          {
            title: "Revenue (Completed)",
            value: `₹${Number(revenue).toLocaleString("en-IN")}`,
            color: "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
          },
          {
            title: "Avg. Booking Value",
            value: `₹${avgBookingValue.toFixed(0)}`,
            color: "linear-gradient(135deg,#fff3e0,#ffe0b2)",
          },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                background: item.color,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">
                  {item.title}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="secondary"
                  mt={1}
                >
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Booking Insights */}
      <Grid container spacing={3}>
        {/* Booking Stats */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                📦 Booking Insights
              </Typography>
              <Typography>
                Active Bookings:
                <Chip
                  label={activeBookings}
                  color="info"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography mt={1}>
                Completed Bookings:
                <Chip
                  label={completedBookings}
                  color="success"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography mt={1}>
                Pending Bookings:
                <Chip
                  label={
                    bookings.filter(
                      (b) => b.status?.toLowerCase() === "pending"
                    ).length
                  }
                  color="warning"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Cars */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🚗 Top Performing Cars
              </Typography>
              {topCar ? (
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary={topCar[0]}
                      secondary={`${topCar[1]} total bookings`}
                    />
                  </ListItem>
                </List>
              ) : (
                <Typography color="text.secondary">
                  No bookings available yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Revenue Car */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                💰 Highest Revenue Car
              </Typography>
              {topRevenueCar ? (
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary={topRevenueCar[0]}
                      secondary={`Revenue: ₹${Number(
                        topRevenueCar[1]
                      ).toLocaleString("en-IN")}`}
                    />
                  </ListItem>
                </List>
              ) : (
                <Typography color="text.secondary">
                  No completed revenue data yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Performance Summary */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3,
          background: "linear-gradient(135deg, #f3e5f5, #ede7f6)",
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          📊 Performance Summary
        </Typography>
        <Typography color="text.secondary" mb={1}>
          You currently manage <strong>{totalCars}</strong> cars and have
          completed <strong>{completedBookings}</strong> bookings,
          generating a total of{" "}
          <strong>₹{revenue.toLocaleString("en-IN")}</strong> in confirmed
          revenue.
        </Typography>
        <Typography color="text.secondary">
          Your most booked car is{" "}
          <strong>{topCar ? topCar[0] : "N/A"}</strong>, and your top-earning
          car (completed) is{" "}
          <strong>{topRevenueCar ? topRevenueCar[0] : "N/A"}</strong>.
        </Typography>
      </Card>
    </Box>
  );
}
