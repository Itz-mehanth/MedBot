// ChatArea.js
import React, { useState } from 'react';

const ChatArea = ({ selectedSession }) => {
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim()) {
      selectedSession.messages.push({ sender: 'user', text: input });
      setInput('');
    }
  };

  return (
    <div className="chat-area">
        <div className="messages">
            <p className='Welcome'>Welcome to MedBot</p>
            {selectedSession?.messages.map((msg, index) => (
                msg.sender === "ai" ? (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ) : (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                )
            ))}
        </div>
        <div className="input-area">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    </div>
  );
};

export default ChatArea;
