const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());

const rooms = {};

io.on('connection', (socket) => {
  console.log('A user has connected');

  socket.on('join-room', (roomName, userId) => {
    console.log(`User ${userId} is trying to join room ${roomName}`);
    if (!rooms[roomName]) {
    rooms[roomName] = [];
  }

  if (rooms[roomName].length >= 2) {
    socket.emit('room-full');
    return;
  }

  rooms[roomName].push(userId);
  socket.join(roomName);
  console.log(`User ${userId} joined room ${roomName}`);

    if (rooms[roomName].length === 1) {
      io.emit('room-created', roomName);
    }

    socket.to(roomName).emit('user-connected', userId);

    socket.on('disconnect', () => {
      console.log('A user has disconnected');
      rooms[roomName] = rooms[roomName].filter(id => id !== userId);
      socket.to(roomName).emit('user-disconnected', userId);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
