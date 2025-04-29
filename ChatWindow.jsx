import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage, fetchMessages } from '../../redux/slices/chatSlice';
import socket from '../../services/socket';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatWindow = ({ chatId }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const { messages, loading } = useSelector((state) => state.chat);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessages(chatId));
      
      // Join chat room
      socket.emit('join_room', chatId);
      
      // Listen for incoming messages
      socket.on('receive_message', (newMessage) => {
        if (newMessage.chat === chatId) {
          dispatch(fetchMessages(chatId));
        }
      });
      
      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        if (data.chat === chatId && data.user !== user._id) {
          setTypingUsers((prev) => [...prev, data.username]);
        }
      });
      
      socket.on('user_stop_typing', (data) => {
        if (data.chat === chatId) {
          setTypingUsers((prev) => 
            prev.filter((username) => username !== data.username)
          );
        }
      });
    }
    
    return () => {
      if (chatId) {
        socket.emit('leave_room', chatId);
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      }
    };
  }, [chatId, dispatch, user._id]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content, attachments = []) => {
    if (content.trim() || attachments.length > 0) {
      const messageData = {
        chatId,
        content,
        attachments
      };
      
      dispatch(sendMessage(messageData));
      
      // Emit message to socket
      socket.emit('send_message', {
        ...messageData,
        sender: user._id,
        senderName: user.username
      });
    }
  };

  const handleTyping = (isTyping) => {
    socket.emit(isTyping ? 'typing' : 'stop_typing', {
      chat: chatId,
      user: user._id,
      username: user.username
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.sender._id === user._id}
              />
            ))}
            {typingUsers.length > 0 && (
              <div className="text-sm text-gray-500 italic">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onTyping={handleTyping}
      />
    </div>
  );
};

export default ChatWindow;
