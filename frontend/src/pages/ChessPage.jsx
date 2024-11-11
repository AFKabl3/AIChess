import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, IconButton, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/api';
import { ChessComponent } from '../components/chessComponent/ChessComponent';
import './ChessPage.css';

function ChessPage() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const chatDisplayRef = useRef(null);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() !== '') {
      setMessages([...messages, inputText]);
      setInputText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addMessage = (message) => {
    const index = messages.length;
    setMessages([...messages, message]);

    return index;
  };

  const modifyMessage = (index, message) => {
    const newMessages = [...messages];
    newMessages[index] = message;
    setMessages(newMessages);
  };

  const onPlayerMove = async (move, fen) => {
    const index = addMessage(`You played ${move}. Evaluating the move ...`);

    setLock(true);
    try {
      const data = await api.evaluateMove(fen, move);
      modifyMessage(index, `You played ${move}. ${data.feedback}`);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while evaluating the move.');
      modifyMessage(index, 'An error occurred while evaluating the move.');
    }
    setLock(false);
  };

  return (
    <Box className="chess-page-container">
      <Box className="chess-board">
        <ChessComponent onPlayerMove={onPlayerMove} lock={lock} />
      </Box>
      <Box className="notation-interface">
        <Typography variant="h6">Notation</Typography>
      </Box>
      <Box className="chat-interface">
        <Paper className="chat-display" elevation={3} ref={chatDisplayRef}>
          {messages.map((message, index) => (
            <Box key={index} className="chat-bubble">
              <Typography>{message}</Typography>
            </Box>
          ))}
        </Paper>
        <Box className="chat-input-container">
          <TextField
            fullWidth
            multiline
            rows={1}
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            className="chat-input"
          />
          <IconButton onClick={handleSend} className="send-button">
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default ChessPage;
