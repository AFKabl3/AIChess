import { styled, Typography } from '@mui/material';

export const ContainerTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.custom.shadow40,
  borderRadius: '10px 10px 0 0',
}));
