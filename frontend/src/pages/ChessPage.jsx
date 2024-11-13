import React, { useState, useEffect, useRef } from 'react';
import './ChessPage.css';
import { ChessboardPage } from './ChessboardPage'; // Import the chessboard component

const ChatBubble = ({ message, isUser }) => (
  <div className={`chat-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
    {message}
  </div>
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
      <button className="send-button" onClick={handleSend}>Send</button>
    </div>
  );
};

const FollowChatToggle = ({ followChat, toggleFollowChat }) => (
  <div className="follow-chat-toggle">
    <span>Follow Chat</span>
    <div className={`toggle-switch ${followChat ? 'on' : 'off'}`} onClick={toggleFollowChat}>
      <div className="toggle-circle"></div>
    </div>
  </div>
);

const ChatInterface = ({ followChat, toggleFollowChat, messages, sendMessage }) => (
  <div className="chat-interface">
    <FollowChatToggle followChat={followChat} toggleFollowChat={toggleFollowChat} />
    <ChatDisplay messages={messages} followChat={followChat} />
    <ChatInput sendMessage={sendMessage} />
  </div>
);

const ChessPage = () => {
  const [messages, setMessages] = useState([
    { text: 'Welcome to the game chat!', isUser: false },
  ]);
  const [followChat, setFollowChat] = useState(true);

  const toggleFollowChat = () => setFollowChat(!followChat);

  const sendMessage = (text) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { text, isUser: true },
      { text: 'Bot response here.', isUser: false },
    ]);
  };

  return (
    <div className="chess-page-container">
      <ChessboardPage />
      <ChatInterface 
        followChat={followChat} 
        toggleFollowChat={toggleFollowChat} 
        messages={messages} 
        sendMessage={sendMessage} 
      />
    </div>
  );
};

export default ChessPage;
