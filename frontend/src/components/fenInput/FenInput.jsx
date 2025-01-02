import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Box } from '@mui/material';

export const FenInput = ({ fen }) => {
  return (
    <Box sx={{ mt: 0.5, mb: 0.5}}>
      <TextField
        label="FEN"
        variant="outlined"
        value={fen}
        fullWidth
      />
    </Box>
  );
};

FenInput.propTypes = {
  fen: PropTypes.string.isRequired, 
};

