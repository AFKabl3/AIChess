import { useState } from 'react';

export const useMoveHistory = () => {
  const [moveHistory, setMoveHistory] = useState([]); // Tracks moves with separate FEN states for the notation table
  const [isPaused, setIsPaused] = useState(false); // Tracks the pause/resume state

  const updateHistory = (move, fen, player) => {
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

  const resetHistory = () => {
    setMoveHistory([]);
    setIsPaused(false);
  };

  const undoLastMove = () => {
    setMoveHistory((prevHistory) => {
      if (prevHistory.length < 2) return []; // If less than 2 moves, reset to default
      return prevHistory.slice(0, -1); // Remove the last two moves
    });
  };

  return {
    history: moveHistory,
    isPaused,
    setIsPaused,
    updateHistory,
    resetHistory,
    undoLastMove,
  };
};