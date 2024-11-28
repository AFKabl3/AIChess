import { useState } from 'react';

const initialMessages = [{ text: 'Welcome to the game chat!', isUser: false }];

export const useChat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [followChat, setFollowChat] = useState(true);

  const addResponse = (obj, text) => {
    obj.text = text;
    obj.loading = false;

    setMessages((prevMessages) => [...prevMessages]); // force re-render since obj is a reference
  };

  const sendMessage = (text, isUser, loading) => {
    const obj = { text, isUser, loading };

    setMessages((prevMessages) => [...prevMessages, obj]);

    return (modifiedText) => addResponse(obj, modifiedText);
  };

  const sendUserChat = (text) => sendMessage(text, true);

  const addBotChat = (text, waitForResponse = false) => sendMessage(text, false, waitForResponse);

  return {
    messages,
    followChat,
    toggleFollowChat: () => setFollowChat(!followChat),
    sendUserChat,
    addBotChat,
    resetChat: () => setMessages(initialMessages),
  };
};
