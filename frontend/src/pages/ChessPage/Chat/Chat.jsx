import { Box, Divider } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { ContainerTitle } from '../../../components/styledComponents/ContainerTitle';
import { SideContainer } from '../../../components/styledComponents/SideContainer';
import { ChatBubble } from './ChatBubble';
import { ChatCommand } from './ChatCommand';
import { ChatInput } from './ChatInput';

export const Chat = ({ followChat, messages, sendMessage, commands }) => (
  <SideContainer sx={{ flexGrow: 2, height: '100%', minWidth: '200px', maxWidth: '400px' }}>
    <ContainerTitle variant="h6" gutterBottom>
      AI Coach
    </ContainerTitle>
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, pt: 0 }}>
      {commands && (
        <Box
          sx={{
            width: 'stretch',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 3,
            mt: 1,
          }}
        >
          {commands.map((cmd, idx) => (
            <ChatCommand key={idx} text={cmd.text} command={cmd.command} disabled={cmd.disabled} />
          ))}
        </Box>
      )}
      {commands && <Divider sx={{ mt: 2 }} />}

      <ChatDisplay messages={messages} followChat={followChat} commands={commands} />
      <Divider sx={{ mb: 1 }} />
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
        scrollbarGutter: 'stable',
        overflowY: 'auto',
        pt: 2,
        pr: 1,
      }}
    >
      {messages.map((msg, idx) => (
        <ChatBubble key={idx} message={msg.text} isUser={msg.isUser} loading={msg.loading} />
      ))}

      <div ref={chatEndRef} />
    </Box>
  );
};

Chat.propTypes = {
  followChat: PropTypes.bool.isRequired,
  messages: PropTypes.array.isRequired,
  sendMessage: PropTypes.func.isRequired,
  commands: PropTypes.array,
};

ChatDisplay.propTypes = {
  messages: PropTypes.array.isRequired,
  followChat: PropTypes.bool.isRequired,
  commands: PropTypes.array,
};
