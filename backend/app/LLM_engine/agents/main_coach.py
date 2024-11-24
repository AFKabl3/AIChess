from ...stockfish_api import StockfishAPI
from .chatbox import ChatBox


class MainCoach(ChatBox):

    def __init__(self, player_color="w"):
        super().__init__()
        self.player_color = player_color
        self.systemPrompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
        For the provided move you evaluate the user’s move and provide feedback on it, using the provided evaluation by Stockfish to guide your assessments.
        You will try to limit your responses to 200 characters. You can provide feedback on the move, suggest an alternative move, or provide general advice on the game."""

        self.stockfish = StockfishAPI(10)

    def ask_move_feedback(self, move, fen):
        evaluation = self.stockfish.evaluate_move_score(
            fen, move, player_color=self.player_color
        )

        return (self.ask(f"""The current state of the board is as follows in FEN notation: \n  {fen} \n
        The move made by the user is {move}. The evaluation of this move by Stockfish is {evaluation}.\n
        Provide feedback on this move. Coach the user by providing a explanation of the evaluation. You should also explicitly state the evaluation when referred to."""))

    def ask_move_suggestion(self, suggestion):
        fen, move_suggestion, move_evaluation = suggestion
        return (self.ask(f"""The current state of the board is as follows in FEN notation: {fen} \n
        The Stockfish from suggestion is:{move_suggestion} \n. The evaluation of the suggestion provided by Stockfish is: {move_evaluation}.\n
        Provide a feedback using the suggested move. Try to limit the response to 150 words removing all the reference to Stockfish. Coach the user by providing explanation to the suggestion."""))
