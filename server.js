const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO with the server instance
  const io = new Server(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['polling', 'websocket'],
  });

  // Store active users and typing status
  const activeUsers = new Map();
  const typingUsers = new Map();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-note', ({ noteId, user }) => {
      socket.join(`note-${noteId}`);
      socket.data.currentNoteId = noteId;
      socket.data.userId = user.id;
      
      if (!activeUsers.has(noteId)) {
        activeUsers.set(noteId, new Map());
      }
      
      activeUsers.get(noteId).set(user.id, user);
      
      const noteUsers = Array.from(activeUsers.get(noteId).values());
      io.to(`note-${noteId}`).emit('active-users', { users: noteUsers });
      
      console.log(`User ${user.email} joined note: ${noteId}`);
    });

    socket.on('leave-note', ({ noteId, user }) => {
      socket.leave(`note-${noteId}`);
      socket.data.currentNoteId = null;
      
      if (activeUsers.has(noteId)) {
        activeUsers.get(noteId).delete(user.id);
        if (activeUsers.get(noteId).size === 0) {
          activeUsers.delete(noteId);
        }
      }
      
      if (typingUsers.has(noteId)) {
        typingUsers.get(noteId).delete(user.id);
        if (typingUsers.get(noteId).size === 0) {
          typingUsers.delete(noteId);
        }
      }
      
      const noteUsers = Array.from(activeUsers.get(noteId)?.values() || []);
      io.to(`note-${noteId}`).emit('active-users', { users: noteUsers });
      io.to(`note-${noteId}`).emit('typing-users', { 
        users: Array.from(typingUsers.get(noteId)?.values() || [])
      });
      
      console.log(`User ${user.email} left note: ${noteId}`);
    });

    socket.on('typing', ({ noteId, userId, userName }) => {
      if (!typingUsers.has(noteId)) {
        typingUsers.set(noteId, new Map());
      }
      
      typingUsers.get(noteId).set(userId, userName);
      
      socket.to(`note-${noteId}`).emit('typing-users', {
        users: Array.from(typingUsers.get(noteId).values())
      });
    });

    socket.on('stop-typing', ({ noteId, userId }) => {
      if (typingUsers.has(noteId)) {
        typingUsers.get(noteId).delete(userId);
        if (typingUsers.get(noteId).size === 0) {
          typingUsers.delete(noteId);
        }
      }
      
      socket.to(`note-${noteId}`).emit('typing-users', {
        users: Array.from(typingUsers.get(noteId)?.values() || [])
      });
    });

    socket.on('note-update', ({ noteId, content, title, version }) => {
      // Broadcast to ALL clients in the note room, including sender for consistency
      io.to(`note-${noteId}`).emit('note-updated', {
        noteId,
        content,
        title,
        version,
        userId: socket.data.userId,
        timestamp: Date.now()
      });
      
      // Emit a separate event for real-time collaboration
      io.to(`note-${noteId}`).emit('collaboration-update', {
        noteId,
        content,
        title,
        version,
        userId: socket.data.userId,
        timestamp: Date.now()
      });
    });

    socket.on('cursor-move', ({ noteId, userId, position }) => {
      socket.to(`note-${noteId}`).emit('cursor-moved', {
        userId,
        position
      });
    });

    socket.on('disconnect', () => {
      const currentNoteId = socket.data.currentNoteId;
      const userId = socket.data.userId;

      if (currentNoteId) {
        if (activeUsers.has(currentNoteId)) {
          activeUsers.get(currentNoteId).delete(userId);
          if (activeUsers.get(currentNoteId).size === 0) {
            activeUsers.delete(currentNoteId);
          }
        }

        if (typingUsers.has(currentNoteId)) {
          typingUsers.get(currentNoteId).delete(userId);
          if (typingUsers.get(currentNoteId).size === 0) {
            typingUsers.delete(currentNoteId);
          }
        }

        const noteUsers = Array.from(activeUsers.get(currentNoteId)?.values() || []);
        io.to(`note-${currentNoteId}`).emit('active-users', { users: noteUsers });
        io.to(`note-${currentNoteId}`).emit('typing-users', {
          users: Array.from(typingUsers.get(currentNoteId)?.values() || [])
        });
      }

      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 