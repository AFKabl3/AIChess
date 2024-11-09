from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv  # type: ignore

# Load the environment variables
load_dotenv()

# Get the secret key and stockfish path from the environment variables
SECRET_KEY = os.getenv("SECRET_KEY")


client = InferenceClient(api_key=SECRET_KEY)


# Super class for each agent
class ChatBox:
    def __init__(self):
        self.client = InferenceClient(api_key=SECRET_KEY)
        self.systemPrompt = ""

    def ask(self, question):
        response = client.text_generation(
            model="mistralai/Mixtral-8x7B-Instruct-v0.1",
            prompt=f"System: {self.systemPrompt}\nUser: {question}",
            max_new_tokens=300,
        )

        return response
