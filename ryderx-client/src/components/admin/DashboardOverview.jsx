import React, { useEffect, useState, useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
} from "@mui/material";
import {
  getAllCars,
  getAllReservations,
  getAllUsers,
  getTotalRevenue,
} from "../../services/adminService";

export default function DashboardOverview() {
  const [cars, setCars] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, r, u, rev] = await Promise.all([
          getAllCars(),
          getAllReservations(),
          getAllUsers(),
          getTotalRevenue(),
        ]);
        setCars(c);
        setReservations(r);
        setUsers(u);
        setRevenue(rev);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Filter completed bookings
  const completedBookings = useMemo(
    () => reservations.filter((r) => r.status?.toLowerCase() === "completed"),
    [reservations]
  );

  // ✅ Only count users with role "User"
  const totalCustomers = useMemo(() => {
    return users.filter((u) => {
      if (u.roles && Array.isArray(u.roles)) {
        return u.roles.includes("User");
      }
      return u.role === "User"; // fallback if backend sends single role
    }).length;
  }, [users]);

  // ✅ Derived insights
  const totalCompletedRevenue = useMemo(
    () => completedBookings.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0),
    [completedBookings]
  );

  const avgBookingValue = useMemo(() => {
    if (completedBookings.length === 0) return 0;
    return totalCompletedRevenue / completedBookings.length;
  }, [totalCompletedRevenue, completedBookings]);

  // ✅ Top 3 most booked cars
  const topCars = useMemo(() => {
    const carCount = {};
    completedBookings.forEach((b) => {
      const name = b.carName || `${b.carMake} ${b.carModel}`;
      carCount[name] = (carCount[name] || 0) + 1;
    });
    return Object.entries(carCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [completedBookings]);

  // ✅ Most active user
  const topUser = useMemo(() => {
    const userCount = {};
    completedBookings.forEach((b) => {
      userCount[b.userEmail] = (userCount[b.userEmail] || 0) + 1;
    });
    const sorted = Object.entries(userCount).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : null;
  }, [completedBookings]);

  // ✅ Recent completed bookings
  const recentBookings = useMemo(() => {
    return [...completedBookings]
      .sort((a, b) => new Date(b.dropoffAt) - new Date(a.dropoffAt))
      .slice(0, 5);
  }, [completedBookings]);

  if (loading)
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Loading Dashboard...
        </Typography>
        <LinearProgress color="secondary" />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Admin Dashboard Overview
      </Typography>

      {/* Key Stats */}
      <Grid container spacing={3}>
        {[
          { title: "Total Cars", value: cars.length },
          { title: "Total Users", value: totalCustomers },
          { title: "Total Bookings", value: reservations.length },
          {
            title: "Total Revenue",
            value: `₹${Number(revenue).toLocaleString("en-IN")}`,
          },
          {
            title: "Completed Bookings",
            value: completedBookings.length,
          },
          {
            title: "Revenue (Completed)",
            value: `₹${Number(totalCompletedRevenue).toLocaleString("en-IN")}`,
          },
          {
            title: "Avg. Booking Value",
            value: `₹${avgBookingValue.toFixed(0)}`,
          },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                background:
                  i === 3
                    ? "linear-gradient(135deg,#ffe0b2,#fff3e0)"
                    : i === 4
                    ? "linear-gradient(135deg,#c8e6c9,#e8f5e9)"
                    : i === 5
                    ? "linear-gradient(135deg,#bbdefb,#e3f2fd)"
                    : "white",
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">
                  {item.title}
                </Typography>
                <Typography variant="h5" fontWeight={800} color="secondary">
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Insights Section */}
      <Grid container spacing={3}>
        {/* Top Cars */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🚗 Top 3 Cars (by Completed Bookings)
              </Typography>
              {topCars.length === 0 ? (
                <Typography color="text.secondary">
                  No completed bookings yet.
                </Typography>
              ) : (
                <List dense>
                  {topCars.map(([name, count], i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={name}
                        secondary={`${count} completed bookings`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Most Active User */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                👤 Most Active User
              </Typography>
              {topUser ? (
                <>
                  <Typography variant="h6" color="secondary">
                    {topUser[0]}
                  </Typography>
                  <Typography color="text.secondary">
                    {topUser[1]} completed bookings
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary">
                  No completed user activity yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Completed Bookings */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🕒 Recent Completed Bookings
              </Typography>
              {recentBookings.length === 0 ? (
                <Typography color="text.secondary">
                  No recent bookings found.
                </Typography>
              ) : (
                <List dense>
                  {recentBookings.map((b, i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={b.carName || `${b.carMake} ${b.carModel}`}
                        secondary={`${b.userEmail} • ₹${b.totalPrice} • ${new Date(
                          b.dropoffAt
                        ).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
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
          You have <strong>{completedBookings.length}</strong> completed
          reservations generating a total of{" "}
          <strong>₹{totalCompletedRevenue.toLocaleString("en-IN")}</strong>.
        </Typography>
        <Typography color="text.secondary">
          The most popular car is{" "}
          <strong>{topCars[0] ? topCars[0][0] : "N/A"}</strong>, and the most
          active customer is{" "}
          <strong>{topUser ? topUser[0] : "N/A"}</strong>.
        </Typography>
      </Card>
    </Box>
  );
}
