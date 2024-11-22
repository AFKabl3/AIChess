import { createTheme } from '@mui/material/styles';

// Note that these are just initial settings and can be changed later
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B4513',
    },
    secondary: {
      main: '#f5c400',
    },
    background: {
      default: '#413934',
    },
  },
});

export default theme;
