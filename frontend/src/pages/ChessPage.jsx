/* eslint-disable react/prop-types */
import { Box, FormControl, FormControlLabel, FormGroup, FormLabel, Switch, Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/api';
import { ChessComponent } from '../components/chessComponent/ChessComponent';
import  DialogComponent  from '../components/dialogComponent/DialogComponent';
import './ChessPage.css';

const ChatBubble = ({ message, isUser }) => (
  <div className={`chat-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>{message}</div>
);

const ChatDisplay = ({ messages, followChat }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (followChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, followChat]);

  return (
    <div className="chat-display">
      {messages.map((msg, idx) => (
        <ChatBubble key={idx} message={msg.text} isUser={msg.isUser} />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

const ChatInput = ({ sendMessage }) => {
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
    <div className="chat-input-container">
      <textarea
        className="chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
      />
      <button className="send-button" onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

const ConfigBox = ({ controls }) => {
  const { toggleFollowChat, toggleLLMUse } = controls;

  return (
    <Box sx={{ p: 1 }}>
      <FormControl component="fieldset" sx={{ display: 'flex', gap: 1 }}>
        <FormLabel component="legend" disabled>
          Settings
        </FormLabel>
        <FormGroup row>
          {toggleFollowChat && <FollowChatToggle toggleFollowChat={toggleFollowChat} />}
          {toggleLLMUse && <UseLLMToggle toggleLLMUse={toggleLLMUse} />}
        </FormGroup>
      </FormControl>
    </Box>
  );
};

const FollowChatToggle = ({ toggleFollowChat }) => (
  <FormControlLabel
    control={<Switch onChange={toggleFollowChat} defaultValue={true} defaultChecked={true} />}
    label="Follow chat"
    labelPlacement="start"
  />
);

const UseLLMToggle = ({ toggleLLMUse }) => (
  <FormControlLabel
    control={<Switch onChange={toggleLLMUse} defaultValue={true} defaultChecked={true} />}
    label="Explain moves"
    labelPlacement="start"
  />
);

const ChatInterface = ({ followChat, toggleFollowChat, messages, sendMessage, toggleLLMUse }) => (
  <div className="chat-interface">
    <ConfigBox controls={{ toggleFollowChat, toggleLLMUse }} />
    <ChatDisplay messages={messages} followChat={followChat} />
    <ChatInput sendMessage={sendMessage} />
  </div>
);

const ChessPage = () => {


  // State to control whether the dialog is open
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Storing the FEN for the chessboard
  const [boardFen, setBoardFen] = useState('');
  // Storing the temporary FEN if the user tries to insert the same FEN more than once in a row
  const [tempFen, setTempFen] = useState('');

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const handleFenSubmit = (fen) => {
    setBoardFen('');  // Reset to force a re-render
    setTempFen(fen); // Update the FEN state with the submitted notation
    closeDialog();    // Close the dialog
  };


  useEffect(() => {
    if (tempFen) {
      setBoardFen(tempFen);  // Update boardFen to the new FEN
      setTempFen('');        // Reset temporary FEN
    }
  }, [tempFen]);


  const [messages, setMessages] = useState([{ text: 'Welcome to the game chat!', isUser: false }]);
  const [followChat, setFollowChat] = useState(true);
  const [llmUse, setLLMUse] = useState(true);
  const [lock, setLock] = useState(false);

  const toggleFollowChat = () => setFollowChat(!followChat);
  const toggleLLMUse = () => setLLMUse(!llmUse);

  const sendMessage = (text, isUser) => {
    const index = messages.length;

    setMessages((prevMessages) => [...prevMessages, { text, isUser }]);

    return index;
  };

  const modifyMessageText = (index, text) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];

      newMessages[index].text = text;
      return newMessages;
    });
  };

  const sendUserChat = (text) => sendMessage(text, true);

  const addBotChat = (text) => sendMessage(text, false);

  /**
   * Handles the player's move by evaluating it and updating the chat with the result.
   *
   * @param {string} move - The move made by the player in standard algebraic notation.
   * @param {string} fen - The FEN (Forsyth-Edwards Notation) string representing the current board state.
   * @returns {Promise<void>} - A promise that resolves when the move evaluation is complete.
   */
  const onPlayerMove = async (move, fen) => {
    if (!llmUse) return;

    const index = addBotChat(`You played ${move}. Evaluating the move ...`);

    setLock(true);
    try {
      const res = await api.evaluateMove(fen, move);
      const data = await res.json();

      modifyMessageText(index, `You played ${move}. ${data.feedback}`);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while evaluating the move.');

      modifyMessageText(index, 'An error occurred while evaluating the move.');
    }
    setLock(false);
  };

  return (
    <div className="chess-page-container">
      <ChessComponent lock={lock} onPlayerMove={onPlayerMove} openDialog={openDialog} fen={tempFen}>
      </ChessComponent>

      <ChatInterface
        followChat={followChat}
        toggleFollowChat={toggleFollowChat}
        messages={messages}
        sendMessage={sendUserChat}
        toggleLLMUse={toggleLLMUse}
      />
       <DialogComponent
        isOpen={isDialogOpen}      
        onClose={closeDialog}      
        onSubmit={handleFenSubmit} 
      />
    </div>
  );
};

export default ChessPage;
