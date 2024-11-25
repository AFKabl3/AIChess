import { useState } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([{ text: 'Welcome to the game chat!', isUser: false }]);
  const [followChat, setFollowChat] = useState(true);

  const modifyMessageText = (index, text) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];

      newMessages[index].text = text;
      return newMessages;
    });
  };

  const sendMessage = (text, isUser) => {
    const index = messages.length;

    setMessages((prevMessages) => [...prevMessages, { text, isUser }]);

    return (modifiedText) => modifyMessageText(index, modifiedText);
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
