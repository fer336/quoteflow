import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import AdminCMSApp from './components/AdminCMSApp.jsx'
import './index.css'

// Fallback para desarrollo local
const DEFAULT_CLIENT_ID = '1016270254180-5odhc9o98c2sqgpvpipku9urjthlrdob.apps.googleusercontent.com';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;
const APP_MODE = import.meta.env.VITE_APP_MODE || 'tenant';
const RootApp = APP_MODE === 'cms' ? AdminCMSApp : App;

if (!CLIENT_ID || CLIENT_ID === 'undefined') {
  console.error("Falta VITE_GOOGLE_CLIENT_ID en las variables de entorno");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <RootApp />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
