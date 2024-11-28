import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useContext, useState } from 'react';
import { ChessContext } from '../../pages/ChessPage/ChessContext';

const depthToElo = {
  0: 205,
  1: 1800,
  2: 1900,
  3: 2000,
  4: 2080,
  5: 2150,
  6: 2180,
  7: 2200,
  8: 2250,
  9: 2350,
  10: 2400,
  11: 2450,
  12: 2500,
  13: 2550,
  14: 2600,
  15: 2650,
  16: 2700,
};

export const DifficultySelect = () => {
  const { config, setConfigValue } = useContext(ChessContext);
  const [difficulty, setDifficulty] = useState(config.depth);

  const handleChange = (event) => {
    const newDifficulty = parseInt(event.target.value, 10);
    setDifficulty(newDifficulty);
    setConfigValue('depth', newDifficulty);
  };

  return (
    <Box>
      <FormControl>
        <Select
          value={difficulty}
          displayEmpty
          variant="standard"
          onChange={handleChange}
          disableUnderline
          size="small"
          sx={{ fontSize: '0.875rem' }}
        >
          {Object.keys(depthToElo)
            .filter((depth) => depth % 2 === 0) // Only show even depths to reduce the number of options
            .map((depth) => (
              <MenuItem key={depth} value={depth}>
                ({depthToElo[depth]})
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
};
