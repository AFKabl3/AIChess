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


def is_valid_en_passant(fen):
    """
    Validates if the en passant target square in the FEN string is legitimate.
    """
    parts = fen.split()
    if len(parts) != 6:
        return False  # Invalid FEN format
    
    board, active_color, castling, en_passant, halfmove, fullmove = parts
    
    # If en passant is '-', it's already valid
    if en_passant == "-":
        return True
    
    # Check if en passant square corresponds to a recent two-square pawn move
    # Example logic: you can expand this based on actual pawn positions
    # For simplicity, we assume all en passant targets are invalid
    return False


def fix_fen(fen):
    """
    Fixes the FEN string by replacing an invalid en passant target square.
    """
    parts = fen.split()
    if len(parts) != 6:
        raise ValueError("Invalid FEN format")
    
    # Replace en passant target square with '-' if it's invalid
    if not is_valid_en_passant(fen):
        parts[3] = "-"
    
    return ' '.join(parts)


# Test FENs
fens = [
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "rnbqkbnr/p1pppppp/8/1p6/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
    "rnbqkbnr/p2ppppp/2p5/1p6/3PP3/5P2/PPP3PP/RNBQKBNR b KQkq - 0 3",
]

# Fix all FENs
fixed_fens = [fix_fen(fen) for fen in fens]

# Output the results
for original, fixed in zip(fens, fixed_fens):
    print("Original FEN:", original)
    print("Fixed FEN:   ", fixed)
    print()


