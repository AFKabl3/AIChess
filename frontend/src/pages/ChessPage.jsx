// src/pages/ChessPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, IconButton, Typography, Paper } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ChessboardPage } from "./ChessboardPage";
import "./ChessPage.css";

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

  return (
    <Box className="chess-page-container">
      <Box className="chess-board" >
      <ChessboardPage />
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
