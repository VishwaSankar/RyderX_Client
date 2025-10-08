import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAllReservations } from "../../services/adminService";

export default function AnalyticsSection() {
  const [chartData, setChartData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  // Process revenue data
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const reservations = await getAllReservations();
        const completed = reservations.filter(
          (r) => r.status?.toLowerCase() === "completed"
        );

        // Extract available years
        const years = Array.from(
          new Set(
            completed.map((r) => new Date(r.dropoffAt).getFullYear())
          )
        ).sort((a, b) => b - a);
        setAvailableYears(years.length > 0 ? years : [new Date().getFullYear()]);

        // Filter for selected year
        const filtered = completed.filter(
          (r) => new Date(r.dropoffAt).getFullYear() === selectedYear
        );

        // Group by month
        const monthlyRevenue = {};
        filtered.forEach((r) => {
          const date = new Date(r.dropoffAt);
          const key = date.toLocaleString("default", { month: "short" });
          monthlyRevenue[key] =
            (monthlyRevenue[key] || 0) + (parseFloat(r.totalPrice) || 0);
        });

        // Prepare ordered monthly data (Jan → Dec)
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const formatted = months.map((m) => ({
          month: m,
          revenue: monthlyRevenue[m] || 0,
        }));

        const total = filtered.reduce(
          (sum, r) => sum + (parseFloat(r.totalPrice) || 0),
          0
        );

        setChartData(formatted);
        setTotalRevenue(total);
      } catch (err) {
        console.error("Error fetching revenue data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [selectedYear]);

  if (loading)
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Loading Revenue Analytics...
        </Typography>
        <LinearProgress color="secondary" />
      </Box>
    );

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 3,
        background:
          "linear-gradient(135deg, #0d0d0f 0%, #14161a 100%)",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
        color: "#fff",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={800} color="#f50057">
          📈 Revenue Analytics
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: "white" }}>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{
              color: "white",
              borderColor: "white",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#555",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f50057",
              },
            }}
          >
            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Total Revenue */}
      <Typography variant="body1" color="gray" gutterBottom>
        Showing revenue trends for <strong>{selectedYear}</strong>
      </Typography>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ mb: 2, color: "#f50057" }}
      >
        ₹{Number(totalRevenue).toLocaleString("en-IN")}
      </Typography>

      <ResponsiveContainer width="100%" height={380}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 40, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f50057" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#f50057" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#ccc" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v) => `₹${v / 1000}k`}
            tick={{ fill: "#ccc" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 6,
            }}
            labelStyle={{ color: "#f50057" }}
            formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#f50057"
            fill="url(#colorRevenue)"
            strokeWidth={3}
            dot={{ r: 3, strokeWidth: 2, fill: "#f50057" }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <Typography
        variant="body2"
        align="center"
        color="gray"
        sx={{ mt: 3 }}
      >
        Real-time revenue data.
      </Typography>
    </Paper>
  );
}
