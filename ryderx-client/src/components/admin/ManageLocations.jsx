import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Divider,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Card,
  CardContent,
  InputAdornment,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MapIcon from "@mui/icons-material/Map";
import {
  getAllLocations,
  createLocation,
  deleteLocation,
} from "../../services/adminService";

export default function ManageLocations() {
  const [locations, setLocations] = useState([]);
  const [newLoc, setNewLoc] = useState({
    name: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [search, setSearch] = useState("");

  const fetchLocations = async () => {
    const data = await getAllLocations();
    setLocations(data || []);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAdd = async () => {
    if (!newLoc.name || !newLoc.city || !newLoc.country) {
      alert("Please fill required fields (Name, City, Country).");
      return;
    }
    await createLocation(newLoc);
    setNewLoc({
      name: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    });
    fetchLocations();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      await deleteLocation(id);
      fetchLocations();
    }
  };

  // ✅ Derived stats
  const totalLocations = locations.length;
  const totalCities = new Set(locations.map((l) => l.city)).size;
  const totalCountries = new Set(locations.map((l) => l.country)).size;

  const filteredLocations = useMemo(() => {
    return locations.filter(
      (l) =>
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.city?.toLowerCase().includes(search.toLowerCase()) ||
        l.country?.toLowerCase().includes(search.toLowerCase())
    );
  }, [locations, search]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Manage Locations
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Add, view, or remove available pickup and drop-off locations.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            title: "Total Locations",
            value: totalLocations,
            color: "linear-gradient(135deg,#e3f2fd,#bbdefb)",
            icon: <MapIcon color="secondary" />,
          },
          {
            title: "Cities Covered",
            value: totalCities,
            color: "linear-gradient(135deg,#f3e5f5,#e1bee7)",
            icon: <LocationCityIcon color="secondary" />,
          },
          {
            title: "Countries",
            value: totalCountries,
            color: "linear-gradient(135deg,#fff9c4,#fff59d)",
            icon: <PublicIcon color="secondary" />,
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

      {/* Add Location Form */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Add New Location
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {Object.keys(newLoc).map((key) => (
            <Grid item xs={12} sm={6} md={2.4} key={key}>
              <TextField
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={newLoc[key]}
                onChange={(e) =>
                  setNewLoc({ ...newLoc, [key]: e.target.value })
                }
                fullWidth
                size="small"
              />
            </Grid>
          ))}
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddCircleIcon />}
              onClick={handleAdd}
              fullWidth
              sx={{ height: "100%" }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search locations by name, city, or country..."
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

      {/* Locations Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ background: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>City</strong></TableCell>
              <TableCell><strong>State</strong></TableCell>
              <TableCell><strong>Zip Code</strong></TableCell>
              <TableCell><strong>Country</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No locations found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLocations.map((l) => (
                <TableRow
                  key={l.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#fafafa" },
                    transition: "0.2s",
                  }}
                >
                  <TableCell>{l.name}</TableCell>
                  <TableCell>{l.city}</TableCell>
                  <TableCell>{l.state || "-"}</TableCell>
                  <TableCell>{l.zipCode || "-"}</TableCell>
                  <TableCell>{l.country}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(l.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
