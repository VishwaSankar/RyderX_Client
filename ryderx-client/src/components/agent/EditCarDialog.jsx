import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  MenuItem,
  Typography,
} from "@mui/material";

export default function EditCarDialog({ open, car, onClose, onSave }) {
  const [form, setForm] = useState({
    id: car.id,
    make: car.make || "",
    model: car.model || "",
    year: car.year || "",
    licensePlate: car.licensePlate || "",
    pricePerDay: car.pricePerDay || "",
    isAvailable: car.isAvailable ?? true,
    category: car.category || "",
    fuelType: car.fuelType || "",
    transmission: car.transmission || "",
    seats: car.seats || "",
    features: car.features || "",
    imageFile: null,
  });

  const handleChange = (k, v) => setForm({ ...form, [k]: v });
  const handleFile = (e) => handleChange("imageFile", e.target.files[0]);
  const handleSubmit = () => onSave(form);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={700}>
        ✏️ Edit Car — {car.make} {car.model}
      </DialogTitle>
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

          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Fuel Type"
              value={form.fuelType}
              onChange={(e) => handleChange("fuelType", e.target.value)}
              fullWidth
            >
              <MenuItem value="Petrol">Petrol</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
              <MenuItem value="Electric">Electric</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
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

          <Grid item xs={12}>
            <TextField
              label="Features"
              value={form.features}
              onChange={(e) => handleChange("features", e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isAvailable}
                  onChange={(e) => handleChange("isAvailable", e.target.checked)}
                />
              }
              label="Available"
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="outlined" component="label">
              Upload New Image
              <input hidden type="file" accept="image/*" onChange={handleFile} />
            </Button>
            {form.imageFile && (
              <Typography variant="body2" sx={{ ml: 2, display: "inline" }}>
                {form.imageFile.name}
              </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="secondary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
