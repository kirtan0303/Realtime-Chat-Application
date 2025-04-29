import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './redux/slices/authSlice';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import MainLayout from './components/layout/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import './assets/styles/global.css';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <MainLayout>
                    <Home />
                  </MainLayout>
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/auth"
              element={!isAuthenticated ? <Auth /> : <Navigate to="/" replace />}
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/settings"
              element={
                isAuthenticated ? (
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
};

export default App;
