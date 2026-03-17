// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // URL твоего Next.js приложения
    methods: ["GET", "POST"]
  }
});

// Middleware для проверки JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error("Authentication error"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.user = decoded; // Сохраняем данные пользователя в сокете
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  socket.on('send_message', (data) => {
    // data: { recipientId: '123', text: 'Привет!' }
    io.emit('receive_message', {
      senderId: socket.user.id,
      text: data.text,
      time: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(4000, () => {
  console.log('Socket server is running on port 4000');
});