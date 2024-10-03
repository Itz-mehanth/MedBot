import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { setDoc, collection, doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../auth/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import ChatSession from './ChatSession';
import LoginModal from '../auth/login'; // If you plan to use modal

export var user;

const Sidebar = ({ sessions, onSelectSession, isSidebarOpen, toggleSidebar }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const navigate = useNavigate();
  // Function to check if user exists in Firestore
  const checkIfUserExists = async (uid) => {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists();
  };

  // Function to handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;

      if (!user || !user.uid) {
        console.error('User or User ID is not available');
        return;
      }

      // Check if user's details already exist in the database
      const userExists = await checkIfUserExists(user.uid);

      if (userExists) {
        // User's details exist, proceed to the main page
        setIsLoggedIn(true);
        setUserProfile({ name: user.displayName, photoURL: user.photoURL });
      } else {
        // User's details don't exist, navigate to the form page
        navigate('/login');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  // Handle form submission for additional user data (name, age, gender)
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(collection(db, 'users'), user.uid);
        await setDoc(userDoc, {
          name,
          age,
          gender,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
        console.log('User data stored successfully');
        handleLoginSuccess(); // Navigate after storing data
      } else {
        console.error('User is not authenticated');
      }
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  // Define handleLoginSuccess
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('/'); // You can adjust this to navigate to the desired page after login success
  };


  // Check authentication status on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserProfile({ name: user.displayName, photoURL: user.photoURL });
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUserProfile(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div>
      <div className={`sidebar ${isSidebarOpen ? '' : 'hidden'}`}>
        <div className='Sidebar-header'>
          <button onClick={toggleSidebar} className="menu-icon">☰</button>
          {isLoggedIn && userProfile && (
            <div className={`user-profile ${isSidebarOpen ? '' : 'invisible'}`}>
              <img src={userProfile.photoURL} alt={userProfile.name} className="profile-avatar" />
              <span>{userProfile.name}</span>
            </div>
          )}
        </div>

        <h3 className={isSidebarOpen ? '' : 'invisible'}>Previous Sessions</h3>
        {isSidebarOpen && (
          <div>
            {sessions.map((session, index) => (
              <ChatSession
                key={index}
                session={session}
                onSelect={() => onSelectSession(session)}
              />
            ))}
            {!isLoggedIn ? (
              <button onClick={handleGoogleSignIn}>Login</button>
            ): (
              <button onClick={handleLogout} className="logout-button">Logout</button>
            )
          }
        </div>
        )}

      </div>
    </div>
  );
};

export default Sidebar;
