import os
import chess
from dotenv import load_dotenv

'''
method to retrieve the stockfish path from .env because it load_dotenv doesn't work in a correct way
'''
def get_stockfish_binary_path():
    current_file_path = os.path.abspath(__file__)
    backend_path = os.path.dirname(os.path.dirname(os.path.dirname(current_file_path)))
    dotenv_path = os.path.join(backend_path, "env", ".env")

    with open(dotenv_path, 'r') as file:
        str = file.read().split("\n")
        for line in str:
            env_var = line.split("=")
            if env_var[0] == 'STOCKFISH':
                return backend_path + env_var[1]

'''
method to retrieve the huggingface API from .env because it load_dotenv doesn't work in a correct way
'''

def get_LLM_API():
    current_file_path = os.path.abspath(__file__)
    backend_path = os.path.dirname(os.path.dirname(os.path.dirname(current_file_path)))
    dotenv_path = os.path.join(backend_path, "env", ".env")

    with open(dotenv_path, 'r') as file:
        str = file.read().split("\n")
        for line in str:
            env_var = line.split("=")
            if env_var[0] == 'SECRET_KEY':
                return env_var[1]





def is_valid_fen(fen):
    try:
        board = chess.Board(fen)
        return board.is_valid()     # <- check basic chess rules => we have to trust the frontend engine
    except ValueError:
        return False

def is_valid_move(fen, move):
    try:
        move_to_fen(fen, move)
        return is_valid_fen(fen)
    except ValueError:
        return False

# make the move using the current board state and generate the fen
def move_to_fen(fen, move):
    board = chess.Board(fen)
    chess_move = board.parse_san(move) if len(move) <= 3 else board.parse_uci(move)
    board.push(chess_move)
    return board.fen()

def is_valid_depth(depth):
    return isinstance(depth, int) and depth >= 2

def get_current_player(fen):
    return fen.split()[1]

def is_valid_question(question):
    if len(question) > 200: #provisional error control, checks the question is not more than 200 characters long
        return False
    return True

