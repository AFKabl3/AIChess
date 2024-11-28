import SendIcon from '@mui/icons-material/Send';
import { Box, Button, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';

export const ChatInput = ({ sendMessage }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
      <TextField
        sx={{ flexGrow: 1, bgcolor: '#504E4C', color: 'white' }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        variant="outlined"
        size="small"
      />
      <Button startIcon={<SendIcon />} onClick={handleSend} color="inherit" variant="outlined">
        Send
      </Button>
    </Box>
  );
};

ChatInput.propTypes = {
  sendMessage: PropTypes.func.isRequired,
};
