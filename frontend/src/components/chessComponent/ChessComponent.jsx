import { Box, Typography } from '@mui/material';
import { useWindowSize } from '@uidotdev/usehooks';
import PropTypes from 'prop-types';
import { Chessboard } from 'react-chessboard';
import { ChessContext } from '../../pages/ChessPage/ChessContext';
import { useContext } from 'react';

export const ChessComponent = ({ chess }) => {
  const { height, width } = useWindowSize();
  const { config } = useContext(ChessContext);

  const getBoardOrientation = () => {
    if (config.fullControlMode) {
      return chess.turn === 'w' ? 'white' : 'black';
    }
    return config.selectedColor === 'w' ? 'white' : 'black';
  };

  const boardOrientation = getBoardOrientation();

  const {
    position,
    onDrop,
    onPieceDragBegin,
    onPieceDragEnd,
    onSquareClick,
    onSquareRightClick,
    onPromotionPieceSelect,
    showPromotionDialog,
    optionSquares,
    rightClickedSquares,
    statusMessage,
    moveTo,
    arrows,
  } = chess;

  return (
    <Box sx={{ position: 'relative' }}>
      <Chessboard
        boardWidth={Math.min(height - 210, width / 1.5 - 175)} // Responsive board width
        position={position}
        onPieceDrop={onDrop}
        animationDuration={200}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDragEnd={onPieceDragEnd}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        onPromotionPieceSelect={onPromotionPieceSelect}
        promotionToSquare={moveTo}
        showPromotionDialog={showPromotionDialog}
        boardOrientation={boardOrientation}                                             
        customBoardStyle={{
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          
        }}
        customSquareStyles={{
          ...optionSquares,
          ...rightClickedSquares,
        }}
        customDarkSquareStyle={{ backgroundColor: '#D68B5E' }}
        customLightSquareStyle={{ backgroundColor: '#FFE8D1' }}
        customArrows={arrows}
      />

      {statusMessage && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            bgcolor: 'custom.shadow40',
            p: 2,
            borderRadius: 2,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {statusMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

ChessComponent.propTypes = {
  chess: PropTypes.object.isRequired,
};
