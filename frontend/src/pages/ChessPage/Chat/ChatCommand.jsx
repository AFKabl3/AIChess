import { Button } from '@mui/material';
import PropTypes from 'prop-types';

export const ChatCommand = ({ text, command, disabled = false }) => {
  return (
    <Button
      onClick={command}
      color="primary"
      variant="outlined"
      size="small"
      sx={{
        color: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        textTransform: 'none',
        width: 'fit-content',
        borderRadius: 2,
      }}
      disabled={disabled}
    >
      {text}
    </Button>
  );
};

ChatCommand.propTypes = {
  text: PropTypes.string.isRequired,
  command: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
