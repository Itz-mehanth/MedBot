import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Banner from '../components/Banner';
import ChatArea from '../components/ChatArea';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import '../styles.css';
import medbot from '../assets/medbot.png';

// Initialize the font awesome library
library.add(faChevronDown);

const ChatPage = () => {
  // Sessions state, containing the chat sessions with user and AI messages
  const [sessions, setSessions] = useState([
    { name: 'Session 1', messages: [{ sender: 'user', text: 'Hello!' }, { sender: 'ai', text: 'Hi!' }] },
    { name: 'Session 2', messages: [{ sender: 'user', text: 'How are you?' }, { sender: 'ai', text: 'I’m fine!' }] }
  ]);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State to handle the selected chat session
  const [selectedSession, setSelectedSession] = useState(sessions[0]); // Default to the first session

  // Function to toggle sidebar open/close
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to handle session selection from the sidebar
  const handleSelectSession = (session) => {
    setSelectedSession(session);
  };

  return (
    <div className="chat-page">
      {/* Banner component */}
      <Banner isSidebarOpen={isSidebarOpen} />

      {/* Main chat layout with sidebar and chat area */}
      <div className="HomePage">
        {/* Sidebar component */}
        <Sidebar 
          sessions={sessions} 
          onSelectSession={handleSelectSession} 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />

        {/* ChatArea component */}
        <ChatArea 
          selectedSession={selectedSession} 
          setSelectedSession={setSelectedSession} 
          isSidebarOpen={isSidebarOpen} 
        />
      </div>
    </div>
  );
};

export default ChatPage;
