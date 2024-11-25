"""
Aim of this file:
- we receive the response from Stockfish engine reguarding the position we are currently in
- we want to leverage libraries and chess knowledge to extract as many info as possible about the position
- maybe also we want to express the chessboard from fen to other notation
- than create the prompt for the llm to ork with 


What do we want to address chessly speaking to be able to feed correctly the LLM:
- material advantage
- king safety
- Activity of pieces
- Passed pawns
- Pawn structure (maybe too advanced)
- Presence of tactics:
        - Forks
        - pins
        - double attacks
        - overload of pieces
- center control / space control
- Developement difference
- Castling rights
-open files control (maybe too much for real advantage)

- Openings (maybe not needed)

Libraries:
- python-chess
- stockfish integration in python
- chess-analyze
- chess-pgn
"""
import chess
import chess.svg


class Chess_LLM_middleman:
    
    def __init__(self, fen:str):
        
        self.fen = fen
        self.board_state = self.parse_fen()                     # extract the fen part reguarding the board state
        self.material_situation = self.count_material()         # stores all the info about material in the current board state
        pass



    def parse_fen(self):
        """
        Extract the board state from the FEN string.
        """
        return self.fen.split()[0]  # The board state is the first part of FEN
    

     
    def fen_to_ascii(self, fen: str) -> str:
        """
        method for transformation from fen notation to "visialized" board in ascii
        ascii may more readable by the LLM than plain fen notation
        Args: 
            - fen: FEN string describing the board state
        
        Returns:
            - str: ASCII representation of the board
        """

        chessboard_rows = fen.split()[0].split("/")
        # fen notation is splitted, interst in only the first part of the fen = chessboard state (=> [0])
        # Then each part of the board representation is isolated (corresponding to each raw of the bard)
        # Since in fen notation they are separated by "/" char
        # At the end rows = list of strings each being one row of the board

        ascii_chessboard = []
        # initialization of the "ascii board"
        # it will contain all the rows in ascii format

        for chessboard_row in chessboard_rows:
        # loop through each element (row) in chessboard_rows
            
            ascii_row = ""
            # initialization of empty space to be filled with notation of the piece present 

            for char in chessboard_row:
            # looping in the single string (row in fen notation)

                if char.isdigit():
                # first we check if char is a digit
                # if it is -> represents an empty square
                # if not -> represents a piece or pawn
                    ascii_row += "." * int(char)
                    # int = number of empty sequential empty squares in that row
                    # representing them with "." which is convenctional

                else:
                # char = letter -> we have a piece
                    ascii_row += char
                    # placing the chars in position into the ascii represetnation

            ascii_chessboard.append(ascii_row)

        ascii_chessboard = "\n".join(ascii_chessboard[::-1])
        # ascii_chessboard[::-1] -> this inverts the board in the sense that in fen
        # 8th rank/row is first presented in the string but in visual represetnation
        # it's at the top, so neeed to be reverted 
        # Join of all the rows and separating every row with "/"
        # to get a visual representation of the board

        # Adding row numbers at left side
        ascii_chessboard_with_rows = [
            f"{8 - i} " + " ".join(row) for i, row in enumerate(ascii_chessboard)
        ]

        # Adding column labels at the bottom
        column_labels = "  a b c d e f g h"
        ascii_chessboard_with_rows.append(column_labels)

        # Join the rows for the final string output
        ascii_board_output = "\n".join(ascii_chessboard_with_rows)
    
        return ascii_board_output
    


    def count_material(self):
        """
        Count material for both players
        """
        material_value = {      # Define the value of every piece on the board
           'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0,  # White pieces
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0  # Black pieces 
        }

        material_state = {      # Keep track of each piece count (kings are included a-priori)
            'white': {'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 1},  
            'black': {'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0, 'k': 1},
        }

        white_material = 0
        black_material = 0

        #iteration throgh the fen notation to add every piece we encounter

        for row in self.board_state.split('/'):
        # take every "row of the board" separately to count pieces presence
            for char in row:
                if char.isdigit():
                    continue
                elif char.isalpha():
                    if char.isupper():                                  # if the char is in upper case -> white pieces
                       white_material += material_value.get(char,0)     # the value of that piece is retrieved and added to the total of the white amount of material
                       material_state['white'][char] += 1               # the actual number of pieces of that type is added to the count of the player
                else :                                                  # if the char is in lower case -> black pieces
                    black_material += material_value.get(char,0)        # procede in same way for black pieces/player
                    material_state['black'][char] += 1
        
            # return of everything we extract from the board state in term of concrete things i.e.: pieces count (for each side)
            return {
                'pieces_count': material_state,
                'white': white_material,
                'black': black_material
            }


    def get_material_state(self) -> str:
        """
        This methods tries to gather all the info about the material like:
        - material unballances
        - strenght of pieces based on their activity and squares control
        - general concepts about strenght of pieces related to the pawn structure
        """


    def get_kings_info(self):
        """
        Aim of the method is try to retrieve as much info as possible on the kings state on the board:
        Main focus on elements that may lead to not safety of the king:
        - being in the middle of the board with presence of high number of pieces on the board
        - not having  good pawn structure in front of it
        - no having friendly pieces around/controlling squares around it
        - no mobility (more difficult to reason around)
        """

        # Leverage chess library to create a board from the fen notation of the current position/game-state
        chessboard = chess.Board(self.fen)

        # Locating the kings position on the board (suqares)
        # To be done for each king (we want global board state not of only one side) 
        white_king_square = chessboard.king(chess.WHITE)
        black_king_square = chessboard.king(chess.BLACK)
        
        # Check if it's a center square or not
        # First define central squares
        central_squares = [
            chess.D1, chess.D2, chess.D3, chess.D4, chess.D5, chess.D6, chess.D7, chess.D8,
            chess.E1, chess.E2, chess.E3, chess.E4, chess.E5, chess.E6, chess.E7, chess.E8,
            chess.A3, chess.A4, chess.A5, chess.A6,
            chess.B3, chess.B4, chess.B5, chess.B6,
            chess.C3, chess.C4, chess.C5, chess.C6,
            chess.F3, chess.F4, chess.F5, chess.F6,
            chess.G3, chess.G4, chess.G5, chess.G6,
            chess.H3, chess.H4, chess.H5, chess.H6
        ]

        # check if the king square is among the central ones
        if white_king_square in central_squares:
            white_king_central = True               # Boolean: True -> king is in central squares
        else:
            white_king_central = False


        if black_king_square in central_squares:
            black_king_central = True               # Boolean: True -> king is in central squares
        else:
            black_king_central = False
        
        
        # Check the pawn structure in front of the kings (and also if pieces are present in those squares)
        shield_info_white = self.analyze_king_shield(white_king_square, chess.WHITE, chessboard)
        shield_info_black = self.analyze_king_shield(white_king_square, chess.BLACK, chessboard)


    def analyze_king_shield(self, king_square, color, chessboard):
        """
        This method has the aim of check the 3 (if present) squares in front of the king in the given chess position
        This is one of the indicators of king safety in a chess game expecially during midgame or in positions with many pieces
        still on the board

        Args: 
            - king_square : the square the king is on
            - color: which pieces we are considering so black or white
            - chessboard: the current board provided by the caller, represents the state of the game

        Return:
            - shield_info : list of what is present in the considered squares
        """
        
        # Definition of the direction we want to check the "pawn shield"
        direction = 8 if color == chess.WHITE else -8

        # Definition of "shield squares" :  squares that if occupied by friendly pieces/pawns (p in particular)
        #                                   help ensures better safety of the king 

        shield_squares = [
            king_square + direction,        # square in front of the king
            king_square + direction -1,     # diagonal left
            king_square + direction +1      # diagonal right
        ]

        # Remove squares that go off the board
        shield_squares = [
            # Taking into account only sq (squares) that satisfies...
            sq for sq in shield_squares
            if 0 <= sq < 64 and abs(chess.square_file(sq) - chess.square_file(king_square)) <= 1
            # consider only squares that go from 0 to 63 (the only one of the board)
            # It also checks if the square is at distance = 1 from the king, so only adjacent squares 
        ]

        shield_info = []

        for sq in shield_squares:
            piece = chessboard.piece_at(sq)                                                             # Retrieve what is placed onto the considered square
            if piece is None:                                                                           # if nothing present on that square
                shield_info.append((chess.square_name(sq), "Empty"))                                    # Storing the info of a pawn missing in the "shield" position
            elif piece.piece_type == chess.PAWN and piece.color == color:                               # If there is a friendly (same color) pawn in the shield squares
                shield_info.append(chess.square_name(sq), "Occupied by friendly pawn")                  # Storing info of a shielding pawn
            else:                                                                                       # only possibility that remains is to have a piece there
                shield_info.append(chess.square_name(sq), f"Occupied by friendly{piece.get_symbol()}")  # Storing info of a piece in the shild squares

        return shield_info

