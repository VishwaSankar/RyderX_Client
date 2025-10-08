import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
    h6: {
      fontWeight: 400,
      // color: "#f0f0f0",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  palette: {
    primary: {
      main: "#d81b60",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

export default theme;
