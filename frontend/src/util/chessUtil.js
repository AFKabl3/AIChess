export const formatUciMove = (move) => {
  if (move === null) return null;

  let uciMove = `${move.from}${move.to}`;

  if ('promotion' in move) {
    uciMove += move.promotion.toLowerCase();
  }

  return uciMove;
};

export const getKingPosition = (game) => {
  // Flatten the 2D board array and iterate over each square
  const kingPosition = []
    .concat(...game.board())
    .map((piece, index) => {
      // Check if the piece is the king
      if (piece !== null && piece.type === 'k' && piece.color === game.turn()) {
        return index;
      }
    })
    .filter(Number.isInteger);

  // If the king is found, convert the index to chess notation
  if (kingPosition.length > 0) {
    const pieceIndex = kingPosition[0];
    const row = 'abcdefgh'[pieceIndex % 8];
    const column = Math.ceil((64 - pieceIndex) / 8);
    return row + column;
  }

  // Return null if the king is not found
  return null;
};
