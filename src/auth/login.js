import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import './login.css';
import { db } from '../auth/firebase';
import { useNavigate } from 'react-router-dom'; // Correct use of useNavigate

const LoginModal = ({ isOpen, userId, onClose }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState(''); // Date of Birth
  const [gender, setGender] = useState('');
  const [pastMedicalHistory, setPastMedicalHistory] = useState(''); // New State for Medical History
  const [userExists, setUserExists] = useState(false);
  const navigate = useNavigate(); // Correct function name: navigate

  useEffect(() => {
    const checkUserExists = async () => {
      if (userId) {
        const userDoc = doc(collection(db, 'users'), userId);
        const docSnapshot = await getDoc(userDoc);
        setUserExists(docSnapshot.exists());
      }
    };
    checkUserExists();
  }, [userId]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const userDoc = doc(collection(db, 'users'), userId);
    
    // Save name, dob, gender, and medical history to Firestore
    await setDoc(userDoc, {
      name,
      dob,
      gender,
      pastMedicalHistory, // Include medical history
    });
    
    // Navigate to the homepage after submission
    navigate('/'); // Correct use of navigate
  };

  return (
    <div style={{ display: isOpen ? 'block' : 'none' }} className="modal-overlay">
      <div className="modal-content">
        <h2>{userExists ? 'Welcome Back' : 'Enter Your Details'}</h2>
        {!userExists && (
          <form onSubmit={handleFormSubmit} className='form'>
            <div>
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label>Date of Birth</label>
              <input 
                type="date" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label>Past Medical History</label>
              <textarea 
                value={pastMedicalHistory} 
                onChange={(e) => setPastMedicalHistory(e.target.value)} 
                rows="4" 
                required 
                placeholder="Enter your past medical history here"
              />
            </div>
            <button className='submit' type="submit">Continue</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
