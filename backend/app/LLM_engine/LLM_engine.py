from langchain_huggingface import HuggingFaceEndpoint
from huggingface_hub import InferenceClient
import os
from stockfish import Stockfish

stockfish = Stockfish(path="../stockfish/stockfish-windows-x86-64-avx2.exe")

# Define API key
SECRET_KEY = "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"

client = InferenceClient(api_key=SECRET_KEY)


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






