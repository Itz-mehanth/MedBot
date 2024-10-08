from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pdfextract import pdf_to_string
from langchain.chains import LLMChain
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms.ollama import Ollama
from get_embedding_function import get_embedding_function
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase Admin SDK
cred = credentials.Certificate("/Users/jaswanth/DocumentsMac/intelhack/llama3.2_rag/chatbot/medbot-12052-firebase-adminsdk-r66dt-d134557a71.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:3000",  # your React app's URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHROMA_PATH = "chroma"
PROMPT_TEMPLATE = """
Analyze the medical report by comparing each parameter value with its normal range. Only flag the values that are outside the normal range as abnormal. If a value falls within the normal range, explicitly state it as 'within normal range.' If any value is abnormal, assess the severity of the condition and provide a brief explanation.

Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""

# Function to save conversation to Firestore
def save_conversation_to_firestore(user_id, user_input, llm_response):
    try:
        # Create a new document in Firestore
        conversation_ref = db.collection("conversations").add({
            "user_id": user_id,
            "user_input": user_input,
            "llm_response": llm_response
        })
        print(f"Conversation saved with ID: {conversation_ref.id}")
    except Exception as e:
        print(f"Error saving conversation to Firestore: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving to Firestore: {str(e)}")

def query_rag(query_text: str):
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    results = db.similarity_search_with_score(query_text, k=6)

    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)

    model = Ollama(model="llama3.2")
    response_text = model.invoke(prompt)

    sources = [doc.metadata.get("id", None) for doc, _score in results]
    formatted_response = f"Response: {response_text}\nSources: {sources}"
    return response_text

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...), user_id: str = Form("user123")):
    try:
        # Save the uploaded file temporarily
        file_location = f"/tmp/{file.filename}"
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())

        # Extract text from the uploaded PDF
        query_text = pdf_to_string(file_location)

        print("Extracted text from the uploaded PDF")

        # Query the LLM model for a summary
        llm_response = query_rag(query_text)

        print("Queried the LLM model for a summary")

        # Save the conversation to Firestore
        save_conversation_to_firestore(user_id, query_text, llm_response)

        print("Saved the conversation to Firestore")

        # Clean up the uploaded file
        os.remove(file_location)

        return {"message": "File processed successfully", "response": llm_response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the app using Uvicorn if the script is executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)