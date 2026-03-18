// server/index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Разрешаем все для разработки, или можно оставить localhost:3000
    methods: ["GET", "POST"],
    credentials: true
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
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  // Присоединение к комнате диалога
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`User ${socket.user.id} joined room ${conversationId}`);
  });

  // Отправка сообщения
  socket.on('send_message', async ({ conversationId, text }) => {
    try {
      const message = await prisma.message.create({
        data: {
          content: text,
          senderId: socket.user.id,
          conversationId: conversationId,
          status: 'SENT'
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true }
          }
        }
      });

      // Эмитим всем в комнате (включая отправителя)
      io.to(conversationId).emit('message:new', {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
        status: 'sent'
      });
      
      // Обновляем updatedAt у диалога
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Отметка о прочтении
  socket.on('message:read', async ({ conversationId, messageIds }) => {
    try {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          conversationId: conversationId,
          senderId: { not: socket.user.id }
        },
        data: { status: 'READ' }
      });

      socket.to(conversationId).emit('message:status', {
        messageIds,
        status: 'read',
        userId: socket.user.id
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.user.id} disconnected`);
  });
});

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
});
