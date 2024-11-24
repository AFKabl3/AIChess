import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { DifficultySelect } from '../difficultySelect/DifficultySelect';

export const InfoBox = ({ title, image }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Box
        sx={{
          borderRadius: 3,
          border: '2px solid rgba(255, 255, 255, 0.3)',
          width: 42,
          height: 42,
        }}
        component="img"
        src={image}
        alt={title}
      />
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        <DifficultySelect />
      </Box>
    </Box>
  );
};

InfoBox.propTypes = {
  title: PropTypes.string.isRequired,
  subComponent: PropTypes.node,
  image: PropTypes.string.isRequired,
};
