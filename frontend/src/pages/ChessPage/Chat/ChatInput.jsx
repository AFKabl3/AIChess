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
    <Box>
      <TextField
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
      />
      <Button onClick={handleSend}>Send</Button>
    </Box>
  );
};

ChatInput.propTypes = {
  sendMessage: PropTypes.func.isRequired,
};
