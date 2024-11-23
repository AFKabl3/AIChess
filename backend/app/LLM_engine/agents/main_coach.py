from app.stockfish_api import Stockfish
from .chatbox import ChatBox
import pdb


class MainCoach(ChatBox):
    def __init__(self,player_color="w"):
        super().__init__()
        self.player_color = player_color
       
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
        For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
        Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
        the move you suggested, move sequences, or any general advice they may seek."""
        self.conversation_history.append({"role": "user", "content": self.prompt})
        # self.conversation_history.append({"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})
        self.stockfish = Stockfish(depth=10)

    def ask_move_feedback(self, move, fen, evaluation):
    # Few-shot examples to guide the model's understanding
        totalMoves = ['1. e4 e5 2. Nf3 Nc6 3. Qe2 d5 4. Qb5']
        move = "Qb6"
        examples = """
        ### EXAMPLES ###
        Rules:
        - `B` stands for Bishop, `Q` stands for Queen, `N` stands for Knight.
        - The first pair in a move (e.g., `4.Bg5`) is White's move.
        - The second pair (e.g., `Qd7`) is Black's response.

        Example 1:
        Input:
        totalMoves = ['1. Bd3 e5']
        move = 'Bd3'
        Explanation:
        1. White's move: The Bishop moves to d3.
        Black's response: The pawn moves to e5.

        Example 2:
        Input:
        totalMoves = ['2. d4 d5 3. Nc3 Nf6']
        move = 'Nc3'
        Explanation:
        2. White's move: The pawn moves to d4.
        Black's response: The pawn moves to d5.
        3. White's move: The Knight moves to c3.
        Black's response: The Knight moves to f6.
        """

        # Dynamic input to the model
        return self.ask(f"""
        The current state of the board is as follows in FEN notation:\n{fen}\n
        Move history:\n{totalMoves}\n
        The last move made by White is: {move}.
        Stockfish evaluation of this move: {evaluation}.

        ### EXAMPLES ###
        {examples}

        ### TASK ###
        Explain the moves in {totalMoves} following the examples provided. 
        Identify White's move (first pair) and Black's response (second pair) for each turn. 
        Then, analyze the `LAST MOVE` ({move}) and provide feedback based on the evaluation ({evaluation}).
        Limit the response to 100 words and focus on the reasoning behind the last move and potential next steps.
        """)
