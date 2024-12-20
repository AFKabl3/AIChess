import React, { useContext } from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { ChessContext } from "../../pages/ChessPage/ChessContext";

export const VictoryBar = () => {
  const { chess, config } = useContext(ChessContext);
  const { whitePercentage, blackPercentage } = chess;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "center",
        justifyContent: "space-between",
        width: "60px",
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: `${config.selectedColor === 'w' ? whitePercentage : blackPercentage}%`,
          backgroundColor: `${config.selectedColor === 'w' ? "#fff" : "#000"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "height 0.5s ease",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: `${config.selectedColor === 'w' ? "#000" : "#fff"}`, fontWeight: "bold", position: "absolute" }}
        >
          {(config.selectedColor === 'w' ? whitePercentage : blackPercentage).toFixed(1)}%
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          height: `${config.selectedColor === 'w' ? blackPercentage : whitePercentage}%`,
          backgroundColor: `${config.selectedColor === 'w' ? "#000" : "#fff" }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "height 0.5s ease",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: `${config.selectedColor === 'w' ? "#fff" : "#000"}`, fontWeight: "bold", position: "absolute" }}
        >
          {(config.selectedColor === 'w' ? blackPercentage : whitePercentage).toFixed(1)}%
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
