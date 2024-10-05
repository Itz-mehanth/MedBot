from fastapi import FastAPI, Request
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from langchain_community.llms.ollama import Ollama
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# Initialize Firebase Admin SDK
cred = credentials.Certificate('/Users/jaswanth/DocumentsMac/intelhack/llama3.2_rag/chatbot/medbot-12052-firebase-adminsdk-r66dt-d134557a71.json')
firebase_admin.initialize_app(cred)

# Initialize Firestore database
db = firestore.client()

class FirestoreMemory:
    def __init__(self, collection_name="chatbot_memory"):
        self.collection_name = collection_name
        self.db = firestore.client()

    def add_to_memory(self, session_id, user_input, llm_output):
        # Each session_id will have its own collection of messages
        user_collection_ref = self.db.collection(self.collection_name).document(session_id).collection("messages")
        user_collection_ref.add({  # Add a new document with the chat data
            "user": user_input,
            "llm": llm_output
        })

    def get_conversation(self, session_id):
        # Retrieve all chat messages from the user's collection
        user_collection_ref = self.db.collection(self.collection_name).document(session_id).collection("messages")
        messages = user_collection_ref.stream()
        conversation = [{"user_input": msg.get("user"), "llm_output": msg.get("llm")} for msg in messages]
        return conversation


class Chatbot:
    def __init__(self, memory, model_name="llama3.2"):
        self.memory = memory
        self.llm = Ollama(model=model_name, temperature=0)

    def get_response(self, user_input):
        # Retrieve previous conversation from memory
        conversation_history = self.memory.get_conversation('user123')
        
        # Format conversation history
        full_conversation = "".join([f"User: {msg['user_input']}\nBot: {msg['llm_output']}\n" for msg in conversation_history])

        system_prompt = (
            "You are an AI chatbot. Your task is to precisely answer the user's question alone. "
            "Do not provide extra information unless the user made a statement instead of asking a question. "
            "If it's a statement, provide additional information that may be relevant to the topic."
        )

        # Prepare prompt with conversation history
        prompt = (
            f"{system_prompt}\n"
            f"{full_conversation}"
            f"User: {user_input}\nBot:"
        )

        # Get response from LLM
        llm_output = self.llm.invoke(prompt)

        # Add the new interaction to the memory
        self.memory.add_to_memory('user123', user_input, llm_output)

        return llm_output


# Initialize memory using Firestore
firestore_memory = FirestoreMemory()

# Initialize chatbot with Firestore memory
chatbot = Chatbot(memory=firestore_memory)

# Initialize FastAPI app
app = FastAPI()
# Add CORS middleware
origins = [
    "http://localhost:3000",  # your React app's URL
    "http://127.0.0.1:3000",  # also allow this for safety
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # allow requests from these origins
    allow_credentials=True,
    allow_methods=["*"],  # allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # allow all headers
)


# Define a POST endpoint to handle chat requests
@app.post("/chat")
async def chat(request: dict):
    # Get the response from the chatbot
    response = chatbot.get_response(request['user_input'])
    return {"response": response}

# Run the app using Uvicorn if the script is executed directly
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
