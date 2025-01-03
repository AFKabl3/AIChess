import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Box, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-hot-toast';

export const FenInput = ({ fen }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(fen).then(() => {
      toast.success('FEN copied to clipboard!');
    });
  };

  return (
    <Box sx={{ mt: 0.5, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField label="FEN" variant="outlined" value={fen} fullWidth />
      <Tooltip title="Copy FEN">
        <IconButton onClick={handleCopy} color="secondary" aria-label="Copy FEN" disabled={!fen}>
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

FenInput.propTypes = {
  fen: PropTypes.string.isRequired,
};
