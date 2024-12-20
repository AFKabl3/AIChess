import React, { useContext } from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { ChessContext } from "../../pages/ChessPage/ChessContext";

const VictoryBar = () => {
  const { chess } = useContext(ChessContext);
  const { whitePercentage, blackPercentage } = chess;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "center",
        justifyContent: "space-between",
        width: "80px",
        height: "100%",
        border: "1px solid #ccc",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Black Bar */}
      <Box
        sx={{
          width: "100%",
          height: `${blackPercentage}%`,
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "height 0.5s ease",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#fff", fontWeight: "bold", position: "absolute" }}
        >
          {blackPercentage}%
        </Typography>
      </Box>

      {/* White Bar */}
      <Box
        sx={{
          width: "100%",
          height: `${whitePercentage}%`,
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "height 0.5s ease",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#000", fontWeight: "bold", position: "absolute" }}
        >
          {whitePercentage}%
        </Typography>
      </Box>
    </Box>
  );
};

VictoryBar.propTypes = {
  whitePercentage: PropTypes.number.isRequired,
  blackPercentage: PropTypes.number.isRequired,
};

export default VictoryBar;
