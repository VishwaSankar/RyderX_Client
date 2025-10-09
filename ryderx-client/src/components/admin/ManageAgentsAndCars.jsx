import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Box,
  Collapse,
  IconButton,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import axios from "axios";
import { resolveImageUrl } from "../../utils/imageHelper";
import { getToken } from "../../utils/tokenHelper";

const AUTH_URL = `${import.meta.env.VITE_API_URL}/authentication/all-users`;
const CARS_URL = `${import.meta.env.VITE_API_URL}/cars`;

// ✅ Default Avatar Placeholder
const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/847/847969.png"; // clean flat avatar icon

export default function ManageAgentsAndCars() {
  const [agents, setAgents] = useState([]);
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔹 Fetch all agents and their cars
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, carRes] = await Promise.all([
        axios.get(AUTH_URL, { headers }),
        axios.get(CARS_URL, { headers }),
      ]);

      const allUsers = userRes.data;
      const allCars = carRes.data;

      const agentsWithCars = allUsers
        .filter((u) => u.roles?.includes("Agent") || u.role === "Agent")
        .map((agent) => {
          const agentCars = allCars.filter((car) => car.ownerId === agent.id);
          return {
            id: agent.id,
            fullName:
              `${agent.firstName || ""} ${agent.lastName || ""}`.trim() ||
              "Unnamed Agent",
            email: agent.email,
            phone: agent.phoneNumber || "N/A",
            avatarUrl: agent.avatarUrl || DEFAULT_AVATAR,
            cars: agentCars,
          };
        });

      setAgents(agentsWithCars);
    } catch (err) {
      console.error("❌ Error fetching agents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const filteredAgents = useMemo(() => {
    return agents.filter(
      (a) =>
        a.fullName.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [agents, search]);

  const totalCars = agents.reduce((sum, a) => sum + (a.cars?.length || 0), 0);
  const avgCarsPerAgent = agents.length
    ? (totalCars / agents.length).toFixed(1)
    : 0;

  // 🔹 Loading State
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="secondary" />
      </Box>
    );

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Manage Agents & Cars
      </Typography>
      <Typography color="text.secondary" mb={3}>
        View all registered agents and their listed cars.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        {[
          {
            title: "Total Agents",
            value: agents.length,
            icon: <PeopleAltIcon color="secondary" />,
            color: "linear-gradient(135deg,#e3f2fd,#bbdefb)",
          },
          {
            title: "Total Cars Listed",
            value: totalCars,
            icon: <DirectionsCarIcon color="secondary" />,
            color: "linear-gradient(135deg,#f3e5f5,#e1bee7)",
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
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
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
        placeholder="Search agents by name or email..."
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

      {/* Main Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ background: "#f5f5f5" }}>
            <TableRow>
              <TableCell>
                <strong>Agent</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Phone</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Cars</strong>
              </TableCell>
              <TableCell align="center">
                <strong>View</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredAgents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No agents found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAgents.map((agent) => (
                <React.Fragment key={agent.id}>
                  {/* Agent Row */}
                  <TableRow hover sx={{ "&:hover": { background: "#fafafa" } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <img
                          src={resolveImageUrl(agent.avatarUrl) || DEFAULT_AVATAR}
                          alt={agent.fullName}
                          onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #eee",
                          }}
                        />
                        <Typography fontWeight={600}>
                          {agent.fullName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.phone}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${agent.cars?.length || 0}`}
                        color={
                          agent.cars?.length > 0 ? "secondary" : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() =>
                          setExpandedAgent(
                            expandedAgent === agent.id ? null : agent.id
                          )
                        }
                      >
                        {expandedAgent === agent.id ? (
                          <ExpandLessIcon color="secondary" />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Car Details */}
                  <TableRow>
                    <TableCell colSpan={5} sx={{ p: 0 }}>
                      <Collapse
                        in={expandedAgent === agent.id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ p: 3, backgroundColor: "#f9f9f9" }}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                          >
                            {agent.fullName}'s Cars
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          {agent.cars?.length > 0 ? (
                            <Grid container spacing={2}>
                              {agent.cars.map((car) => (
                                <Grid item xs={12} md={6} lg={4} key={car.id}>
                                  <Card
                                    sx={{
                                      borderRadius: 2,
                                      boxShadow:
                                        "0px 4px 10px rgba(0,0,0,0.1)",
                                      transition: "0.3s",
                                      "&:hover": {
                                        transform: "translateY(-5px)",
                                      },
                                    }}
                                  >
                                    <img
                                      src={resolveImageUrl(car.imageUrl)}
                                      alt={car.model}
                                      style={{
                                        width: "100%",
                                        height: 150,
                                        objectFit: "cover",
                                        borderTopLeftRadius: 8,
                                        borderTopRightRadius: 8,
                                      }}
                                    />
                                    <CardContent>
                                      <Typography
                                        variant="h6"
                                        fontWeight={700}
                                      >
                                        {car.make} {car.model}
                                      </Typography>
                                      <Typography color="text.secondary">
                                        {car.year} • {car.fuelType} •{" "}
                                        {car.seats} Seats
                                      </Typography>
                                      <Typography
                                        variant="body1"
                                        color="secondary"
                                        fontWeight={700}
                                        mt={1}
                                      >
                                        ₹{car.pricePerDay}/day
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Typography color="text.secondary">
                              No cars listed by this agent.
                            </Typography>
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
