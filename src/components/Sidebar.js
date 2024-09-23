// Sidebar.js
import React, { useState } from 'react';
import ChatSession from './ChatSession';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const Sidebar = ({ sessions, onSelectSession}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        console.log(`Sidebar toggle clicked ${isSidebarOpen}`);
        setIsSidebarOpen(!isSidebarOpen);
      };


  return (
    <div className="sidebar">  
        <button onClick={toggleSidebar} className="menu-icon">
        ☰ {/* Menu icon */}
        </button>
        <h3>Previous Sessions</h3>
        <FontAwesomeIcon icon="fa-solid fa-gear" size='lg' color="black"/>

        <div className="sessions-list">
        {sessions.map((session, index) => (
          <ChatSession 
            key={index} 
            session={session} 
            onSelect={() => onSelectSession(session)} 
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
