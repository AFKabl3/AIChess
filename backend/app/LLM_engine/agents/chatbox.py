from huggingface_hub import InferenceClient
import os
import pdb
from dotenv import load_dotenv # type: ignore

#Load the environment variables
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

client = InferenceClient(api_key=SECRET_KEY)


class ChatBox:
    def __init__(self):
        self.conversation_history = []
        self.client = InferenceClient(api_key=SECRET_KEY)
        self.max_messages = 10
    def ask(self,question):
        #Stores a maximum of messages and then cleans the older messages so it doesn't store too much data.
        if len(self.conversation_history) > self.max_messages:
            self.conversation_history = (
                self.conversation_history[:2] + self.conversation_history[6:] 
            )

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
    
    def ask_no_history(self,question):
        provisional_history = self.conversation_history[:2]
        
        #New question in provisional history with two initial messages
        provisional_history.append({"role": "user", "content": question})
        
        # Stream the response
        stream = client.chat.completions.create(
            model="mistralai/Mixtral-8x7B-Instruct-v0.1", 
            messages=provisional_history, 
            max_tokens=500,
            stream=True
        )
        answer = ""
        for chunk in stream:
            answer += chunk.choices[0].delta.content
            
        return answer
        

    def reset_memory(self):
        self.conversation_history = []