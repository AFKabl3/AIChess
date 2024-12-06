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

    def get_move_suggestion(self, fen):
        self.set_fen_position(fen)
        return self.get_best_move()

    def get_bot_move(self, fen, skill_level):
        self.set_skill_level(skill_level)
        self.set_fen_position(fen)
        return self.get_best_move()

    def get_board_evaluation(self, fen):
        self.set_fen_position(fen)
        evaluation = self.get_evaluation().get('value')
        return evaluation

    def get_move_evaluation(self, fen, move):
        evaluation_before = self.get_board_evaluation(fen)
        fen_after_move = utils.from_move_to_fen(fen, move)
        evaluation_after = self.get_board_evaluation(fen_after_move)

        if evaluation_before is None or evaluation_after is None:
           return None

        current_player = utils.get_current_player(fen)
        if current_player == "w":
            return evaluation_after - evaluation_before
        else:
            return evaluation_before - evaluation_after





