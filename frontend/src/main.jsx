import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LoadingProvider } from './context/LoadingContext'
import './index.css'
import App from './App.jsx'
import { SocketProvider } from './context/socketContext'
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById('root')).render(
  
  
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
        <LoadingProvider>
        <App />
        </LoadingProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
    
  
)
