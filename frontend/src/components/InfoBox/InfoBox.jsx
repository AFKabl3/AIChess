import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export const InfoBox = ({ title, subtitle, image }) => {
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
        <Typography variant="subtitle2">{subtitle}</Typography>
      </Box>
    </Box>
  );
};

InfoBox.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};
