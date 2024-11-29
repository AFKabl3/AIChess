import os
from chess import IllegalMoveError, InvalidMoveError, AmbiguousMoveError
from chess import Board
from dotenv import load_dotenv

'''
method to retrieve the stockfish path from .env because it load_dotenv doesn't work in a correct way
'''
def get_stockfish_binary_path():
    current_file_path = os.path.abspath(__file__)
    backend_path = os.path.dirname(os.path.dirname(os.path.dirname(current_file_path)))
    load_dotenv()
    stockfish_relative_path = os.getenv("STOCKFISH_EXECUTABLE")
    return os.path.join(backend_path, stockfish_relative_path)


# make the move using the current board state and generate the fen
def move_to_fen(fen, move):
    board = Board(fen)
    chess_move = board.parse_san(move) if len(move) <= 3 else board.parse_uci(move)
    board.push(chess_move)
    return board.fen()

def is_valid_move(fen, move):
    board = Board(fen)
    try:
        chess_move = board.parse_san(move) if len(move) <= 3 else board.parse_uci(move)
        if chess_move in board.legal_moves:
            return True
        else:
            return False
    except (IllegalMoveError, InvalidMoveError, AmbiguousMoveError):
        return False

def is_valid_num(depth):
    return isinstance(depth, int) and depth >= 0

def get_current_player(fen):
    return fen.split()[1]

def delta_evaluation(fen, evaluation_before, evaluation_after):
    if get_current_player(fen) == 'w':
        return evaluation_after - evaluation_before
    else:
        return evaluation_before - evaluation_after

def get_board(fen):
    return fen.split()[0]

def is_valid_question(question):
    return isinstance(question, str)
