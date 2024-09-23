// ChatPage.js
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const ChatPage = () => {
  const [sessions, setSessions] = useState([
    { name: 'Session 1', messages: [{ sender: 'user', text: 'Hello!' }, { sender: 'ai', text: 'Hi!' }] },
    { name: 'Session 2', messages: [{ sender: 'user', text: 'How are you?' }, { sender: 'ai', text: 'I’m fine!' }] }
  ]);
  const [selectedSession, setSelectedSession] = useState(sessions[0]);

  const handleSelectSession = (session) => {
    setSelectedSession(session);
  };

  return (
    <div className="chat-page">
        <div className='TopBanner'>
            <div className='BottomOverflow'>
                <div className='SideCircle'>

                </div>
                <div className='SideRect'>

                </div>
                <div className='SideCircleTop'>

                </div>
                <div className='LogoContainer'>
                </div>
            </div>
        </div>
        <div className='HomePage'>
            <Sidebar sessions={sessions} onSelectSession={handleSelectSession}/>
            <ChatArea selectedSession={selectedSession} />
        </div>
    </div>
  );
};

export default ChatPage;
