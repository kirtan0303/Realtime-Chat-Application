const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Get all messages for a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Verify chat exists and user is a member
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    if (!chat.users.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }
    
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });
      
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, attachments } = req.body;
    
    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }
    
    // Verify chat exists and user is a member
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    if (!chat.users.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }
    
    const newMessage = new Message({
      sender: req.user.id,
      content: content || '',
      chat: chatId,
      attachments: attachments || []
    });
    
    await newMessage.save();
    
    // Update latest message in chat
    chat.latestMessage = newMessage._id;
    await chat.save();
    
    // Populate sender info for frontend
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username avatar');
      
    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
