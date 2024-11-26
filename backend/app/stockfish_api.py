import chess # type: ignore
import requests
import random
from .LLM_engine import helper_functions as utils

class StockfishAPI:
    def __init__(self, depth=2):
        self.url = "https://chess-api.com/v1"
        self.depth = depth
        self.headers = {
            "Content-Type": "application/json"
        }
        self.parameters = {
            "maxThinkingTime": 100,
            "depth": depth
        }

    # function that modify the depth attribute and also the 'depth' field in
    # parameters
    def modify_depth(self, depth=2):
        self.depth = depth
        self.parameters["depth"] = depth

    def _send_request(self, payload):
        payload = {**self.parameters, **payload}
        response = requests.post(self.url, headers=self.headers, json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Request failed with status code {response.status_code}")

    # return the winning percentage of the current player
    def get_player_winning_chance(self, fen):
        if not utils.is_valid_fen(fen):
            return "No status available"
        payload = {
            "fen": fen,
        }
        response = self._send_request(payload)
        win_chance = response.get("winChance", "No status available")
        if win_chance == "No status available":
            return "No status available"
        current_player = utils.get_current_player(fen)
        if current_player == "w":
            return win_chance
        return 100 - win_chance

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
        variant = (random.randint(1, 5))
        payload = {
            "fen": fen,
            "variants:": variant
        }
        response = self._send_request(payload)
        next_moves = response.get("continuationArr", "No suggestions available")
        if next_moves == "No suggestions available":
            return "No suggestions available"
        return next_moves

    # return the next best move for the current player
    def get_best_move(self, fen):
        if not utils.is_valid_fen(fen):
            return "No evaluation available"
        variant = random.randint(1,5)
        payload = {
            "fen": fen,
            "variants:": variant
        }
        response = self._send_request(payload)
        best_move = response.get("move", "No move available")
        return best_move

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

        current_player = utils.get_current_player(fen)
        if current_player == "w":
            return evaluation_after - evaluation_before
        else:
            return evaluation_before - evaluation_after
