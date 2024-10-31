from langchain_huggingface import HuggingFaceEndpoint
from huggingface_hub import InferenceClient
import os

# Define API key
SECRET_KEY = "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"

client = InferenceClient(api_key=SECRET_KEY)


class chat_box:
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
    
    def reset(self):
        self.conversation_history = []
        return "Chat history has been reset."

# Define the chat box
new_chat_box = chat_box()






