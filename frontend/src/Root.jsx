import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

function Root() {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Outlet />
    </Box>
  );
}

export default Root;
