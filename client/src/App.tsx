import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  useEffect(() => {
    socket.emit('hello', 'Hello from client!');

    socket.on('hello-response', (msg) => {
      console.log('Server responded:', msg);
    });

    return () => {
      socket.off('hello-response');
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Blackjack Client</h1>
      <p>Open DevTools console to see Socket.IO messages.</p>
    </div>
  );
}

export default App;
