import { useState } from 'react';

export const useMoveHistory = () => {
  const [moveHistory, setMoveHistory] = useState([]); // Tracks moves with separate FEN states for the notation table
  const [isPaused, setIsPaused] = useState(false); // Tracks the pause/resume state
  const [savedFEN, setSavedFEN] = useState(null);

  const updateHistory = (move, fen, player) => {
    setMoveHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const lastMove = player === 'user' ? newHistory[newHistory.length - 1]?.user : newHistory[newHistory.length - 1]?.bot;
      const isMoveDifferent = lastMove?.fen !== fen;
      const moveData = { san: move.san, fen };

      if (lastMove === null) {
        if (player === 'user') {
          newHistory[newHistory.length - 1].user = moveData;
        } else if (player === 'bot') {
          newHistory[newHistory.length - 1].bot = moveData;
        }
      } else if (lastMove === undefined || isMoveDifferent) {
        const newMove = player === 'user' ? { user: moveData, bot: null } : { user: null, bot: moveData };
        newHistory.push(newMove);
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
