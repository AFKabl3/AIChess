import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export const InfoBox = ({ title, subtitle, image }) => {
  return (
    <Box>
      <image src={image} alt={title} />
      <Box>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="subtitle1">{subtitle}</Typography>
      </Box>
    </Box>
  );
};

InfoBox.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};
