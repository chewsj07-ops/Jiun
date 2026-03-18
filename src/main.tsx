import {StrictMode, useState, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { ErrorBoundary } from './components/ErrorBoundary';

function RootApp() {
  const [appKey, setAppKey] = useState(0);

  useEffect(() => {
    const handleAuthStateChanged = () => {
      setAppKey(prev => prev + 1);
    };
    window.addEventListener('auth_state_changed', handleAuthStateChanged);
    return () => window.removeEventListener('auth_state_changed', handleAuthStateChanged);
  }, []);

  return <App key={appKey} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <FirebaseProvider>
        <RootApp />
      </FirebaseProvider>
    </ErrorBoundary>
  </StrictMode>,
);
