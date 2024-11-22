import { Box } from '@mui/material';
import PropTypes from 'prop-types';

export const ChatBubble = ({ message, isUser }) => (
  <Box className={`chat-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>{message}</Box>
);

ChatBubble.propTypes = {
  message: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
};
