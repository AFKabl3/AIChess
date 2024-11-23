import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B4513',
    },
    secondary: {
      main: '#ECCBB8',
    },
    background: {
      default: '#413934',
    },
    custom: {
      containerBackground: 'rgba(48, 46, 43, 0.8)',
      shadow20: 'rgba(0, 0, 0, 0.2)',
      shadow40: 'rgba(0, 0, 0, 0.4)',
    },
  },
});

export default theme;
