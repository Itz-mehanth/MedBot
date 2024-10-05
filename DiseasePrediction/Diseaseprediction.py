
import pandas as pd
import numpy as np
from sklearnex import patch_sklearn,config_context
patch_sklearn()
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.preprocessing import LabelEncoder
from scipy.stats import chi2_contingency
from scipy.stats import chi2_contingency
import random
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
from sklearn.model_selection import GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score
import re
import numpy as np
from sklearn.svm import SVC
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms.ollama import Ollama
import sys
import warnings
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple,Union
import uvicorn
import nest_asyncio
warnings.filterwarnings("ignore", message="`crosstab` is not currently supported by PandasOnRay, defaulting to pandas implementation.")




df = pd.read_csv('Training.csv')
column_names1 = ['disease', 'reccomendation1', 'reccomendation2','reccomendation3','reccomendation4']
column_names2 = ['disease', 'description']
df_prec = pd.read_csv('symptom_precaution.csv',names=column_names1,header=0)
df_desc = pd.read_csv('symptom_Description.csv',names=column_names2,header=0)


columns_list = df.columns.tolist()
df1=df.copy()
columns_list[0]=columns_list[-1]
columns_list.pop(-1)
df = df[columns_list]
df1 = df.copy()
df1=df1[columns_list]


# Encode the target 'prognosis'
label_encoder = LabelEncoder()
df['prognosis'] = label_encoder.fit_transform(df['prognosis'])

# Split data into features (X) and target (y)
X = df.drop('prognosis', axis=1)  # all symptoms as features
y = df['prognosis']  # prognosis as the target

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=41)

# Train a Random Forest Classifier
clf = RandomForestClassifier()
clf.fit(X_train, y_train)

# Make predictions
y_pred = clf.predict(X_test)
y_pred_proba = clf.predict_proba(X_test)  # get probabilities

user_symptoms = []
symptoms = ['skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering', 'chills', 'joint_pain',
            'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition',
            'spotting_ urination', 'fatigue', 'weight_gain', 'anxiety', 'cold_hands_and_feets', 'mood_swings',
            'weight_loss', 'restlessness', 'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough',
            'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache',
            'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain',
            'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine', 'yellowing_of_eyes',
            'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise',
            'blurred_and_distorted_vision', 'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure',
            'runny_nose', 'congestion', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate',
            'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain',
            'dizziness', 'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels',
            'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties', 'excessive_hunger',
            'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech', 'knee_pain', 'hip_joint_pain',
            'muscle_weakness', 'stiff_neck', 'swelling_joints', 'movement_stiffness', 'spinning_movements',
            'loss_of_balance', 'unsteadiness', 'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort',
            'foul_smell_of urine', 'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching',
            'toxic_look_(typhos)', 'depression', 'irritability', 'muscle_pain', 'altered_sensorium',
            'red_spots_over_body', 'belly_pain', 'abnormal_menstruation', 'dischromic _patches', 'watering_from_eyes',
            'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum',
            'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion',
            'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen',
            'history_of_alcohol_consumption', 'fluid_overload.1', 'blood_in_sputum', 'prominent_veins_on_calf',
            'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring', 'skin_peeling',
            'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails', 'blister', 'red_sore_around_nose',
            'yellow_crust_ooze']
filtered_df = ""


def create_symptom_vector(user_symptoms):
    symptom_vector = [0] * len(symptoms)

    user_symptoms = [symptom.strip().lower() for symptom in user_symptoms]

    for symptom in user_symptoms:
        if symptom in symptoms:
            idx = symptoms.index(symptom)
            symptom_vector[idx] = 1
        else:
            print(f"Symptom '{symptom}' not recognized.")

    return symptom_vector


def get_top_diseases(proba, n=40):
    # Get top N diseases with highest probabilities
    top_diseases_idx = proba.argsort()[::-1][:n]
    top_diseases = label_encoder.inverse_transform(top_diseases_idx)
    top_probs = proba[top_diseases_idx]
    return list(zip(top_diseases, top_probs))


def predict_dis(user_symptoms):
    new_symptoms = create_symptom_vector(user_symptoms)
    new_symptoms_df = pd.DataFrame([new_symptoms], columns=symptoms)
    proba = clf.predict_proba(new_symptoms_df)
    dynamic_prob = 0.0
    top_diseases_with_probs = get_top_diseases(proba[0])
    top_diseases = []
    for disease, prob in top_diseases_with_probs:
        if prob > dynamic_prob:
            # print(f"Disease: {disease}, Probability: {prob:.4f}")
            top_diseases.append(disease)

    filtered_df = df1[df1['prognosis'].isin(list(top_diseases))]
    return filtered_df


def predict_dis_2(user_symptoms):
    new_symptoms = create_symptom_vector(user_symptoms)
    new_symptoms_df = pd.DataFrame([new_symptoms], columns=symptoms)
    proba = clf.predict_proba(new_symptoms_df)

    top_diseases_with_probs = get_top_diseases(proba[0])
    top_diseases = []
    dynamic_prob = 0.05
    for disease, prob in top_diseases_with_probs:
        if prob > dynamic_prob:
            # print(f"Disease: {disease}, Probability: {prob:.4f}")
            top_diseases.append(disease)

    filtered_df = df1[df1['prognosis'].isin(list(top_diseases))]
    return top_diseases


def rank_symptoms(dfa):
    symptom_ranking = {}

    # Perform Chi-Square test for each symptom
    for symptom in dfa.columns:
        contingency_table = pd.crosstab(dfa.index, dfa[symptom])

        # Ensure the contingency table has data and at least two unique values
        if len(contingency_table) > 1 and contingency_table.values.sum() > 0:
            chi2, p, dof, expected = chi2_contingency(contingency_table)
            symptom_ranking[symptom] = chi2  # Use Chi-Square value as importance score
        else:
            # If contingency table is empty or invalid, skip the symptom
            print(f"Skipping symptom '{symptom}' due to insufficient data.")

    # Sort symptoms by importance (highest Chi-Square first)
    ranked_symptoms = sorted(symptom_ranking.items(), key=lambda x: x[1], reverse=True)
    return ranked_symptoms


def rerank(filtered_df):
    ranked_symptoms = []
    rs = rank_symptoms(filtered_df)[1:]
    for i in range(len(rs)):
        if rs[i][-1] != 0:
            ranked_symptoms.append(rs[i])
    return ranked_symptoms


# follow up questions
FOLLOWUP_QUESTION_PROMPT_TEMPLATE = """
The user has follow-up questions regarding the predicted disease.

Predicted disease: {disease_name}


User's question: {user_question}

---

Provide a detailed and accurate answer to the user's question based on the predicted disease. Make sure to give a clear response and, if applicable, include sources or disclaimers where necessary.

Answer:
"""


def medllama_answer_user_question(disease_name, user_question):
    # Construct the prompt for follow-up questions
    prompt = FOLLOWUP_QUESTION_PROMPT_TEMPLATE.format(

        disease_name=disease_name,
        user_question=user_question
    )

    # Initialize the model
    model = Ollama(model="medllama2_mod")

    # Generate the response from the model with specified parameters
    response_text = model.invoke(prompt)

    return response_text


with open('combined_intents.json', 'r') as file:
    data = json.load(file)

# Step 2: Prepare the dataset
X = []
y = []

# Extract patterns and corresponding tags from the JSON
for intent in data["intents"]:
    for pattern in intent["patterns"]:
        #print(pattern+' '+intent["tag"])
        X.append(pattern+' '+intent["tag"])
        y.append(intent["tag"])

# Step 3: Preprocessing function to normalize user input and patterns
def preprocess_text(text):
    text = text.strip().lower()  # Convert to lowercase and remove extra spaces
    return re.sub(r'[^\w\s]', '', text)  # Remove punctuation

# Apply preprocessing to the patterns
X = [preprocess_text(pattern) for pattern in X]

# Step 4: Convert text patterns into numerical vectors using TF-IDF
vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2), stop_words='english')
X_vec = vectorizer.fit_transform(X).toarray()

# Step 5: Split the data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.3, random_state=42)

# Step 6: Train the SVM model
svm_clf = SVC(kernel='linear', probability=True)  # Linear kernel for text classification
svm_clf.fit(X_train, y_train)

# Step 7: Make predictions and evaluate the model
y_pred = svm_clf.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
#print(f"Model accuracy on test data: {accuracy * 100:.2f}%")

def predict_tag(user_symptom):
    # Step 8a: Preprocess the user symptom
    user_symptom = preprocess_text(user_symptom)

    # Step 8b: Convert user input into a TF-IDF vector
    user_symptom_vec = vectorizer.transform([user_symptom]).toarray()

    # Step 8c: Predict the tag using the trained SVM model
    predicted_tag = svm_clf.predict(user_symptom_vec)
    probabilities = svm_clf.predict_proba(user_symptom_vec)

    # Output the predicted tag and probabilities
    return predicted_tag[0]

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple,Union
import uvicorn
import nest_asyncio
nest_asyncio.apply()
app=FastAPI()
origins = [
    "http://localhost:3000",  # your React app's URL
    "http://127.0.0.1:3000",  # also allow this for safety
]
absent_symptoms = []
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # allow requests from these origins
    allow_credentials=True,
    allow_methods=["*"],  # allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # allow all headers
)
PROMPT_TEMPLATE = """
Based on the user's input, predict the most likely disease from the provided 'Possible diseases after initial analysis' and provide necessary disclaimers.
If there is a more precise prediction from the symptoms, indicate that also.
User-reported symptoms: {user_symptoms} - These symptoms are present

Symptoms not present: {symptoms_not_present} - These symptoms are not present.

Possible diseases: {possible_diseases}

---

Make a prediction about the most likely disease the user might have, considering the context provided. 
Explain why and how you came to a conclusion, and how confident you are.
Additionally, provide a disclaimer that this is a prediction and should not be considered a definitive medical diagnosis.

Include sources if relevant.

Answer:
"""
@app.post("/medllama/response")
async def create_medllama_response(disease: dict):
    print(disease)
    model = Ollama(model="llama3.2_mod")
    disease_name = disease['disease_name'].strip()  # Clean the input
    
    # Fetching the disease description and precautions
    rows_desc = df_desc[df_desc['disease'].str.lower() == disease_name.lower()]
    rows_prec = df_prec[df_prec['disease'].str.lower() == disease_name.lower()]

    # Extract the description as a single string
    description = rows_desc['description'].values[0] if not rows_desc.empty else "No description found."
    
    # Extract all precautions as a single string
    if not rows_prec.empty:
        precautions = ' '.join(rows_prec.iloc[0, 1:].values)  # Joining all recommendations from the first row
    else:
        precautions = "No precautions found."
    
    # Generate the model's response
    response = model.invoke(f"""
    You are an AI assistant specializing in providing detailed health information. Given the following details about a disease, generate a comprehensive summary.

    1. Disease Name: {disease_name}

    2. Description: {description}

    3. Health Precautions: {precautions}

    Please ensure that the summary is:

    - Easy to understand for a general audience.
    - Detailed enough to cover the nature of the disease and its associated health precautions.
    
    Important: Include the following disclaimer at the end of your summary:

    Disclaimer: This summary is generated based on limited data available in the dataset. The information provided here is for informational purposes only and should not be considered medical advice. Always consult a healthcare professional for personalized diagnosis and treatment options.
    """)

    return {"summary": response}

@app.post("/medllama/multiple_diseases")
async def run_medllama_multiple_diseases(input_data: dict):
    print(input_data)
    # Construct the full prompt by filling in the template
    prompt = PROMPT_TEMPLATE.format(
        user_symptoms=input_data['user_symptoms'],
        symptoms_not_present=absent_symptoms,
        possible_diseases=input_data['possible_diseases']
    )
    print(prompt)

    # Initialize the model
    model = Ollama(model="medllama2_mod")
    
    # Generate the response from the model
    response_text = model.invoke(prompt)

    return {"response": response_text}
    
# Define a Pydantic model for the input data
class Symptoms(BaseModel):
    user_symptoms: List[str]

@app.post("/predict-disease")
async def predict_disease(symptoms: Symptoms) -> dict:
    try:
        ranked_symptoms, possible_diseases = predict_and_rerank(symptoms.user_symptoms)
        return {
            "ranked_symptoms": ranked_symptoms,
            "possible_diseases": possible_diseases
        }
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

correct,wrong,semi,average= 0,0,0,0
avg_sy = 0
avg_qn = 0
possible_diseases = []

#print(symptoms)

def predict_and_rerank(user_symptoms):
    """Predict possible diseases and rerank symptoms based on current symptoms."""
    filtered_df = predict_dis(user_symptoms)
    ranked_symptoms = rerank(filtered_df) if not filtered_df.empty else []
    possible_diseases = predict_dis_2(user_symptoms)
    return ranked_symptoms, possible_diseases
possible_diseases=[]
absent_symp=[]

class AnswerRequest(BaseModel):
    count: int
    no: int
    symptom: str
    answer: str
    ranked_symptoms: List[List[Union[str,float]]]

@app.get("/start-questionnaire")

async def start_questionnaire():
    global user_symptoms, absent_symptoms, possible_diseases, count, no
    user_symptoms = []
    absent_symptoms = []
    possible_diseases = []
    count = 0
    no = 0
    ranked_symptoms, possible_diseases = predict_and_rerank(user_symptoms)

    if ranked_symptoms:
        return {
            "symptom": ranked_symptoms[no][0],
            "ranked_symptoms": ranked_symptoms,
            "possible_diseases": possible_diseases,
            "count": count,
            "no": no
        }
    raise HTTPException(status_code=404, detail="No symptoms ranked")
    
@app.post("/ask-questionnaire")
async def ask_questionnaire(answer_request: dict):
    # print(answer_request)
    max_questions = 25
    global absent_symptoms, possible_diseases, count, no

    # Extract data from the request
    ranked_symptoms = answer_request.get('rankedSymptoms', [])
    user_symptoms = answer_request.get('UserSymptoms', [])
    symptom = answer_request.get('symptom')
    answer = answer_request.get('answer')
    print("user symptom before if" ,user_symptoms)
    if symptom not in user_symptoms and symptom not in absent_symptoms:
        print("no value before check max", no)
        # If maximum questions have been reached, return possible diseases
        if count >= max_questions:
            return {"possible_diseases": possible_diseases}
    
        # Process the answer
        if answer == 'yes':
            user_symptoms.append(symptom)
            print("user symptom in yes" ,user_symptoms)
            ranked_symptoms, possible_diseases = predict_and_rerank(user_symptoms)
            rs=[]
            for i in ranked_symptoms:
                if i[0] not in user_symptoms and i[0] not in absent_symptoms:
                    rs.append(i)
            ranked_symptoms=rs
            no = 0  # Reset if new symptoms are added
            print("user symptom at the end of yes" ,user_symptoms)
            print("no value inside yes block", no)
    
        elif answer == 'no':
            absent_symptoms.append(symptom)
            temp = possible_diseases.copy()
            possible_diseases = [
                disease for disease in possible_diseases
                if df1[df1['prognosis'] == disease][symptom].values[0] == 0
            ]
            print("no value inside no block", no)
    
            if possible_diseases != temp:
                ranked_symptoms, possible_diseases = predict_and_rerank(user_symptoms)
                rs=[]
                for i in ranked_symptoms:
                    if i[0] not in user_symptoms and i[0] not in absent_symptoms:
                        rs.append(i)
                ranked_symptoms=rs
                no = 0
                print("no value  inside no if block", no)
    
    
        # Increment count after processing the answer
        count += 1
    
        # Check for a single possible disease
        if len(possible_diseases) == 1:
            return {"possible_diseases": possible_diseases}
    
    # Get the next symptom to ask about
    while(ranked_symptoms[no][0] in user_symptoms or ranked_symptoms[no][0] in absent_symp):
        no+=1
        print(no,"++")
    next_symptom = ranked_symptoms[no][0] if no < len(ranked_symptoms) else None
    print("no is incrementing from", no)
    no += 1
    print("no value is" , no)
    rs=[]
    
    return {
        "symptom": next_symptom,
        "ranked_symptoms": ranked_symptoms,
        "user_symptoms": user_symptoms,
        "possible_diseases": possible_diseases,
        "count": count,
        "no": no
    }

def do():
    global correct,wrong,semi,average
    global avg_sy, avg_qn, user_symptoms
    yn='n'
    while yn!='y':
        user_symptoms = []
        for c in range(4):
            print("\nEnter your symptoms (one at a time):")
            user_input = input().strip()
            user_symptoms.append(predict_tag(user_input))
        
        print(user_symptoms, ": Are the symptoms you entered.")
        yn = input("Is this correct? (y/n): ").strip().lower()
    
        if yn == 'y':
            break  # Exit the loop if the input is correct
        elif yn == 'n':
            print("Let's modify your symptoms.")
            modify='y'
            
            while True:
            
                if modify == 'y':
                    index = int(input("Enter the index of the symptom to modify (1 to {}): ".format(len(user_symptoms))))
                    if 0 < index <= len(user_symptoms):
                        new_symptom = input("Enter the new symptom: ").strip()
                        user_symptoms[index-1] = new_symptom
                        print(user_symptoms, ": Are the symptoms you entered.")
                        yn = input("Is this correct? (y/n): ").strip().lower()
                    
                        if yn == 'y':
                            break  # Exit the loop if the input is correct
                    else:
                        print("Invalid index. Please try again.")
                else:
                    print("Final symptoms confirmed:", user_symptoms)
                    break  # Exit the modification loop
        else:
            print("Invalid input. Please enter 'y' or 'n'.")
    
    # Proceed with the confirmed user symptoms
    print("Proceeding with the following symptoms:", user_symptoms)

        
    # Predict possible diseases based on initial symptoms
    ranked_symptoms, possible_diseases = predict_and_rerank(user_symptoms)
    if len(possible_diseases) == 1:
        predicted_disease = possible_diseases[0]
        # Print only the necessary details
        print(f"Predicted disease: {predicted_disease} (no questions asked)")
        return [predicted_disease]
    
    # If multiple diseases remain, start asking questions
    if len(possible_diseases) > 1:
        ask_questionnaire(df1, ranked_symptoms, possible_diseases)
        
        # Check the number of possible diseases after questioning
        ranked_symptoms, possible_diseases = predict_and_rerank(user_symptoms)  # Re-evaluate possible diseases after questioning

        if len(possible_diseases) == 1:  # If only one disease remains after questioning
            predicted_disease = possible_diseases[0]
            print(f"Predicted disease: {predicted_disease}, identified in {count} questions")
            return [predicted_disease]
        else:  # Still multiple diseases remain
            print(f"Possible diseases after questioning: {possible_diseases}")
            response_text=run_medllama_multiple_diseases(user_symptoms,absent_symp,str(possible_diseases))
            print(f"Model response:\n{response_text}")
            return possible_diseases

    else:
        print("Unknown disease", count)
        sys.exit()




@app.post("/chat")
async def chat(user_question: dict):
    print(user_question)
    stop_commands = ['no questions', 'no question', 'no']
    qn = user_question['question'].strip().lower()
    u_disease = user_question['possibleDiseases']

    if qn in stop_commands:
        return {"message": "Thank you for chatting! Goodbye!"}

    # Here you would call your response function
    response = medllama_answer_user_question(u_disease, qn)

    return {"response": response}
        
# disease_name=do()
    
# ch=input("Do you want more information? (y/n): ")

# if ch.lower()=='y':
    
#         m_name=input("Do you want to use Gemini or MedLLaMA Model? :")

#         if len(disease_name)==1:
#             u_disease=disease_name[0]
#         else: 
#             u_disease=input("Enter the disease name to get more information on the same: ")

#         if m_name.lower()=='gemini':
#             description=create_gemini_response([u_disease])
#             print("Model response: ",description)
            
#             qn=input("Feel free to ask me any following questions here: ")
#             while qn.lower()!='no questions':
#                 print(gemini_answer_user_question(u_disease,qn))
#                 qn=input("Feel free to ask me any following questions here('no questions' to stop):\n ")

    
            
#         if m_name.lower()=='medllama':
#             description=create_medllama_response([u_disease])
#             print("Model response: ",description)
            
#             qn=input("Feel free to ask me any following questions here: ")
#             while qn.lower()!='no questions' or qn.lower()!='no question' or qn.lower()!='no':
#                 print(medllama_answer_user_question(u_disease, qn))
#                 qn=input("Feel free to ask me any following questions here('no questions' to stop):\n ")
#                 if qn.lower() in ['no questions','no','no question']:
#                     break
                
    
uvicorn.run(app, host="0.0.0.0",port=8000)
