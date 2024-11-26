import { useState } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([{ text: 'Welcome to the game chat!', isUser: false }]);
  const [followChat, setFollowChat] = useState(true);

  const modifyMessageText = (obj, text) => {
    obj.text = text;
    setMessages((prevMessages) => [...prevMessages]); // force re-render since obj is a reference
  };

  const sendMessage = (text, isUser) => {
    const obj = { text, isUser };

    setMessages((prevMessages) => [...prevMessages, obj]);

    return (modifiedText) => modifyMessageText(obj, modifiedText);
  };

  const sendUserChat = (text) => sendMessage(text, true);

  const addBotChat = (text) => sendMessage(text, false);

  return {
    messages,
    followChat,
    toggleFollowChat: () => setFollowChat(!followChat),
    sendUserChat,
    addBotChat,
  };
};
