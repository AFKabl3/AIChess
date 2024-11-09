import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, IconButton, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import "./ChessPage.css";
import { ChessboardPage } from "./ChessboardPage";

function ChessPage() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const chatDisplayRef = useRef(null);

  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() !== "") {
      setMessages([...messages, inputText]);
      setInputText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const requestFeedback = async (fen, move) => {
    const response = await api.evaluateMove(fen, move);
    const data = await response.json();
    console.log(data);
    return data.feedback;
  };

  return (
    <Box className="chess-page-container">
      <ChessboardPage
        onPlayerMove={(move, fen) => {
          requestFeedback(fen, move).then((answer) => {
            setMessages([...messages, `You played ${move}. ${answer}`]);
          });
        }}
      />
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
            maxRows={5}
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
