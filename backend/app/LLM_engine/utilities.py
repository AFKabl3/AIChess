import chess
import pdb;
def is_valid_fen(fen):
    try:
        board = chess.Board(fen)
        return board.is_valid()     # <- check basic chess rules => we have to trust the frontend engine
    except ValueError:
        return False

def is_valid_move(fen, move):
    # pdb.set_trace()
    try:
        board = chess.Board(fen)
        chess_move = board.parse_san(move) if len(move) <= 3 else board.parse_uci(move)
        board.push(chess_move)
        fen = board.fen()
        return is_valid_fen(fen)
    except ValueError:
        return False