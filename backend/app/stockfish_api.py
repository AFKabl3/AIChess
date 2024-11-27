import chess # type: ignore
import requests
import random
from .LLM_engine import helper_functions as utils
import pdb

class StockfishAPI:
    def __init__(self, depth):
        self.url = "https://chess-api.com/v1"
        self.headers = {
            "Content-Type": "application/json"
        }
        self.parameters = {
            "maxThinkingTime": 100,
            "depth": depth
        }

    def _send_request(self, payload):
        payload = {**self.parameters, **payload}
        response = requests.post(self.url, headers=self.headers, json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Request failed with status code {response.status_code}")

    # Method to retrieve the next best move stockfish suggests / would make
    def get_next_best_move(self, fen, depth):
        # Modify the parameters for the chess_bot, then brought back to standard
        # after call of the method to not mess with further evaluations
        if not utils.is_valid_fen(fen) or not utils.is_valid_depth(depth):
            return "No status available"
        # self.parameters = {
        #     "maxThinkingTime": 100,
        #     "depth": depth
        # }
        # we define the other parameters:
        # passing fen the frontend sent to us
        # setting number of variants (responses from stockfish as "best continuations") to 1
        # variant = random.randint(1,5)
        payload = {
            "fen": fen,
            "depth": depth
            # "variants": variant
        }
        # pdb.set_trace()
        # retrieve the response and extract the data
        data = self._send_request(payload)
        response = data.get("move", "No status available")
        # We retrieve the first element = bot move
        return response

    # return the game status percentage of the white player
    def get_game_status(self, fen):
        if not utils.is_valid_fen(fen):
            return "No status available"
        payload = {
            "fen": fen,
        }
        response = self._send_request(payload)
        return response.get("winChance", "No status available")

    # return an array of next moves to be played
    def get_evaluation(self, fen):
        if not utils.is_valid_fen(fen):
            return "No evaluation available"
        payload = {
            "fen": fen,
        }
        response = self._send_request(payload)
        return response.get("eval", "No evaluation available")

    # return an array of next moves to be played
    def get_next_moves(self, fen):
        if not utils.is_valid_fen(fen):
            return "No evaluation available"
        payload = {
            "fen": fen,
            "variants:": (random.randint(1, 5))
        }
        response = self._send_request(payload)
        next_moves = response.get("continuationArr", "No suggestions available")
        if next_moves == "No suggestions available":
            return "No suggestions available"
        return next_moves

    # return one suggested move for the current player
    def get_move_suggestion(self, fen):
        if not utils.is_valid_fen(fen):
            return "No evaluation available"
        payload = {
            "fen": fen,
            "variants:": (random.randint(1, 5))
        }
        response = self._send_request(payload)
        suggested_move = response.get("move", "No suggestions available")
        if suggested_move == "No suggestions available":
            return "No suggestions available"
        return suggested_move

    # return the delta of the evaluation of the board state without the move and with the move
    def evaluate_move_score(self, fen, move):
        if not utils.is_valid_fen(fen) or not utils.is_valid_move(fen, move):
            return "No score available"

        evaluation_before = self.get_evaluation(fen)
        if evaluation_before == "No evaluation available":
            return "No score available"

        new_fen = utils.move_to_fen(fen, move)
        evaluation_after = self.get_evaluation(new_fen)
        if evaluation_after == "No evaluation available":
            return "No score available"

        if utils.get_current_player(fen) == "w":
            return evaluation_after - evaluation_before
        else:
            return evaluation_before - evaluation_after
