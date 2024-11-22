import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { ContainerTitle } from '../../../components/styledComponents/ContainerTitle';
import { SideContainer } from '../../../components/styledComponents/SideContainer';
import { ConfigBox } from '../Config/ConfigBox';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';

export const Chat = ({ followChat, toggleFollowChat, messages, sendMessage, toggleLLMUse }) => (
  <SideContainer sx={{ flexGrow: 2, height: '100%' }}>
    <ContainerTitle variant="h6" gutterBottom>
      AI Coach
    </ContainerTitle>
    <ConfigBox controls={{ toggleFollowChat, toggleLLMUse }} />
    <ChatDisplay messages={messages} followChat={followChat} />
    <ChatInput sendMessage={sendMessage} />
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
    <Box>
      {messages.map((msg, idx) => (
        <ChatBubble key={idx} message={msg.text} isUser={msg.isUser} />
      ))}
      <div ref={chatEndRef} />
    </Box>
  );
};

Chat.propTypes = {
  followChat: PropTypes.bool.isRequired,
  toggleFollowChat: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
  sendMessage: PropTypes.func.isRequired,
  toggleLLMUse: PropTypes.func.isRequired,
};

ChatDisplay.propTypes = {
  messages: PropTypes.array.isRequired,
  followChat: PropTypes.bool.isRequired,
};
