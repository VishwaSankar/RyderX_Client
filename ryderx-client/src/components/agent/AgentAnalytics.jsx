import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import axios from "axios";
import { getToken } from "../../utils/tokenHelper";

export default function AgentAnalytics() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/reservations/agent/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Only include completed bookings
      const completedBookings = res.data.filter(
        (b) => b.status?.toLowerCase() === "completed"
      );

      // ✅ Aggregate by month
      const revenueByMonth = completedBookings.reduce((acc, booking) => {
        const date = new Date(booking.pickupAt);
        const month = date.toLocaleString("default", { month: "short" });
        acc[month] = (acc[month] || 0) + (booking.totalPrice || 0);
        return acc;
      }, {});

      // ✅ Create chart data for last 6 months (Jan–Dec)
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const formatted = months.map((m) => ({
        month: m,
        revenue: revenueByMonth[m] || 0,
      }));

      setChartData(formatted);
    } catch (error) {
      console.error("❌ Error fetching agent analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  // ✅ Compute total revenue and average per month
  const totalRevenue = useMemo(
    () => chartData.reduce((sum, d) => sum + d.revenue, 0),
    [chartData]
  );
  const avgRevenue = useMemo(
    () => (chartData.length ? totalRevenue / chartData.length : 0),
    [chartData, totalRevenue]
  );

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Agent Revenue Analytics
      </Typography>
      <Typography color="text.secondary" mb={2}>
        Revenue generated from completed bookings over time.
      </Typography>

      {loading ? (
        <Box sx={{ width: "100%", mt: 3 }}>
          <LinearProgress color="secondary" />
          <Typography align="center" mt={1} color="text.secondary">
            Loading revenue data...
          </Typography>
        </Box>
      ) : (
        <Box>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#42a5f5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#42a5f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1e88e5"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body1" fontWeight={700}>
              Total Revenue:{" "}
              <span style={{ color: "#1e88e5" }}>
                ₹{totalRevenue.toLocaleString("en-IN")}
              </span>
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              Avg Monthly Revenue:{" "}
              <span style={{ color: "#1e88e5" }}>
                ₹{avgRevenue.toFixed(0).toLocaleString("en-IN")}
              </span>
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
