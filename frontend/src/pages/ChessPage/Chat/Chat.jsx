import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { ContainerTitle } from '../../../components/styledComponents/ContainerTitle';
import { SideContainer } from '../../../components/styledComponents/SideContainer';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';

export const Chat = ({ followChat, messages, sendMessage }) => (
  <SideContainer sx={{ flexGrow: 2, height: '100%', minWidth: '200px', maxWidth: '400px' }}>
    <ContainerTitle variant="h6" gutterBottom>
      AI Coach
    </ContainerTitle>
    <Box
      sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 2, pt: 0 }}
    >
      <ChatDisplay messages={messages} followChat={followChat} />
      <ChatInput sendMessage={sendMessage} />
    </Box>
  </SideContainer>
);

export const ChatDisplay = ({ messages, followChat }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (followChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, followChat]);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'scroll',
        mt: 1,
      }}
    >
      {messages.map((msg, idx) => (
        <ChatBubble key={idx} message={msg.text} isUser={msg.isUser} />
      ))}
      <div ref={chatEndRef} />
    </Box>
  );
};

Chat.propTypes = {
  followChat: PropTypes.bool.isRequired,
  messages: PropTypes.array.isRequired,
  sendMessage: PropTypes.func.isRequired,
};

ChatDisplay.propTypes = {
  messages: PropTypes.array.isRequired,
  followChat: PropTypes.bool.isRequired,
};
