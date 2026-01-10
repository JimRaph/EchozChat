import React from 'react';
import './index.css'
import './App.css'
import { BrowserRouter as Router} from "react-router-dom";
import ContextProvider from './context/context';
import { ThemeProvider } from './context/ThemeContext';
import AuthFlow from './pages/Auth';
import Home from './pages/home';
import  { useState } from 'react';
import { SocketProvider } from './context/Socket';
import {Toaster} from 'sonner'


function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
      return !!localStorage.getItem('whatsapp-token');
    });

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthFlow onAuthenticated={handleAuthenticated} />;
  }

  return (
     <div className='h-full'>

      <Router>
        <ContextProvider>
        <ThemeProvider>
          <SocketProvider>
            <Home />
          </SocketProvider>
        </ThemeProvider>
        </ContextProvider>
    </Router>
     <Toaster position="top-right" />

     </div>
  );
}

export default App
