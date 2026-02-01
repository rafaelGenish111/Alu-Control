import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './i18n'; // import language configuration
import { registerSW } from 'virtual:pwa-register';
import { ConfigProvider } from './contexts/ConfigContext';
import { DarkModeProvider } from './contexts/DarkModeContext';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DarkModeProvider>
        <ConfigProvider>
          <App />
        </ConfigProvider>
      </DarkModeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)