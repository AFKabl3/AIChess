import { useContext } from 'react';
import { ChessContext } from '../../pages/ChessPage/ChessContext';
import { Box } from '@mui/material';

const FullControl = () => {
  const { updateConfigValue } = useContext(ChessContext);

  const handleFullControl = () => {
    updateConfigValue('fullControlMode', true);
    updateConfigValue('startedGame', true);
    updateConfigValue('selectedColor', 'w')
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <button onClick={() => handleFullControl()} >
        Full Control
      </button>
    </Box>
  );
};

export default FullControl;
