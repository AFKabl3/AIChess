import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useContext, useState } from 'react';
import { ChessContext } from '../../pages/ChessPage/ChessContext';

export const DifficultySelect = () => {
  const { config, setConfigValue } = useContext(ChessContext);
  const [difficulty, setDifficulty] = useState(config.SKILL_LEVEL);

  const handleChange = (event) => {
    const newDifficulty = parseInt(event.target.value, 10);
    setDifficulty(newDifficulty);
    setConfigValue('SKILL_LEVEL', newDifficulty);
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
          {[...Array(21).keys()] // Create an array of numbers from 0 to 20
            .filter((skillLevel) => skillLevel % 2 === 0) // Only show even skill levels to reduce the number of options
            .map((skillLevel) => (
              <MenuItem key={skillLevel} value={skillLevel}>
                (Level {skillLevel * 0.5})
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
};
