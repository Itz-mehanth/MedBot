import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import LoginModal from './auth/login'; // Import the login component
import HomePage from './pages/ChatPage'; // Import your chat page component
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './auth/firebase'; // Import Firebase auth
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './auth/firebase'; // Import Firestore

function App() {
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate(); // Corrected `Navigate` to `navigate`

  // Function to check if user exists in Firestore
  const checkIfUserExists = async (uid) => {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists();
  };

  // Handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const userExists = await checkIfUserExists(uid);
        if (!userExists) {
          setUserId(uid); // Set userId if user is logged in but not found in Firestore
          navigate('/login'); // Navigate to /login to show the modal
        } else {
          // If user exists in Firestore, stay on home page
          setUserId(uid);
          navigate('/'); // Or another page if needed
        }
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginModal isOpen={true} userId={userId} />} />
      <Route path="/" element={<HomePage />} /> {/* Default route to ChatPage */}
    </Routes>
  );
}

export default App;
