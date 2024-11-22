import { Box, Stack, Typography } from '@mui/material';
import { useWindowSize } from '@uidotdev/usehooks';
import PropTypes from 'prop-types';
import { Chessboard } from 'react-chessboard';
import './ChessComponent.css';

export const ChessComponent = ({ chess }) => {
  const { height, width } = useWindowSize();

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
    isGameOver,
    statusMessage,
    moveTo,
  } = chess;

  return (
    <Box className="chessboard-container">
      <Box className="chessboard-box">
        <Chessboard
          boardWidth={Math.min(height, width / 1.5) - 150} // Responsive board width
          position={position}
          onPieceDrop={onDrop}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          animationDuration={200}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          onPromotionPieceSelect={onPromotionPieceSelect}
          promotionToSquare={moveTo}
          showPromotionDialog={showPromotionDialog}
          customBoardStyle={{
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
          customSquareStyles={{
            ...optionSquares,
            ...rightClickedSquares,
          }}
          customDarkSquareStyle={{ backgroundColor: '#769656' }}
          customLightSquareStyle={{ backgroundColor: '#EEEED2' }}
        />

        {isGameOver && (
          <Stack className="game-over-message">
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {statusMessage}
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

ChessComponent.propTypes = {
  chess: PropTypes.object.isRequired,
};
