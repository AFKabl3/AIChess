import { Box, styled } from '@mui/material';
import PropTypes from 'prop-types';
import { BeatLoader } from 'react-spinners';

export const ChatBubble = ({ message, isUser, loading }) => {
  const Bubble = isUser ? UserBubble : AIbubble;

  const loadingNode = (
    <Box sx={{ width: 'stretch', textAlign: 'center' }}>
      <BeatLoader color="#838383" speedMultiplier={0.75} size={7} />
    </Box>
  );

  return <Bubble>{loading ? loadingNode : message}</Bubble>;
};

const BaseBubble = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: '10px',
  maxWidth: '90%',
  minWidth: '50%',
  marginBottom: theme.spacing(2),
  wordBreak: 'break-word',
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
  loading: PropTypes.bool,
};
