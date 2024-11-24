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

    /**
   * Handles the player sending a question through the chatbox.
   *
   * @param {string} text - The question made by the player that mustn't exceed 200 words.
   * @returns {Promise<void>} - A promise that resolves when the move evaluation is complete.
   */
    const sendUserChat = async (text) => {
      if(lock == true) {
        waitForResponseToast(); 
        return;
      }
      if (!llmUse) return;
  
      const index = sendMessage(text, true);
  
      setLock(true);
      try {
        const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";  /* example FEN state */
        const res = await api.answerChessQuestion(fen, text);
    
        if (res.ok) {
          const data = await res.json();
          const answer = data.answer;
          addBotChat(answer);
        } else {
          const errorData = await res.json();
          addBotChat(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error calling the API:', error);
        addBotChat('An error occurred while processing your question.');
      }
      setLock(false);
    };

  const addBotChat = (text) => sendMessage(text, false);

  return {
    messages,
    followChat,
    toggleFollowChat: () => setFollowChat(!followChat),
    sendUserChat,
    addBotChat,
  };
};
