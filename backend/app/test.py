from routes_utils import helper_functions as helper
from stockfish import Stockfish
from stockfish import StockfishException
from LLM_engine.main_coach import MainCoach


stockfish_path = helper.get_stockfish_binary_path()
stockfish = Stockfish(path=stockfish_path,)


print(stockfish.get_parameters())

print(stockfish.depth)
