import os
from dotenv import load_dotenv
from chess import Board, Move
from chess import IllegalMoveError, InvalidMoveError, AmbiguousMoveError

def get_stockfish_binary_path():
    current_file_path = os.path.abspath(__file__)
    backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file_path))))
    load_dotenv()
    stockfish_relative_path = os.getenv("STOCKFISH_EXECUTABLE")
    return os.path.join(backend_path, stockfish_relative_path)

def from_move_to_fen(fen, move):
    try:
        board = Board(fen)
        chess_move = board.parse_san(move) if len(move) <= 3 else board.parse_uci(move)
        board.push(chess_move)
        return board.fen()
    except(IllegalMoveError, InvalidMoveError, AmbiguousMoveError):
        return None

def is_skill_level_valid(skill_level):
    return isinstance(skill_level, int) and skill_level in range(0,21)

def get_current_player(fen):
    return fen.split()[1]

def uci_to_san(fen, move):
    try:
        board = Board(fen)
        move = Move.from_uci(move)
        san_move = board.san(move)
        return san_move
    except (IllegalMoveError, InvalidMoveError, AmbiguousMoveError):
        return None

