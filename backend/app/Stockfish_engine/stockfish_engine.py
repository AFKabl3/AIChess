from stockfish import Stockfish
from chess import Board
import numpy as np
from .utils import utils

class StockfishEngine(Stockfish):
    def __init__(self, path):
        super().__init__(path)

    def is_move_valid(self, fen, move):
        new_fen = utils.from_move_to_fen(fen, move)
        if new_fen is None:
            return False
        return True
    

    def check_endgame(self, fen):
        '''
        return the type of the endgame, None if the game is not over
        '''
        try:
            board = Board(fen)
            if board.is_checkmate() or board.is_stalemate() or board.is_insufficient_material():
                return str(board.outcome().termination).split(".")[1].lower()
            return None
        except:
            return None


    def get_move_suggestion(self, fen):
        self.set_fen_position(fen)
        return self.get_best_move()

    def get_bot_move(self, fen, skill_level):
        self.set_skill_level(skill_level)
        self.set_fen_position(fen)
        return self.get_best_move()

    def get_board_evaluation(self, fen):
        self.set_fen_position(fen)
        # evaluation as lichess/chess.com (Stockfish provide it in centipawns)
        evaluation = self.get_evaluation().get('value') / 100
        return round(evaluation, 5)

    def get_move_evaluation(self, fen, move):
        evaluation_before = self.get_board_evaluation(fen)
        fen_after_move = utils.from_move_to_fen(fen, move)
        evaluation_after = self.get_board_evaluation(fen_after_move)
        # use the new funciton here, return some kind of endgame, so we directly ask llm
        if evaluation_before is None or evaluation_after is None:
           return None

        current_player = utils.get_current_player(fen)
        if current_player == "w":
            return round(evaluation_after - evaluation_before, 5)
        else:
            return round(evaluation_before - evaluation_after, 5)

    # calcutation of the winnig percentage of the current player
    def get_winning_percentage(self, fen):
        '''
        the fen provided is the position of the board after the move, so 
        the player in the fen is the one after the move  
        '''
        current_player = utils.get_current_player(fen)
        self.set_fen_position(fen)
        evaluation = self.get_evaluation()
        evaluation_type = evaluation.get('type')
        # calculate the evaluation value in centipawns
        evaluation_field = evaluation.get('value')

        if evaluation_type == "cp":
            # this formula is based on the one use in lichess
            percentage = 50 + 50 * (2 / (1 + np.exp(-0.00368208 * evaluation_field)) - 1)
        elif evaluation_type == "mate":
            if evaluation_field > 0:
                # the white player is winning
                percentage = 100.0
            else:
                # the black player is winning
                percentage = 0.0

        # if the current player is white, the one who made the move is the black
        if current_player == "b":
            percentage = 100.0 - percentage

        result ={
            "percentage": percentage,
            "current_player": current_player
        }
        return result






