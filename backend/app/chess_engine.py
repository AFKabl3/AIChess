import chess

class ChessEngine:
    def __init__(self):
        self.board = chess.Board()

    #TO RE - DO
    # def make_move(self, move_uci):
    #     move = chess.Move.from_uci(move_uci)
    #     if move in self.board.legal_moves:
    #         self.board.push(move)
    #         return True
    #     return False

    def make_move(self, move_uci):
        move = chess.Move.from_uci(move_uci)
        self.board.push(move)

    def is_illegal_move(self, move_uci):
        move = chess.Move.from_uci(move_uci)
        if move not in self.board.legal_moves:
            return True
        else:
            return False

    #TO DO
    # def is_check(self):
    #     return self.board.is_check()
    #
    # def is_check_mate(self):
    #     return  self.is_check_mate()

    def get_possible_moves(self, square_index):
        moves = [move for move in self.board.legal_moves if move.from_square == square_index]
        moves_uci = [move.uci() for move in moves]
        return moves_uci

    def reset_game(self):
        self.board.reset()