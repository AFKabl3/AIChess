import chess # type: ignore
import requests
from app.LLM_engine.utilities import is_valid_move
from app.LLM_engine.utilities import is_valid_fen
import pdb


class Stockfish:
    def __init__(self,depth=10):
        self.url ="https://stockfish.online/api/s/v2.php"
        self.headers = {
            "Content-Type": "application/json"
        }
        self.parameters = {
            "depth":depth
        }

    def _send_request(self, payload):
        payload = {**self.parameters, **payload}

        response = requests.get(self.url, headers=self.headers, params=payload)
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
        return response.get("evaluation", "No evaluation available")
    
    def evaluate_move_score(self, fen, move):
        if not is_valid_fen(fen) or not is_valid_move(fen, move):
            return "No score available"

        board = chess.Board(fen)
        uci_move = chess.Move.from_uci(move)
        board.push(uci_move)
        fen_after = board.fen()

        evaluation_after = self.get_evaluation(fen_after)
        if evaluation_after == "No evaluation available":
            return "No score available"

        # I have deleted the evaluation_before because I think it gave wrong scores for the evaluation part. 
        evaluation_diff = evaluation_after 

        return evaluation_diff



