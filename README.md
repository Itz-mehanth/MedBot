# MedBot

This medical chatbot assists users with disease prediction, medical report analysis, and general health-related queries. It uses finetuned LLM's like MedLLaMA2 and LLaMA 3.2 along with Machine Learning approaches like SVM, KNN that are used on an Intel version of scikit-learn to provide accurate predictions and insights. The chatbot also allows users to upload medical reports and get them summarized, offering lifestyle recommendations and answering doubts about their health. It also allows users to enter their symptoms, get a preliminary diagnosis as well as know more and ask questions about it. This feature can be used to aid admission of patients and streamlining resource management in hospitals.

Done by [Saipranav M](https://github.com/AvGeeky), [Mehanth T](https://github.com/Itz-mehanth), [Jaswanth Sridharan](https://github.com/jas2506), [Kushaal Shyam Potta](https://github.com/kushaalshyam).

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture of our solution](#Architecture-of-our-solution)
- [Workflow of Report Summarization](#Workflow-of-Report-Summarization)


## Features
- **Disease Prediction and Disease Query redressal**: Predicts diseases based on user input processed using KNN, SVM, Chi 2 scores, LLaMa3.2 and MedLLaMA2.
- **Medical Report Analysis**: Upload medical reports for analysis and receive a concise summary through Retrieval augmented generation.
- **Report Upload & Doubts**: Users can upload medical reports and ask specific questions or clarify doubts about the reports.
- **Health Query Resolution**: Ask general health-related questions and get real-time responses from the chatbot.


## Technologies Used
- **SVM,KNNClassifier,Chi 2 Scores**: For disease prediction.
- **MedLLaMA2 & LLaMA 3.2 (Ollama)**: Locally installed LLMs for general health and disease related queries and predictions.
- **Retrieval-Augmented Generation (RAG)**: To retrieve and analyze medical reports.
- **Python**: Backend logic.
- **Ollama**: For managing local LLM installations.
- **RAG & LLM**: To provide real-time analysis of medical reports and health insights.
- **OCR (Optical Character Recognition) using pdfplumber**: Used to extract text from uploaded medical report images or PDFs.

## Architecture of our solution:
![My Image](https://raw.githubusercontent.com/Itz-mehanth/MedBot/refs/heads/main/MedBot%20arch.png)

## Workflow of Report Summarization:
![My Image](https://raw.githubusercontent.com/Itz-mehanth/MedBot/refs/heads/main/report%20arch.png)

## Demo Video


## Installation

### Follow these steps to set up and run the Medical Report Analysis and Health Query Resolution module locally:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/medical-chatbot.git
   cd medical-chatbot
2. **Open folder <Report>**:
    ```bash
    cd <path to Report>
3. **Create a Virtual Environment**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
4. **Install the Required Dependencies**
    ```bash
    pip install -r requirements_mra.txt
5. **Install Ollama**
    Install Ollama from the official website and install the required LLM's locally
    ```bash
    ollama pull medllama2
    ollama pull llama3.2
6. **Fine-tune the parameters of the Local LLMs in ollama using the given modelfiles**
    ```bash
    ollama create llama3.2_mod -f <path to "./llama3.2_mod.md">
    ollama create medllama2_mod -f <path to "./medllama2_mod.md">
7. **Run the application**


### Follow these steps to set up and run the Disease Prediction and Query Redressal module locally:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/medical-chatbot.git
   cd medical-chatbot

2. **Open folder <DiseasePrediction>**:
    ```bash
    cd <path to DiseasePrediction>

3. **Create a Virtual Environment**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
4. **Install the Required Dependencies**
    ```bash
    pip install -r requirements_mra.txt
5. **Install Ollama**
    Install Ollama from the official website and install the required LLM's locally. Ignore if done already.
    ```bash
    ollama pull medllama2
    ollama pull llama3.2
6. **Fine-tune the parameters of the Local LLMs in ollama using the given modelfiles**
    ```bash
    ollama create llama3.2_mod -f <path to "./llama3.2_mod.md">
    ollama create medllama2_mod -f <path to "./medllama2_mod.md">
7. **Run the application**

## Instructions to run Frontend
### Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

**Connect device containing frontend and backend to the same network and ensure that diseasePrediction.js and chatBot.js running in the frontend device have their <ip> variable is set to the IP address of the connected backend device.**

## Usage

### 1. Disease Prediction and Query redressal.
To predict a disease based on symptoms:
- Open the chatbot interface.
- Select the "Disease Prediction" option.
- Enter the symptoms you are experiencing.
- The chatbot will return the most likely diseases based on your input, as well as a detailed explaination of your symptoms and prognosis.
- You can proceed to ask queries about your prognosis, symptoms etc to your personal chatbot.

### 2. Medical Report Analysis
To analyze a medical report:
- Click on the "Upload Medical Report" button.
- Upload your medical report (PDF or image).
- The chatbot will extract information, summarize the findings, and provide feedback on critical values or potential issues.
- You can proceed to ask queries to the chatbot regarding medical terms present in the report. This chatbot remembers your past interactions with it.

### 3. Health Query Resolution
To ask general health-related questions:
- Select the "Ask Health Query" option.
- Type in your question (e.g., "What are the symptoms of diabetes?").
- The chatbot will respond with relevant information retrieved from the LLM models.

### 4. Finetune Parameters Considered:

    llama3.2_mod.md:
    PARAMETER num_ctx 4096
    PARAMETER mirostat_eta 0.1
    PARAMETER mirostat_tau 3.5
    PARAMETER repeat_last_n 128
    PARAMETER repeat_penalty 1.0
    PARAMETER temperature 0.7
    PARAMETER seed 42
    PARAMETER tfs_z 1
    PARAMETER top_k 30
    PARAMETER top_p 0.85
    PARAMETER min_p 0.05
    PARAMETER num_predict 400

    medllama2_mod.md:
    PARAMETER num_ctx 4096
    PARAMETER mirostat_eta 0.1
    PARAMETER mirostat_tau 3.5
    PARAMETER repeat_last_n 128
    PARAMETER repeat_penalty 1.15
    PARAMETER temperature 0.7
    PARAMETER seed 42
    PARAMETER tfs_z 1
    PARAMETER top_k 30
    PARAMETER top_p 0.85
    PARAMETER min_p 0.05

