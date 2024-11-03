from langchain_huggingface import HuggingFaceEndpoint
from huggingface_hub import InferenceClient
import os
from backend.app.stockfish_api import Stockfish
from dotenv import load_dotenv # type: ignore

#Load the environment variables
load_dotenv()

#Get the secret key and stockfish path from the environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
STOCKFISH_PATH = os.getenv("STOCKFISH_PATH")

stockfish = Stockfish(path=STOCKFISH_PATH)


client = InferenceClient(api_key=SECRET_KEY)


#Super class for each agent
class ChatBox:
    def __init__(self):
        self.conversation_history = []
        self.client = InferenceClient(api_key=SECRET_KEY)

    def ask(self,question):
        # Add the new question to the conversation history
        self.conversation_history.append({"role": "user", "content": question})
        
        # Stream the response
        stream = client.chat.completions.create(
            model="mistralai/Mixtral-8x7B-Instruct-v0.1", 
            messages=self.conversation_history, 
            max_tokens=500,
            stream=True
        )
        
        answer = ""
        for chunk in stream:
            answer += chunk.choices[0].delta.content
        
        # Add the assistant's response to the conversation history
        self.conversation_history.append({"role": "assistant", "content": answer})
        
        return answer
    
    def reset_memory(self):
        self.conversation_history = []
        pass






