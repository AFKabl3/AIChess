import chess # type: ignore
import requests

from AIChess.backend.app.LLM_engine.utilities import is_valid_move
from AIChess.backend.app.LLM_engine.utilities import is_valid_fen


class Stockfish:
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
    

    def get_evaluation(self, fen):
        if not is_valid_fen(fen):
            return "No evaluation available"
        payload = {
            "fen": fen,
        }
        response = self._send_request(payload)
        return response.get("eval", "No evaluation available")
    
    def evaluate_move_score(self, fen, move, player_color="w"):
        if not is_valid_fen(fen) or not is_valid_move(fen, move):
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



