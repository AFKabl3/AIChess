import { Box, Button, Card, Divider, Typography } from "@mui/material";

export const ExampleComponent = () => {
  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h3">Welcome to AIChess</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary">
          Primary
        </Button>
        <Button variant="contained" color="secondary">
          Secondary
        </Button>
        <Button variant="outlined">Outlined</Button>
      </Box>
    </Card>
  );
};
