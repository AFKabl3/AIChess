import { Box, styled } from '@mui/material';
import PropTypes from 'prop-types';

export const ChatBubble = ({ message, isUser }) => {
  const Bubble = isUser ? UserBubble : AIbubble;

  return <Bubble>{message}</Bubble>;
};

const BaseBubble = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: '10px',
  maxWidth: '90%',
  minWidth: '50%',
  marginBottom: theme.spacing(2),
}));

const UserBubble = styled(BaseBubble)(({ theme }) => ({
  alignSelf: 'flex-end',
  backgroundColor: theme.palette.custom.shadow20,
}));

const AIbubble = styled(BaseBubble)(({ theme }) => ({
  alignSelf: 'flex-start',
  backgroundColor: theme.palette.custom.shadow40,
}));

ChatBubble.propTypes = {
  message: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
};
