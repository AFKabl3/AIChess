import chess

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

def get_current_player(fen):
    return fen.split()[1]


def  is_valid_input_notation(fen):
    # split the FEN string into parts
    parts = fen.split()
    
    # Check if the FEN is valid
    if len(parts) != 6:
        # Will make a proper error handling, if needed
        raise ValueError(f"Invalid FEN format: {fen}. Expected 6 fields, got {len(parts)}.")
    
    # Check if the en passant field is valid
    en_passant = parts[3]
    if en_passant != "-":
        parts[3] = "-" 
    
    return ' '.join(parts)
