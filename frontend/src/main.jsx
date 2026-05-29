import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Backend API ka base URL set kar rahe hain (.env se uthayega)
// Agar .env mein VITE_API_URL nahi mila toh default localhost use karega
axios.defaults.baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
