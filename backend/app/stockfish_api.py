import chess # type: ignore
import requests
import math
import ast

import AIChess.backend.app.LLM_engine.helper_functions as utils

""""
chess-api.com response ex:
{
    text: "Move b7 → b8 (b8=Q+): [-11.62]. Black is winning. Depth 12.",
    eval: -11.62,
    move: "b7b8q",
    fen: "8/1P1R4/n1r2B2/3Pp3/1k4P1/6K1/Bppr1P2/2q5 w - - 0 1",
    depth: 12,
    winChance: 1.3672836783305158,
    continuationArr: (5) ['a6c5', 'b7b8q', 'c6b6', 'b8b6', 'b4a3'],
    mate: null,
    centipawns: "-1162",

    san: "b8=Q+",
    lan: "b7b8q",
    turn: "w",
    color: "w",
    piece: "p",
    flags: "np",
    isCapture: false,
    isCastling: false,
    isPromotion: true,

    from: "b7",
    to: "b8",
    fromNumeric: "27",
    toNumeric: "28",

    taskId: "0k1pkg83g",
    time: 10677,
    type: "move"
}
"""


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

    # return the current
    def get_player_game_status(self, fen):
        if not utils.is_valid_fen(fen):
            return "No evaluation available"
        payload = {
            "fen": fen,
        }
        response = self._send_request(payload)
        return response.get("winChance", "No evaluation available")

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
        }
        response = self._send_request(payload)
        next_moves = response.get("continuationArr", "No suggestions available")
        if next == "No suggestions available":
            return "No suggestions available"
        return next_moves

    def get_move_suggestion(self, fen):
        next_moves = self.get_next_moves(fen)
        if next_moves == "No suggestions available":
            return "No suggestion available"
        return next_moves[1]

    def evaluate_move_score(self, fen, move):
        print(type(move))
        if not utils.is_valid_fen(fen) or not utils.is_valid_move(fen, move):
            print("first if")
            return "No score available"

        evaluation_before = self.get_evaluation(fen)
        if evaluation_before == "No evaluation available":
            print("second if")
            return "No score available"

        new_fen = utils.move_to_fen(fen, move)
        evaluation_after = self.get_evaluation(new_fen)
        if evaluation_after == "No evaluation available":
            print("third if")
            return "No score available"

        evaluation_after = float(evaluation_after)
        evaluation_before = float(evaluation_before)


        return abs(abs(evaluation_after) - abs(evaluation_before))

