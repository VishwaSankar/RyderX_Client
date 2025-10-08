import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Divider,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Box,
  Card,
  CardContent,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  getAllCars,
  createCar,
  updateCar,
  deleteCar,
  getAllLocations,
} from "../../services/adminService";
import EditCarDialog from "../agent/EditCarDialog";
import { resolveImageUrl } from "../../utils/imageHelper";

export default function ManageCars() {
  const [cars, setCars] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCar, setEditCar] = useState(null);
  const [search, setSearch] = useState("");

  const [newCar, setNewCar] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    pricePerDay: "",
    category: "",
    fuelType: "",
    transmission: "",
    seats: "",
    features: "",
    locationId: "",
    imageFile: null,
  });

  // Fetch cars and locations
  const fetchCarsAndLocations = async () => {
    try {
      setLoading(true);
      const [carsData, locData] = await Promise.all([
        getAllCars(),
        getAllLocations(),
      ]);
      setCars(carsData);
      setLocations(locData);
    } catch (err) {
      console.error("❌ Error fetching cars or locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarsAndLocations();
  }, []);

  // Derived stats
  const totalCars = cars.length;
  const avgPrice = useMemo(() => {
    if (cars.length === 0) return 0;
    const total = cars.reduce((sum, c) => sum + (parseFloat(c.pricePerDay) || 0), 0);
    return (total / cars.length).toFixed(0);
  }, [cars]);
  const totalLocations = locations.length;

  // Filtered cars
  const filteredCars = useMemo(() => {
    return cars.filter(
      (c) =>
        c.make.toLowerCase().includes(search.toLowerCase()) ||
        c.model.toLowerCase().includes(search.toLowerCase()) ||
        c.licensePlate.toLowerCase().includes(search.toLowerCase())
    );
  }, [cars, search]);

  // Add car
  const handleAddCar = async () => {
    try {
      await createCar(newCar);
      await fetchCarsAndLocations();
      setNewCar({
        make: "",
        model: "",
        year: "",
        licensePlate: "",
        pricePerDay: "",
        category: "",
        fuelType: "",
        transmission: "",
        seats: "",
        features: "",
        locationId: "",
        imageFile: null,
      });
    } catch (err) {
      console.error("❌ Error adding car:", err);
      alert("Failed to add car.");
    }
  };

  // Delete car
  const handleDeleteCar = async (id) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await deleteCar(id);
        fetchCarsAndLocations();
      } catch (err) {
        console.error("❌ Error deleting car:", err);
        alert("Failed to delete car.");
      }
    }
  };

  // Edit car dialog handlers
  const handleEdit = (car) => setEditCar(car);
  const handleEditClose = () => setEditCar(null);
  const handleUpdateCar = async (updatedCar) => {
    try {
      await updateCar(updatedCar.id, updatedCar);
      handleEditClose();
      fetchCarsAndLocations();
    } catch (err) {
      console.error("❌ Error updating car:", err);
      alert("Failed to update car.");
    }
  };

  if (loading)
    return (
      <Box sx={{ height: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress color="secondary" />
      </Box>
    );

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Manage Cars
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Admin dashboard to view, add, edit, or remove cars.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        {[
          {
            title: "Total Cars",
            value: totalCars,
            icon: <DirectionsCarIcon color="secondary" />,
            color: "linear-gradient(135deg,#e3f2fd,#bbdefb)",
          },
          {
            title: "Average Price/Day",
            value: `₹${avgPrice}`,
            icon: <LocalGasStationIcon color="secondary" />,
            color: "linear-gradient(135deg,#f3e5f5,#e1bee7)",
          },
          {
            title: "Locations Covered",
            value: totalLocations,
            icon: <LocationOnIcon color="secondary" />,
            color: "linear-gradient(135deg,#fff9c4,#fff59d)",
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

      {/* Add Car Section */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "0px 4px 10px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Add New Car
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[
            "make",
            "model",
            "year",
            "licensePlate",
            "pricePerDay",
            "category",
            "fuelType",
            "transmission",
            "seats",
            "features",
          ].map((key) => (
            <Grid item xs={12} md={2.4} key={key}>
              <TextField
                label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                value={newCar[key]}
                onChange={(e) => setNewCar({ ...newCar, [key]: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
          ))}

          {/* Location Dropdown */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Location"
              value={newCar.locationId}
              onChange={(e) => setNewCar({ ...newCar, locationId: e.target.value })}
              fullWidth
              size="small"
            >
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name} — {loc.city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12} md={3}>
            <Button variant="outlined" component="label" fullWidth sx={{ height: "100%" }}>
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setNewCar({ ...newCar, imageFile: e.target.files[0] })}
              />
            </Button>
          </Grid>

          {/* Add Button */}
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddCircleIcon />}
              fullWidth
              sx={{ height: "100%" }}
              onClick={handleAddCar}
            >
              Add Car
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search cars by make, model or license plate..."
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

      {/* Cars Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ background: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Image</strong></TableCell>
              <TableCell><strong>Car</strong></TableCell>
              <TableCell><strong>License Plate</strong></TableCell>
              <TableCell><strong>Price/Day</strong></TableCell>
              <TableCell><strong>Fuel</strong></TableCell>
              <TableCell><strong>Seats</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Owner</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No cars found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCars.map((car) => (
                <TableRow key={car.id} hover sx={{ "&:hover": { background: "#fafafa" } }}>
                  <TableCell>
                    <img
                      src={resolveImageUrl(car.imageUrl)}
                      alt={car.model}
                      style={{
                        width: 80,
                        height: 50,
                        borderRadius: 6,
                        objectFit: "cover",
                      }}
                    />
                  </TableCell>
                  <TableCell>{`${car.make} ${car.model} (${car.year})`}</TableCell>
                  <TableCell>{car.licensePlate}</TableCell>
                  <TableCell>₹{car.pricePerDay}</TableCell>
                  <TableCell>{car.fuelType || "-"}</TableCell>
                  <TableCell>{car.seats || "-"}</TableCell>
                  <TableCell>{car.locationName || "-"}</TableCell>
                  <TableCell>{car.ownerName || "—"}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(car)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteCar(car.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Edit Car Dialog */}
      {editCar && (
        <EditCarDialog
          open={!!editCar}
          car={editCar}
          onClose={handleEditClose}
          onSave={handleUpdateCar}
        />
      )}
    </Box>
  );
}
