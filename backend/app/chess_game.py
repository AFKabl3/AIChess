
import chess

class ChessGame:
    def __init__(self):
        self.board = chess.Board()
    
    def make_move(self, move_uci):
        move = chess.Move.from_uci(move_uci)
        if move in self.board.legal_moves:
            self.board.push(move)
            return True
        return False

    def reset_game(self):
        self.board.reset()
