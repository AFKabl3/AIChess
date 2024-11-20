from huggingface_hub import InferenceClient
import os
import pdb
from dotenv import load_dotenv # type: ignore
import logging

#Load the environment variables
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

client = InferenceClient(api_key=SECRET_KEY)


class ChatBox:
    def __init__(self):
        self.conversation_history = [] # empty list 
        self.client = InferenceClient(api_key=SECRET_KEY)

    def ask(self,question):
        # Add the new question to the conversation history
        # self.conversation_history.append({"role": "user", "content": question})
        # logging.debug(f"List of conversation history is: {self.conversation_history}")
 
        # Stream the response
        stream = client.chat.completions.create(
            model="mistralai/Mixtral-8x7B-Instruct-v0.1", 
            messages=[{"role": "user", "content": question}],
            max_tokens=500,
            stream=True
        )
        
        answer = ""
        for chunk in stream:
            answer += chunk.choices[0].delta.content


        
        # Add the assistant's response to the conversation history
        # self.conversation_history.append({"role": "assistant", "content": answer})
        
        return answer

    def reset_memory(self):
        # self.conversation_history = []
        pass