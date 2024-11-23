import chess # type: ignore
import requests
import random
from .LLM_engine import helper_functions as utils


class StockfishAPI:
    def __init__(self,depth=10):
        self.url ="https://chess-api.com/v1"
        self.headers = {
            "Content-Type": "application/json"
        }
        self.parameters = {
            "maxThinkingTime": 100,
            "depth":depth
        }

    def _send_request(self, payload):
        payload = {**self.parameters, **payload}
        response = requests.post(self.url, headers=self.headers, json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Request failed with status code {response.status_code}")
        
    # return the game status percentage of the white player
    def get_game_status(self, fen):
        if not utils.is_valid_fen(fen):
            return "No status available"
        payload = {
            "fen": fen,
        }
        response = self._send_request(payload)
        return response.get("winChance", "No status available")
    

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
    
    def evaluate_move_score(self, fen, move, player_color="w"):
        if not utils.is_valid_fen(fen) or not utils.is_valid_move(fen, move):
            return "No score available"

        evaluation_before = self.get_evaluation(fen)
        if evaluation_before == "No evaluation available":
            return "No score available"

        board = chess.Board(fen)
        uci_move = chess.Move.from_uci(move)
        board.push(uci_move)
        fen_after = board.fen()

        evaluation_after = self.get_evaluation(fen_after)
        if evaluation_after == "No evaluation available":
            return "No score available"

        if player_color == "b":
            evaluation_diff = (evaluation_before - evaluation_after)
        else:
            evaluation_diff = (evaluation_after - evaluation_before) 

        return evaluation_diff



