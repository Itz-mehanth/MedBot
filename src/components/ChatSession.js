// ChatSession.js
import React from 'react';

const ChatSession = ({ session, onSelect }) => {
  return (
    <div className="session" onClick={onSelect}>
      <p>{session.name}</p>
    </div>
  );
};

export default ChatSession;
