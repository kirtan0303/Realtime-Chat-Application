import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { initSocket, disconnectSocket, getSocket } from '../services/socket';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize socket connection
      const socketInstance = initSocket();
      setSocket(socketInstance);
      
      // Clean up on unmount
      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated]);

  // Reconnect socket if needed
  const reconnect = () => {
    disconnectSocket();
    const socketInstance = initSocket();
    setSocket(socketInstance);
    return socketInstance;
  };

  return (
    <SocketContext.Provider value={{ socket: socket || getSocket(), reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
