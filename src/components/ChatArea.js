import axios from 'axios';
import { onAuthStateChanged, } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import brain from '../assets/brain.png';
import heart from '../assets/heart.png';
import { auth, googleProvider, db } from '../auth/firebase';
import lungs from '../assets/lungs.png';
import defaultUser from '../assets/defaultUser.png';
import medbot from '../assets/medbot.png';
import { faChevronDown, faPaperPlane, micOn, faUpload, faUpLong, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import report from '../assets/report.png';

const ChatArea = ({ selectedSession, setSelectedSession, isSidebarOpen}) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [micOn, setMicOn] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [isSwapped, setIsSwapped] = useState(false);
  const [userProfile, setUserProfile] = useState(null);


  const handleSwap = () => {
    if (isSwapped) {   
      console.log(`dp is on top`);
    }
    
    setIsSwapped(!isSwapped);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setInput(selectedFile.name); // Display file name in the input field
  };

  const handleSendMessage = async () => {
    if (file != null) {
      handleFileUpload();
    }
    if (input.trim()) {
      const updatedSession = {
        ...selectedSession,
        messages: [...selectedSession.messages, { sender: 'user', text: input }]
      };
      setSelectedSession(updatedSession);
      setInput('');
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

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        }
      });
      

      // Check the response object
      console.log('Response from server:', response);

      const extractedText = response.data.text;

      // Update the selectedSession with new AI message
      const updatedSession = {
        ...selectedSession,
        messages: [...selectedSession.messages, { sender: 'ai', text: extractedText }]
      };
      setSelectedSession(updatedSession);

      setUploadProgress(-1); // Reset upload progress after successful upload
      setFile(null); // Clear selected file
      setInput(''); // Clear input field

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  useEffect(() => {
    console.log(`Sidebar is now ${isSidebarOpen ? 'open' : 'closed'}`);
    // Other side effects related to sidebar visibility can be added here.
  }, [isSidebarOpen]);  // This effect will run every time `isSidebarOpen` changes.

  return (
    <div className={`chat-area ${isSidebarOpen ? '' : 'hidden'}`}>
      <div className='botPlace'>
        <img src={medbot} alt={"bot"} className={`medbotcaptain ${isSwapped ? 'ra' : 'dp'}`} />
        <div class={`chat-bubble ${isSwapped ? 'rapop' : 'dppop'}`}>
          <p className={`WelcomeRa typing ${isSwapped ? '' : 'invisible'}`}>
            <span class="welcome-line">Welcome to the</span>
            <span style={{ color: 'red' }} class="welcome-line" > Medical Report Analyzer!</span>
            <span className='chatBottom'></span>
            <span className='chatBottomCircle'>' '</span>
          </p>
          <p className={`WelcomeDp typing ${isSwapped ? 'invisible' : ''}`}>
            <span class="welcome-line">Welcome to the</span>
            <span style={{ color: 'red' }} class="welcome-line" >Predictor!</span>
            <span className='chatBottom'>' '</span>
            <span className='chatBottomCircle'>' '</span>
          </p>
        </div>
      </div>
      <div className={`messages ${isSidebarOpen ? '' : 'hidden'}`}>
        <div className="chat-header">
          <div className='card-container'></div>
            <div className = {`card dp ${isSwapped ? 'card-right' : 'card-left'}`}  onClick={handleSwap}>
              <span className='midcircle'></span>
              <span className='leftcircle'></span>
              <span className='rightcircle'></span>
              <div className='pageTopic'></div>
              <h1 className='model'>DISEASE PREDICTOR</h1>
              <img src={brain} alt="Transparent Image" className='brain'/>
              <img src={lungs} alt="Transparent Image" className='lungs'/>
              <img src={heart} alt="Transparent Image" className='heart'/>
            </div>
            <div className={`card ra ${isSwapped ? 'card-left' : 'card-right'}`}  onClick={handleSwap}>
              <span className='midcircle'></span>
              <span className='leftcircle'></span>
              <span className='rightcircle'></span>
              <h1 className='model'>REPORT ANALYZER</h1>
              <div className='pageTopic'></div>
              <img src={medbot} alt="Transparent Image" className='medbot'/>
              <img src={report} alt="Transparent Image" className='report'/>
            </div>
        </div>

        <div className='Chats'>

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
          {/* Upload Progress Bar */}
          {file && (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                {`${uploadProgress > -1 ? `${uploadProgress}` : ''}`}
              </div>
            </div>
          )}
    </div>
  );  
};

export default ChatArea;
