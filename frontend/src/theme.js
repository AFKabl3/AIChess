import { createTheme } from "@mui/material/styles";

// Note that these are just initial settings and can be changed later
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#0e5812",
    },
    secondary: {
      main: "#f5c400",
    },
  },
});

export default theme;
