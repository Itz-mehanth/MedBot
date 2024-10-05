import axios from 'axios';
import React, {useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { onAuthStateChanged, } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import brain from '../assets/brain.png';
import heart from '../assets/heart.png';
import { auth, googleProvider, db } from '../auth/firebase';
import lungs from '../assets/lungs.png';
import defaultUser from '../assets/defaultUser.png';
import medbot from '../assets/medbot.png';
import { faChevronDown, faPaperPlane, micOn, faUpload, faUpLong, faMicrophone, faMicrophoneSlash, faClose } from '@fortawesome/free-solid-svg-icons';
import report from '../assets/report.png';
import chatBubble from '../assets/chatBubble.png';
import pieChart from '../assets/pieChart.png';
import calender from '../assets/calender.png';
import pdf from '../assets/pdf.png';
import DiseasePredictor from '../diseasePrediction';


const ChatArea = ({ selectedSession, setSelectedSession, isSidebarOpen}) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [micOn, setMicOn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [cards, setCards] = useState(['one', 'two', 'three', 'four']);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file drop or browse
  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': []  // Only accept PDFs
    },
    multiple: false, // Optional: restrict to only one file
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        alert("Please upload a PDF file.");
        return;
      }
      setSelectedFile(acceptedFiles[0]); // Store the selected file
      console.log("Accepted file:", acceptedFiles[0]);
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setIsUploading(true);

      await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
    }
  };

  // Function to rotate the array to the right
  const rotateRight = () => {
    const last = cards[cards.length - 1]; // Get the last element
    const rotatedArray = [last, ...cards.slice(0, cards.length - 1)]; // Move the last to the front
    setCards(rotatedArray); // Update state with rotated array
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

// Example of sending message to the endpoint
const sendMessageToEndpoint = async (text) => {
  try {
      const response = await fetch('YOUR_ENDPOINT_URL', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }), // Send only the text
      });

      console.log(response);
      

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const result = await response.json();
      // Handle the result as needed
  } catch (error) {
      console.error('Error sending message:', error);
  }
};

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setInput(selectedFile.name); // Display file name in the input field
  };

  const handleSendMessage = async () => {
    if (selectedFile) {
      await handleUpload(); // Ensure the file is uploaded before sending the message
    }
  
    if (input.trim()) {
      const updatedSession = {
        ...selectedSession,
        messages: [...selectedSession.messages, { sender: 'user', text: input }]
      };

      await sendMessageToEndpoint(input); // Replace with your actual function to send the message

      setSelectedSession(updatedSession);
      setInput(''); // Clear input field
    }
  };

  // Handle microphone toggle
  const handleMicToggle = () => {
    setMicOn(!micOn);
    if (!micOn) {
      console.log('Microphone is now ON');
      // Start recording or handle mic activation
    } else {
      console.log('Microphone is now OFF');
      // Stop recording or handle mic deactivation
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserProfile({ name: user.displayName, photoURL: user.photoURL });
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // const handleFileUpload = async () => {
  //   if (!file) return;

  //   const formData = new FormData();
  //   formData.append('file', file);

  //   try {
  //     const response = await axios.post('http://localhost:5000/upload', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //       onUploadProgress: (progressEvent) => {
  //         const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
  //         setUploadProgress(progress);
  //       }
  //     });

  //     // Check the response object
  //     console.log('Response from server:', response);

  //     const extractedText = response.data.text;

  //     // Update the selectedSession with new AI message
  //     const updatedSession = {
  //       ...selectedSession,
  //       messages: [...selectedSession.messages, { sender: 'ai', text: extractedText }]
  //     };
  //     setSelectedSession(updatedSession);

  //     setUploadProgress(-1); // Reset upload progress after successful upload
  //     setFile(null); // Clear selected file
  //     setInput(''); // Clear input field

  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //   }
  // };

  useEffect(() => {
    console.log(`Sidebar is now ${isSidebarOpen ? 'open' : 'closed'}`);
    // Other side effects related to sidebar visibility can be added here.
  }, [isSidebarOpen]);  // This effect will run every time `isSidebarOpen` changes.

  return (
    <div className={`chat-area ${isSidebarOpen ? '' : 'hidden'}`}>
      <div className='botPlace'>
        <img src={medbot} alt={"bot"} className={`medbotcaptain card${cards[0]}`} />
        <div class={`chat-bubble card${cards[0]}`}>
          <p className={`WelcomeRa typing ${cards[0] == 'four'? cards[0] : 'invisible'}`}>
            <span class="welcome-line">Welcome to the</span>
            <span style={{ color: 'red' }} class="welcome-line" > Report Analyzer!</span>
            <span className='chatBottom'></span>
            <span className='chatBottomCircle'>' '</span>
          </p>
          <p className={`WelcomeDp typing ${cards[0] == 'one' ? cards[0] : 'invisible'}`}>
            <span class="welcome-line">Welcome to the</span>
            <span style={{ color: 'red' }} class="welcome-line" >Disease Predictor!</span>
            <span className='chatBottom'>' '</span>
            <span className='chatBottomCircle'>' '</span>
          </p>
          <p className={`WelcomeCb typing ${cards[0] == 'three' ? cards[0] : 'invisible'}`}>
            <span class="welcome-line">Welcome to the</span>
            <span style={{ color: 'red' }} class="welcome-line" >ChatBot!</span>
            <span className='chatBottom'>' '</span>
            <span className='chatBottomCircle'>' '</span>
          </p>
          <p className={`WelcomeAp typing ${cards[0] == 'two' ? cards[0] : 'invisible'}`}>
            <span class="welcome-line">Welcome to the</span>
            <span style={{ color: 'red' }} class="welcome-line" >Appointment Page!</span>
            <span className='chatBottom'>' '</span>
            <span className='chatBottomCircle'>' '</span>
          </p>
        </div>
      </div>
      <div className={`messages ${isSidebarOpen ? '' : 'hidden'}`}>
        <div className="chat-header">
          <div className='card-container'></div>
            <div className = {`card dp ${cards[0]}`}  onClick={rotateRight}>
              <span className='midcircle'></span>
              <span className='leftcircle'></span>
              <span className='rightcircle'></span>
              <div className='pageTopic'></div>
              <h1 className='model'>DISEASE PREDICTOR</h1>
              <img src={brain} alt="Transparent Image" className='brain'/>
              <img src={lungs} alt="Transparent Image" className='lungs'/>
              <img src={heart} alt="Transparent Image" className='heart'/>
            </div>
            <div className={`card ra ${cards[1]}`}  onClick={rotateRight}>
              <span className='midcircle'></span>
              <span className='leftcircle'></span>
              <span className='rightcircle'></span>
              <h1 className='model'>REPORT ANALYZER</h1>
              <div className='pageTopic'></div>
              <img src={pieChart} alt="Transparent Image" className='pieChart'/>
              <img src={report} alt="Transparent Image" className='report'/>
            </div>
            <div className={`card cb ${cards[2]}`}  onClick={rotateRight}>
              <span className='midcircle'></span>
              <span className='leftcircle'></span>
              <span className='rightcircle'></span>
              <h1 className='model'>CHATBOT</h1>
              <div className='pageTopic'></div>
              <img src={medbot} alt="Transparent Image" className='medbot'/>
              <img src={chatBubble} alt="Transparent Image" className='chatBubble'/>
            </div>
            <div className={`card ap ${cards[3]}`}  onClick={rotateRight}>
              <span className='midcircle'></span>
              <span className='leftcircle'></span>
              <span className='rightcircle'></span>
              <h1 className='model'>APPOINTMENT</h1>
              <div className='pageTopic'></div>
              <img src={medbot} alt="Transparent Image" className='medbot'/>
              <img src={calender} alt="Transparent Image" className='calender'/>
            </div>
        </div>

      <div style={{ padding: '20px', width: '100%'}}>
      <div
        {...getRootProps()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          borderRadius: '10px',
          padding: '20px',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        {/* <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag and drop a file here, or click to browse</p>
        )} */}
      </div>
    </div>

    <div className='Chats'>

          {
            cards[0] == 'one' && (
              <div>
                {/* <DiseasePredictor/> */}
              </div>
            )
          }

          {selectedSession?.messages.map((msg, index) => (
            (msg.sender === 'user') ? (
              <div className="UserChats" key={index}>
                <div className='userChat'>
                  <p className={`message ${msg.sender}`}>
                    {msg.text}
                  </p>
                  {/* Add a null check before accessing userProfile properties */}
                  {userProfile ? (
                    <img src={userProfile.photoURL} alt={userProfile.name} className="user-avatar" />
                  ) : (
                    <div src={defaultUser} className="default-avatar">U</div> // Default avatar if no user is signed in
                  )}
                </div>
              </div>
            ) : (
              <div className="AiChats" key={index}>
                <div className='aiChat'>
                  {/* Add a null check before accessing userProfile properties */}
                  {userProfile ? (
                    <img src={medbot} alt={userProfile.name} className="ai-avatar" />
                  ) : (
                    <div src={defaultUser} className="default-avatar">AI</div> // Default avatar for AI
                  )}
                  <p className={`message ${msg.sender}`}>
                    {msg.text}
                  </p>
                </div>
              </div>
            )
          ))}
            </div>
      </div>
      <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="text-input"
            />

            <div className="action-buttons">

              {/* File Upload Button */}
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.txt"
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="file-upload-button">
                <FontAwesomeIcon icon={faUpLong} />
              </label>

              {/* Send Button */}
              <button onClick={handleSendMessage} className="send-button">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>

          {selectedFile && (
            <div style={{ marginTop: '20px', textAlign: 'center' }} className='uploadBox'>
              <img src={pdf} alt={'pdf'} className="pdf" />
              <div className='fileDetails'>
                <h3 style={{fontWeight: 'bold'}}>Uploaded File:</h3>
                <p>{selectedFile.name}</p>
                <p>Size: {(selectedFile.size/1024/1024).toFixed(2)} mb</p>
                <p>Type: pdf</p>
              </div>
              <button className='closebutton'
                style={{ marginLeft: '10px' }}
                onClick={() => setSelectedFile(null)}
              >
              <FontAwesomeIcon icon={faClose} />
              </button>

              {isUploading && (
                <div style={{ marginTop: '20px', width: '100px', margin: '0 auto' }}>
                  <CircularProgressbar
                    value={uploadProgress}
                    text={`${uploadProgress}%`}
                    // className='uploadProgress'
                    styles={buildStyles({
                      textSize: '16px',
                      pathColor: '#007BFF',
                      textColor: '#007BFF',
                    })}
                  />
                </div>
              )}
          </div>
        )}
    </div>
  );  
};

export default ChatArea;
