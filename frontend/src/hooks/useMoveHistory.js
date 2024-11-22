import { useState } from 'react';

export const useMoveHistory = () => {
  const [moveHistory, setMoveHistory] = useState([]); // Tracks moves with separate FEN states for the notation table
  const [isPaused, setIsPaused] = useState(false); // Tracks the pause/resume state

  const updateNotation = (move, fen, player) => {
    setMoveHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      if (player === 'user') {
        newHistory.push({ user: { san: move.san, fen }, bot: null });
      } else {
        newHistory[newHistory.length - 1].bot = { san: move.san, fen };
      }
      return newHistory;
    });
  };

  const resetNotation = () => setMoveHistory([]);

  return {
    history: moveHistory,
    isPaused,
    setIsPaused,
    updateNotation,
    resetNotation,
  };
};
