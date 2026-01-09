import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import './index.css'
import App from './App.jsx'

// Simple mount - no Shadow DOM bullshit
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <HeroUIProvider>
        <App />
      </HeroUIProvider>
    </StrictMode>
  );
}
