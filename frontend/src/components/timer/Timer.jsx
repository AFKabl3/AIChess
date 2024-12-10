import { Box, Typography } from '@mui/material';

export const Timer = ({ time, color }) => {
  // Format time as MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography
        sx={{
          fontSize: '1.5rem',
          color: color === 'white' ? 'white' : 'black',
        }}
      >
        {color === 'white' ? '♟' : '♙'}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '60px',
          height: '25px',
          borderRadius: 1,
          border: '1px solid #ccc',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}
        >
          {formatTime(time)}
        </Typography>
      </Box>
    </Box>
  );
};
