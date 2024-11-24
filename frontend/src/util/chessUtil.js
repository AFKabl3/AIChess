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

/**
 * Parses a move string into an tuple containing the starting and ending positions.
 *
 * @param {string} move - The move string in the format 'fromto' (e.g., 'e2e4') or null.
 * @returns {Array<string>} The arrow tuple containing the starting and ending positions.
 */
export const parseArrow = (move) => {
  if (move === null) return null;

  const from = move.slice(0, 2);
  const to = move.slice(2, 4);

  return [from, to, '#66bb6a'];
};
