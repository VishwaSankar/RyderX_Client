import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Divider,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import {
  getAgentCars,
  createAgentCar,
  updateAgentCar,
  deleteAgentCar,
} from "../../services/agentService";
import { getAllLocations } from "../../services/adminService";
import EditCarDialog from "./EditCarDialog";
import AddCarDialog from "./AddCarDialog";
import { resolveImageUrl } from "../../utils/imageHelper";

export default function AgentManageCars() {
  const [cars, setCars] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCar, setEditCar] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCarsAndLocations = async () => {
    try {
      setLoading(true);
      const [carData, locData] = await Promise.all([
        getAgentCars(),
        getAllLocations(),
      ]);
      setCars(carData);
      setLocations(locData);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      alert("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarsAndLocations();
  }, []);

  const handleAddCar = async (newCar) => {
    try {
      await createAgentCar(newCar);
      setAddDialogOpen(false);
      await fetchCarsAndLocations();
    } catch (error) {
      console.error("❌ Error adding car:", error);
      alert("Failed to add car. Please check your inputs.");
    }
  };

  const handleDeleteCar = async (id) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await deleteAgentCar(id);
        fetchCarsAndLocations();
      } catch (error) {
        console.error("❌ Error deleting car:", error);
        alert("Failed to delete car.");
      }
    }
  };

  const handleEdit = (car) => setEditCar(car);
  const handleEditClose = () => setEditCar(null);
  const handleUpdateCar = async (updatedData) => {
    try {
      await updateAgentCar(updatedData.id, updatedData);
      handleEditClose();
      fetchCarsAndLocations();
    } catch (error) {
      console.error("❌ Error updating car:", error);
      alert("Failed to update car.");
    }
  };

  // ✅ Derived summary data
  const totalCars = cars.length;
  const avgPrice =
    totalCars > 0
      ? (cars.reduce((sum, c) => sum + (c.pricePerDay || 0), 0) / totalCars).toFixed(0)
      : 0;
  const totalSeats = cars.reduce((sum, c) => sum + (parseInt(c.seats) || 0), 0);

  // ✅ Filtered Cars (search)
  const filteredCars = useMemo(() => {
    return cars.filter((c) => {
      const text = search.toLowerCase();
      return (
        c.make?.toLowerCase().includes(text) ||
        c.model?.toLowerCase().includes(text) ||
        c.licensePlate?.toLowerCase().includes(text) ||
        c.locationName?.toLowerCase().includes(text)
      );
    });
  }, [cars, search]);

  if (loading)
    return (
      <Box
        sx={{
          height: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Manage My Cars
          </Typography>
          <Typography color="text.secondary">
            View, edit, or add cars you own. Keep your listings up to date for customers.
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            placeholder="Search cars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            variant="outlined"
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddCircleIcon />}
            sx={{
              borderRadius: 2,
              boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
              height: "fit-content",
            }}
            onClick={() => setAddDialogOpen(true)}
          >
            Add New Car
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            title: "Total Cars",
            value: totalCars,
            color: "linear-gradient(135deg,#e3f2fd,#bbdefb)",
            icon: <DirectionsCarIcon color="secondary" />,
          },
          {
            title: "Average Price/Day",
            value: `₹${avgPrice}`,
            color: "linear-gradient(135deg,#f3e5f5,#e1bee7)",
            icon: <CurrencyRupeeIcon color="secondary" />,
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

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          My Car Listings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Cars Table */}
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Image</strong></TableCell>
              <TableCell><strong>Car</strong></TableCell>
              <TableCell><strong>License Plate</strong></TableCell>
              <TableCell><strong>Price/Day</strong></TableCell>
              <TableCell><strong>Fuel</strong></TableCell>
              <TableCell><strong>Seats</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredCars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No cars found matching "{search}".
                </TableCell>
              </TableRow>
            ) : (
              filteredCars.map((car) => (
                <TableRow
                  key={car.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#fafafa" },
                    transition: "0.2s",
                  }}
                >
                  <TableCell>
                    {car.imageUrl ? (
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
                    ) : (
                      <Box
                        sx={{
                          width: 80,
                          height: 50,
                          borderRadius: 1,
                          backgroundColor: "#eee",
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{`${car.make} ${car.model} (${car.year})`}</TableCell>
                  <TableCell>{car.licensePlate}</TableCell>
                  <TableCell>₹{car.pricePerDay}</TableCell>
                  <TableCell>{car.fuelType || "-"}</TableCell>
                  <TableCell>{car.seats || "-"}</TableCell>
                  <TableCell>{car.locationName || "-"}</TableCell>
                  <TableCell align="center">
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

      {/* Add Car Dialog */}
      {addDialogOpen && (
        <AddCarDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onSave={handleAddCar}
          locations={locations}
        />
      )}
    </Box>
  );
}
