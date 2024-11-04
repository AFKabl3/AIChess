import { React, useState } from "react";
import { Box } from "@mui/material";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import '../styles/chessboard.css'


export const ChessboardPage = () => {

  const [game, setGame] = useState(new Chess());                              // Saving the position of the pieces on the board

  const [moveFrom, setMoveFrom] = useState("");                               // Initial position of the piece moved
  const [moveTo, setMoveTo] = useState(null);                                 // Final position of the piece moved

  const [showPromotionDialog, setShowPromotionDialog] = useState(false);      // Promotion of the pawn ('p') [true / false]
  const [rightClickedSquares, setRightClickedSquares] = useState({});         // 
  const [moveSquares, setMoveSquares] = useState({});                         // 
  const [optionSquares, setOptionSquares] = useState({});                     // 

  console.log(game);

  // Data save
  function safeGameMutate(modify) {
    setGame( (g) => {
      const update = {...g}
      modify(update);
      return update;
    })
  }

  function getMoveOptions(square) {
    const moves = game.moves({ square, verbose: true });
    const newSquares = {};

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    moves.map(move => {
      newSquares[move.to] = {
        background: game.get(move.to) && game.get(move.to).color !== game.get(square).color ? 
        "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)" : 
        "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%"
      };
      return move;
    });

    newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };

    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square) {
    setRightClickedSquares({});
    
    // from square
    if ( !moveFrom ) {
      const hasMoveOptions = getMoveOptions(square);

      if (hasMoveOptions) 
        setMoveFrom(square);
      return;
    }

    // to square
    if ( !moveTo ) {
      // check if valid move before showing dialog
      const moves = game.moves( { moveFrom, verbose: true } );
      const foundMove = moves.find( m => m.from === moveFrom && m.to === square );

      // not a valid move
      if (!foundMove) {
        // check if clicked on new piece
        const hasMoveOptions = getMoveOptions(square);

        // if new piece, setMoveFrom, otherwise clear moveFrom
        setMoveFrom(hasMoveOptions ? square : "");
        return;
      }

      // valid move
      setMoveTo(square);

      // if promotion move
      if (foundMove.color === "w" && foundMove.piece === "p" && square[1] === "8" || 
          foundMove.color === "b" && foundMove.piece === "p" && square[1] === "1") {
        setShowPromotionDialog(true);
        return;
      }

      // is normal move
      const gameCopy = { ...game };
      const move = gameCopy.move( { from: moveFrom, to: square, promotion: "q" } );

      // if invalid, setMoveFrom and getMoveOptions
      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) 
          setMoveFrom(square);
        return;
      }

      setGame(gameCopy);
      setTimeout(makeRandomMove, 300);
      setMoveFrom("");
      setMoveTo(null);
      setOptionSquares({});
      return;
    }
  }

  function onPromotionPieceSelect(piece) {
    // if no piece passed then user has cancelled dialog, don't make move and reset
    if (piece) {
      const gameCopy = { ...game };

      gameCopy.move({ from: moveFrom, to: moveTo, promotion: piece[1].toLowerCase() ?? "q" });
      setGame(gameCopy);
      setTimeout(makeRandomMove, 300);
    }

    setMoveFrom("");
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
    return true;
  }

  function onSquareRightClick(square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]: rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour ? undefined : { backgroundColor: colour }
    });
  }

  // Movement of computer
  function makeRandomMove() {
    const possibleMove = game.moves();

    // exit if the game is over
    if (game.game_over() || game.in_draw() || possibleMove.length === 0)
      return;

    // select random move
    const randomIndex = Math.floor(Math.random() * possibleMove.length);

    // play random move
    safeGameMutate( (game) => game.move(possibleMove[randomIndex]) )
  }

  // Perform an action when a piece is droped by a user
  function onDrop(source, target) {
    let move = null;

    safeGameMutate( (game) => {
      move = game.move( { from: source, to: target, promotion: 'q' } )
    })

    // Illigal move
    if (move == null) 
      return false
    
    // Valid move
    setTimeout(makeRandomMove, 200);
    return true;
  }

  return (
  <div className="boardWrapper">
    <Chessboard className="customBoardStyle"
      position = { game.fen() }
      onPieceDrop = { onDrop }

      animationDuration = { 200 } 
      arePiecesDraggable = { true } 
      onSquareClick = { onSquareClick } 
      onSquareRightClick = { onSquareRightClick } 
      onPromotionPieceSelect = { onPromotionPieceSelect } 
      promotionToSquare = { moveTo } 
      showPromotionDialog = { showPromotionDialog }

      customBoardStyle={{
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
      }} 
      customSquareStyles={ { ...moveSquares, ...optionSquares, ...rightClickedSquares } }
    />

    <button className="buttonStyle" onClick={() => {
        safeGameMutate(game => { game.reset(); });
        setMoveSquares({});
        setOptionSquares({});
        setRightClickedSquares({});
      }}>
      reset
    </button>

      <button className="buttonStyle" onClick={() => {
        safeGameMutate(game => {
          game.undo();
        });
        setMoveSquares({});
        setOptionSquares({});
        setRightClickedSquares({});
      }}>
          undo
      </button>
  </div>
  );
}
