// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // Serve static files if needed

// Random name generator
function getRandomName() {
  const adjectives = ['Quick', 'Lazy', 'Sleepy', 'Noisy', 'Hungry'];
  const animals = ['Fox', 'Dog', 'Cat', 'Bear', 'Tiger'];
  return (
    adjectives[Math.floor(Math.random() * adjectives.length)] +
    ' ' +
    animals[Math.floor(Math.random() * animals.length)]
  );
}

io.on('connection', (socket) => {
  const userName = getRandomName();
  console.log(`${userName} connected`);

  socket.on('message', (data) => {
    const messageData = {
      name: userName,
      message: data.message,
    };
    io.emit('message', messageData); // Broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log(`${userName} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
