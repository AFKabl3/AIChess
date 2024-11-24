import { Box, styled } from '@mui/material';

export const SideContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.custom.containerBackground,
  borderRadius: '10px',
  display: 'flex',
  flexDirection: 'column',
}));
