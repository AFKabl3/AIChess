from .chatbox import ChatBox


class MainCoach(ChatBox):
    def __init__(self):
        super().__init__()
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
        For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
        Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
        the move you suggested, move sequences, or any general advice they may seek."""
        self.conversation_history.append({"role": "user", "content": self.prompt})
        self.conversation_history.append({"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})

    def ask_move_feedback(self,evaluation):
        fen, move, move_evaluation = evaluation
        return (self.ask(f"""The current state of the board is as follows in FEN : \n  {fen} \n
        The move made is {move}. The evaluation provided by Stockfish is: {move_evaluation}.\n
        Provide feedback on this move. Try to limit the response to 150 words removing all the reference to Stockfish. Coach the user by providing explanation to the evaluation."""))

    def ask_move_suggestion(self, suggestion):
        fen, move_suggestion, move_evaluation = suggestion
        return (self.ask(f"""The current state of the board is as follows in FEN notation: {fen} \n
        The Stockfish from suggestion is:{move_suggestion} \n. The evaluation of the suggestion provided by Stockfish is: {move_evaluation}.\n
        Provide a feedback using the suggested move. Try to limit the response to 150 words removing all the reference to Stockfish. Coach the user by providing explanation to the suggestion."""))

    def ask_chess_question(self, fen, question, evaluation):
        return (self.ask(f"""The current state of the board is as follows in FEN notation: \n  {fen} \n
        The user question is {question}. The evaluation of this state by stockfish_binaries is {evaluation}.\n
        Provide a valid answer for this question in a chess context. Try to limit the response to 150 words."""))
    
