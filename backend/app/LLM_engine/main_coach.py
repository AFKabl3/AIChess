from .llm import LLM


class MainCoach(LLM):
    def __init__(self, api_key):
        super().__init__(api_key)
        self.automatic_coach_creation()
        self.direct_coach_creation()

    def automatic_coach_creation(self):
        self.reset_automatic_history()
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
                For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
                Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
                the move you suggested, move sequences, or any general advice they may seek."""
        # self.automatic_conversation.append({"role": "user", "content": self.prompt})
        self.automatic_conversation.append({"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})

    def direct_coach_creation(self):
        self.reset_direct_history()
        self.prompt = """You are a chess coach. Your role is to advise and coach the user on playing chess.
                For each move, you will evaluate the user’s move and provide feedback on it, using the Stockfish engine to guide your assessments.
                Additionally, and this is the most challenging part, you should be ready to answer any questions the user has about the current game state,
                the move you suggested, move sequences, or any general advice they may seek."""
        # self.direct_conversation_history.append({"role": "user", "content": self.prompt})
        self.direct_conversation_history.append(
            {"role": "assistant", "content": "Perfectly understood. I'm ready to coach the user"})

    def ask_move_feedback(self,input):
        self.automatic_coach_creation()
        board = input.get("board")
        move = input.get("move")
        evaluation = input.get("delta_evaluation")
        response = (self.ask(f"""The current state of the board is: \n  {board} \n
        The move made is {move},\n
        having the delta of the two evaluations, before and after the move: {evaluation}.
        In your response only provide a feedback on this move using the info above and limit the response to 70 words\n"""))
        return response

    def ask_move_suggestion(self, input):
        self.automatic_coach_creation()
        board = input.get("board")
        move = input.get("move")
        evaluation = input.get("delta_evaluation")
        response = (self.ask(f"""The current state of the board is: {board} \n
        The move:{move},\n
        Having the delta of the two evaluations, before and after the move: {evaluation}.\n
        In your response only suggest this move to the user using the info above and limit the response to 70 words\n"""))
        return response

    def ask_chess_question(self, ask_input):
        board = ask_input.get("board")
        evaluation = ask_input.get("evaluation")
        question = ask_input.get("question")
        response =  (self.direct_question(f"""The current state of the board is: {board} \n
        The evaluation of the state is {evaluation}.\n
        {question}\n 
        Limit the response to 70 words\n"""))
        return response
    
    def ask_game_status_explanation(self, ask_input):
        self.automatic_coach_creation()
        board = ask_input.get("board")
        evaluation = ask_input.get("evaluation")
        response = (self.ask(f"""The current state of the board is: {board} \n
        The evaluation of the state is {evaluation}.\n
        Explain the game status to the user, you can for example explain if black or white are winning and explain why. \n 
        Limit the response to 70 words\n"""))
        return response

    
