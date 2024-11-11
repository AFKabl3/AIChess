export const formatUciMove = (move) => {
  let uciMove = `${move.from}${move.to}`;

  if ('promotion' in move) {
    uciMove += move.promotion.toLowerCase();
  }

  return uciMove;
};
