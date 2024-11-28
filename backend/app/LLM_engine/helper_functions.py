import os
import platform
import chess


def get_stockfish_binary_path():
    system = platform.system().lower()
    architecture = platform.machine().lower()

    base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "stockfish_binaries")
    if system == 'windows':
        return os.path.join(base_dir, "windows", "stockfish.exe")
    elif system == 'linux':
        if architecture == 'x86_64':
            return os.path.join(base_dir, "linux", "x86_64", "stockfish-linux-x86-64")
        elif architecture == 'arm':
            return os.path.join(base_dir, "linux", "arm", "stockfish-linux-arm")
    elif system == 'darwin':
        if architecture == 'x86_64':
            return os.path.join(base_dir, "mac", "x_86_64", "stockfish-macos-arm")
        elif architecture == 'arm':
            return os.path.join(base_dir, "mac", "arm", "stockfish-macos-arm")
    else:
        raise OSError(f"Unsupported system: {system}")

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


