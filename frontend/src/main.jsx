import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HelpBoxProvider } from './components/HelpBox.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelpBoxProvider>
      <App />
    </HelpBoxProvider>
  </StrictMode>,
)