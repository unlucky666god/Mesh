'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import 'dotenv/config';

interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
  joinConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  editMessage: (conversationId: string, messageId: string, newText: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children, token }: { children: React.ReactNode, token: string }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  console.log("Socket env host: ", process.env.NEXT_PUBLIC_SOCKET_HOST);

  useEffect(() => {
    if (!token) return;

    const s = io(process.env.NEXT_PUBLIC_SOCKET_HOST, {
      auth: { token },
      reconnectionAttempts: 5,
    });

    s.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('connect_error', (err) => {
      setError(err.message);
      setConnected(false);
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [token]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socket && connected) {
      socket.emit('join_conversation', { conversationId });
    }
  }, [socket, connected]);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    if (socket && connected) {
      socket.emit('send_message', { conversationId, text });
    }
  }, [socket, connected]);

  const markAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    if (socket && connected) {
      socket.emit('message:read', { conversationId, messageIds });
    }
  }, [socket, connected]);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  const deleteMessage = async (conversationId: string, messageId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        socket?.emit('message:delete', { conversationId, messageId });
      } else {
        console.error("Failed to delete from DB");

      }
    } catch (err) {
      console.error("Delete request error:", err);
    }
  };

  const editMessage = async (conversationId: string, messageId: string, newText: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText }),
      });

      if (res.ok) {
        socket?.emit('message:edit', { conversationId, messageId, text: newText });
      }
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      error,
      joinConversation,
      sendMessage,
      markAsRead,
      on,
      off,
      deleteMessage,
      editMessage
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
