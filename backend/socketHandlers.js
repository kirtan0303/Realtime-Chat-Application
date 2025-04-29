const User = require('../models/User');
const Chat = require('../models/Chat');

exports.setupSocketHandlers = (io) => {
  const connectedUsers = new Map();
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    
    // Update user status to online
    User.findByIdAndUpdate(socket.userId, { status: 'online', lastSeen: new Date() })
      .then(() => {
        // Broadcast user online status
        io.emit('user_online', { userId: socket.userId });
      })
      .catch(err => console.error('Error updating user status:', err));
      
    // Join personal room for direct messages
    socket.join(socket.userId);
    
    // Handle joining a chat room
    socket.on('join_room', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined room ${chatId}`);
    });
    
    // Handle leaving a chat room
    socket.on('leave_room', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left room ${chatId}`);
    });
    
    // Handle sending a message
    socket.on('send_message', (messageData) => {
      io.to(messageData.chatId).emit('receive_message', messageData);
    });
    
    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.broadcast.to(data.chat).emit('user_typing', data);
    });
    
    socket.on('stop_typing', (data) => {
      socket.broadcast.to(data.chat).emit('user_stop_typing', data);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Update user status to offline
      User.findByIdAndUpdate(socket.userId, { status: 'offline', lastSeen: new Date() })
        .then(() => {
          // Broadcast user offline status
          io.emit('user_offline', { userId: socket.userId });
        })
        .catch(err => console.error('Error updating user status:', err));
    });
  });
};
