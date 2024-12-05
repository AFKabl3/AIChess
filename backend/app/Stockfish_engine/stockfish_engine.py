from stockfish import Stockfish
from .utils import utils

class StockfishEngine(Stockfish):
    def __init__(self, path):
        super().__init__(path)

    def is_move_valid(self, fen, move):
        new_fen = utils.from_move_to_fen(fen, move)
        if new_fen is None:
            return False
        return self.is_fen_valid(new_fen)

    def get_move(self, fen):
        self.set_fen_position(fen)
        return self.get_best_move()

    def get_move_evaluation(self, fen, move):
        self.set_fen_position(fen)
        evaluation_before = self.get_evaluation().get('value', None)
        fen_after_move = utils.from_move_to_fen(fen, move)
        self.set_fen_position(fen_after_move)
        evaluation_after = self.get_evaluation().get('value', None)

        if evaluation_before is None or evaluation_after is None:
           return None

        current_player = utils.get_current_player(fen)
        if current_player == "w":
            return evaluation_after - evaluation_before
        else:
            return evaluation_before - evaluation_after





