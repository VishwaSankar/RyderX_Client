import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  MenuItem,
  Typography,
} from "@mui/material";

export default function AddCarDialog({ open, onClose, onSave, locations }) {
  const [form, setForm] = useState({
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

  const handleChange = (k, v) => setForm({ ...form, [k]: v });
  const handleFile = (e) => handleChange("imageFile", e.target.files[0]);
  const handleSubmit = () => onSave(form);

  const menuProps = {
    PaperProps: {
      sx: {
        maxHeight: 300,
        width: 300,
      },
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={700}>🚗 Add New Car</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={1}>
          {[
            ["Make", "make"],
            ["Model", "model"],
            ["Year", "year"],
            ["License Plate", "licensePlate"],
            ["Price Per Day", "pricePerDay"],
            ["Category", "category"],
          ].map(([label, key]) => (
            <Grid item xs={12} md={4} key={key}>
              <TextField
                label={label}
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                fullWidth
              />
            </Grid>
          ))}

          {/*  Fuel Type Dropdown */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Fuel Type"
              value={form.fuelType}
              onChange={(e) => handleChange("fuelType", e.target.value)}
              fullWidth
              SelectProps={menuProps}
            >
              {["Petrol", "Diesel", "Electric", "Hybrid"].map((fuel) => (
                <MenuItem key={fuel} value={fuel}>
                  {fuel}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Transmission"
              value={form.transmission}
              onChange={(e) => handleChange("transmission", e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Seats"
              type="number"
              value={form.seats}
              onChange={(e) => handleChange("seats", e.target.value)}
              fullWidth
            />
          </Grid>

          {/*  Location Dropdown */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Location"
              value={form.locationId}
              onChange={(e) => handleChange("locationId", e.target.value)}
              fullWidth
              SelectProps={menuProps}
            >
              {locations.map((loc) => (
                <MenuItem
                  key={loc.id}
                  value={loc.id}
                  sx={{ minWidth: 250, whiteSpace: "nowrap" }}
                >
                  {loc.name} — {loc.city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <Button variant="outlined" component="label" fullWidth>
              Upload Image
              <input hidden type="file" accept="image/*" onChange={handleFile} />
            </Button>
            {form.imageFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {form.imageFile.name}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Features"
              multiline
              rows={3}
              value={form.features}
              onChange={(e) => handleChange("features", e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="secondary" onClick={handleSubmit}>
          Add Car
        </Button>
      </DialogActions>
    </Dialog>
  );
}
