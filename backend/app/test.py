from flask import jsonify, Flask
from flask_cors import CORS
from flask import request
#route_utils module
from  routes_utils import helper_functions as utils
#stockfish modules
from stockfish import Stockfish
from stockfish import StockfishException
#Assistant module
from LLM_engine.main_coach import MainCoach

stockfish_path = utils.get_stockfish_binary_path()
stockfish = Stockfish(path=stockfish_path)

fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 2"
move = "e2e4"

is_valid_move = utils.is_valid_move(fen, move)

stockfish.set_fen_position(fen)
print(stockfish.get_evaluation().get('value', None))

new_fen = utils.move_to_fen(fen, move)

stockfish.set_fen_position(new_fen)
print(stockfish.get_evaluation().get('value', None))


