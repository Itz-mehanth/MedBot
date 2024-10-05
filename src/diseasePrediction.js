// React Component
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DiseasePrediction = () => {
    const [symptoms, setSymptoms] = useState(['']); // Initialize with one input field
    const [prediction, setPrediction] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [error, setError] = useState(null);
    const [symptom, setSymptom] = useState(null);
    const [diseaseResponse, setDiseaseResponse] = useState(null);
    const [DiseasesResponse, setDiseasesResponse] = useState(null);
    const [rankedSymptoms, setRankedSymptoms] = useState([]);
    const [possibleDiseases, setPossibleDiseases] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [foundDisease, setfoundDisease] = useState(false);
    const [no, setNo] = useState(0);
    const [maxQuestions, setMaxQuestions] = useState(25);
    const [question, setQuestion] = useState('');
    const [responses, setResponses] = useState([]);
    const [selectedDisease, setSelectedDisease] = useState(null);


    const handleSymptomChange = (index, event) => {
        const newSymptoms = [...symptoms];
        newSymptoms[index] = event.target.value;
        setSymptoms(newSymptoms);
    };

    const addSymptomField = () => {
        setSymptoms([...symptoms, '']);
    };

    const removeSymptomField = (index) => {
        const newSymptoms = symptoms.filter((_, i) => i !== index);
        setSymptoms(newSymptoms);
    };


    const startQuestionnaire = async (filteredSymptoms) => {
        try {
          const response = await axios.get('http://192.168.62.57:8000/start-questionnaire'); // Assuming your endpoint gives the first data
          setSymptom(response.data.symptom);
          setRankedSymptoms(response.data.ranked_symptoms);
          setPossibleDiseases(response.data.possible_diseases);
          setCount(response.data.count); // Initialize count (usually 0)
          setNo(response.data.no); // Initialize 'no' (usually 0)
        } catch (error) {
            console.error('Error starting questionnaire:', error);
        }finally{
            console.log("stated questioning");
        }
    };
    
    
    const fetchDiseaseResponse = async (diseaseName) => {
          setLoading(true);
          setError(null);

        try {
            const response = await axios.post(`http://192.168.62.57:8000/medllama/response`,{
                disease_name: diseaseName
            });
            // console.log(response,"fetching disease");
            console.log(response.data.summary, "fetch disease");
            
            setDiseaseResponse(response.data.summary);
            console.log(diseaseResponse, "fetch disease response");
        } catch (err) {
            setError('Error fetching disease response.');
        } finally {
            setLoading(false);
        }
    };
      
    const fetchDiseases = async () => {
        
        setLoading(true);
        try {
            const response = await axios.post(`http://192.168.62.57:8000/medllama/multiple_diseases`,{
                user_symptoms: symptoms,
                possible_diseases: possibleDiseases // Add the ranked_symptoms field
            });
            console.log(response,"fetch diseases completed");
            setDiseasesResponse(response.data.response);
            console.log(DiseasesResponse, "fetch diseases");
        } catch (err) {
            setError('Error fetching disease response.');
        } finally {
            setLoading(false);
        }
    };

    
      const submitAnswer = async (answer) => {
        if (count >= maxQuestions) {
          alert("Maximum number of questions reached. Here's your diagnosis.");
          console.log('Possible diseases:', possibleDiseases);
          setfoundDisease(true);
          if (possibleDiseases.length === 1) {
            // Call create_medllama_response directly for a single disease
            fetchDiseaseResponse(possibleDiseases[0]);
          } else {
            fetchDiseases();
            setPredictions(possibleDiseases);
          }

          return;
        }
    
        try {
          const response = await axios.post('http://192.168.62.57:8000/ask-questionnaire', {
            count: count,
            no: no,
            symptom: symptom,
            answer: answer,
            UserSymptoms: symptoms,
            rankedSymptoms: rankedSymptoms // Add the ranked_symptoms field
          });

          console.log(response);
          
    
          if (response.data.possible_diseases.length === 1) {
            alert('Diagnosis complete!');
            setPossibleDiseases(response.data.possible_diseases);
            return;
          }
    
          // Update state with new question and relevant data
          setSymptom(response.data.symptom);
          setRankedSymptoms(response.data.ranked_symptoms);
          setSymptoms(response.data.user_symptoms);
          setPossibleDiseases(response.data.possible_diseases);
          setCount(response.data.count);
          setNo(response.data.no);
    
        } catch (error) {
          console.error('Error submitting answer:', error);
        }
      };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // Set loading before the request
        try {
            const filteredSymptoms = symptoms.filter(symptom => symptom.trim() !== ''); // Filter out empty symptoms
            if (filteredSymptoms.length === 0) {
                setError('Please enter at least one symptom.');
                return;
            }

            const response = await fetch('http://192.168.62.57:8000/predict-disease', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_symptoms: filteredSymptoms }), // Match the expected key
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("Response Data:", data); // Log the entire response object to check its structure

            // Check if ranked_symptoms exists and has more than one item
            if (data.ranked_symptoms && data.ranked_symptoms.length > 1) {
                setPrediction(null); // No valid predictions yet, start the questionnaire
                console.log("starting the questionnaire");
                
                await startQuestionnaire(filteredSymptoms); // Trigger the questionnaire
            } else {
                setPrediction(data); // Set the prediction data to state
            }
            setError(null);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to fetch prediction. Please try again.');
        }
        setLoading(false); // Reset loading after the request
    };


    const handleSendMessage = async () => {
        if (question.trim() === '') return;
    
        const stopCommands = ['no questions', 'no question', 'no'];
    
        if (stopCommands.includes(question.toLowerCase())) {
          setResponses([...responses, { message: "Thank you for chatting! Goodbye!", isUser: false }]);
          setQuestion('');
          return;
        }

        // Assume an API call to get chatbot response
        const response = await fetch("http://192.168.62.57:8000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            possibleDiseases: possibleDiseases,
            question: question
        }),

        
    });
        console.log(question);
    
        const data = await response.json();
        setResponses([...responses, { message: question, isUser: true }, { message: data.response, isUser: false }]);
        setQuestion('');
      };

    const handleDiseaseSelection = (disease) => {
        setSelectedDisease(disease);
        fetchDiseaseResponse(disease);
    };



    return (
        <div className='diseasePredictorPage'>
            <h1>Disease Prediction Questionnaire</h1>
            <form onSubmit={handleSubmit}>
                {symptoms.map((symptom, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            value={symptom}
                            onChange={(event) => handleSymptomChange(index, event)}
                            placeholder="Enter symptom"
                        />
                        <button type="button" onClick={() => removeSymptomField(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addSymptomField}>Add Symptom</button>
                <button type="submit">Submit Symptoms</button>
            </form>
            {prediction && (
                <div>
                    <h2>Prediction Results:</h2>
                    <p>Ranked Symptoms: {prediction.ranked_symptoms.join(', ')}</p>
                    <p>Possible Diseases: {prediction.possible_diseases.join(', ')}</p>
                </div>
            )}
            <div>
            {symptom ? (
            <div>
                <p>Do you have the following symptom?</p>
                <h2>{symptom}</h2>
                <button onClick={() => submitAnswer('yes')}>Yes</button>
                <button onClick={() => submitAnswer('no')}>No</button>
            </div>
            ) : (
            <p>Loading next question...</p>
            )}
            
        </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div>
                {loading ? <p>Loading...</p> : <div></div>}
            </div>

            {foundDisease && (

                <div style={{ padding: '20px', border: '1px solid #ccc', width: '400px', margin: '0 auto' }}>
                    <h2>Final Diagnosis</h2>
                    <p>Possible Diseases: {possibleDiseases.join(', ')}</p>
                </div>
            )}

            {/* Display chatbot responses */}
            {
                DiseasesResponse && (
                    <div>
                    <h2>Diseases Information:</h2>
                    <p>{DiseasesResponse}</p>
                </div>
                )
            }

            {/* Display prediction results */}
            {predictions && (
                <div>
                    <h2>Possible Diseases:</h2>
                    {predictions.map((disease, index) => (
                        <div key={index}>
                            <button onClick={() => handleDiseaseSelection(disease)}>
                                {disease}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Display selected disease response */}
            {diseaseResponse && (
                <div>
                    <h2>Disease Information:</h2>
                    <p>{diseaseResponse}</p>
                </div>
            )}

            {foundDisease && (
                <div style={{ padding: '20px', border: '1px solid #ccc', width: '400px', margin: '0 auto' }}>
                    <h2>Chatbot</h2>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', marginBottom: '10px', padding: '10px' }}>
                        {responses.map((resp, index) => (
                            <div key={index} style={{ textAlign: resp.isUser ? 'right' : 'left' }}>
                                <strong>{resp.isUser ? 'You:' : 'Bot:'}</strong> {resp.message}
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask me anything..."
                        style={{ width: '100%', padding: '10px' }}
                    />
                    <button onClick={handleSendMessage} style={{ padding: '10px', width: '100%', marginTop: '10px' }}>
                        Send
                    </button>
                </div>
            )}
        </div>
        
    );
};

export default DiseasePrediction;
