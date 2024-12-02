import { useState } from 'react';

export const useMoveHistory = () => {
  const [moveHistory, setMoveHistory] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [savedFEN, setSavedFEN] = useState(null);

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
      if (prevHistory.length < 2) return [];
      return prevHistory.slice(0, -1);
    });
  };

  const saveFEN = (fen) => {
    // Save the FEN and ensure it exists in the history
    setSavedFEN(fen);
    setMoveHistory((prevHistory) => {
      if (prevHistory.find((entry) => entry.user?.fen === fen || entry.bot?.fen === fen)) {
        return prevHistory; // FEN already exists in the history
      }
      return [
        ...prevHistory,
        { user: { san: 'Saved FEN', fen }, bot: null }, // Add a placeholder entry for the saved FEN
      ];
    });
  };

  const resetSavedFEN = () => setSavedFEN(null);

  const resetToFEN = (fen) => {
    const index = moveHistory.findIndex(
      (entry) => entry.user?.fen === fen || entry.bot?.fen === fen
    );

    if (index !== -1) {
      // Truncate the history to the saved FEN
      setMoveHistory(moveHistory.slice(0, index + 1));
    } else if (fen) {
      // If no match, add a synthetic entry for the saved FEN
      setMoveHistory([{ user: { san: 'Saved FEN', fen }, bot: null }]);
    }
  };

  return {
    history: moveHistory,
    isPaused,
    setIsPaused,
    updateHistory,
    resetHistory,
    undoLastMove,
    savedFEN,
    saveFEN,
    resetSavedFEN,
    resetToFEN,
  };
};
