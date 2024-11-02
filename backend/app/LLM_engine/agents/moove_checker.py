from LLM_engine import stockfish
from LLM_engine import ChatBox
import re

def is_valid_chess_notation(move):
    # Regular expression to match chess notation
    pattern = r'^(O-O(-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?[\+#]?)$'
    return bool(re.match(pattern, move))

class MooveExtractor(ChatBox):
    def __init__(self):
        super().__init__()
        self.prompt = """You're a moove extractor. Your purpose is to receive a prompt and check if it contains some chess mooves.
        Whatever the notations of the mooves are, you should be able to recognize them.
        You will be returning only a list of these mooves in UCI notation separated by commas as this example : e2e4,b1c3,d1h5
        as your response should be interpretable by python .split(',') method.
        """
        self.conversation_history.append({"role": "user", "content": self.prompt})
        self.conversation_history.append({"role": "assistant", "content": "Perfectly understood. I'm ready extract mooves from your prompts."})
    
    def extract_mooves(self,prompt):
        correct = False
        while not correct:
            try:
                mooves = self.ask(prompt).split(",")
                if all([is_valid_chess_notation(move) for move in mooves]):
                    correct = True
                    return mooves
                else:
                    self.conversation_history.append({"role": "user", "content": "Unfortunately, I couldn't extract the mooves from your response or some are invalid. Please try again."})
            except:
                self.conversation_history.append({"role": "user", "content": "Unfortunately, I couldn't extract the mooves from your response or some are invalid. Please try again."})

            



    
    



