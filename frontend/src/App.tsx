// src/App.tsx
import React from 'react';
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import AuthComponent from './components/Auth/GoogleAuth';
import FileUpload from './components/FileUpload';

const App: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      {!user ? (
        <AuthComponent />
      ) : (
        <div>
          <button className="logout" onClick={logout}>
            Log Out
          </button>
          <FileUpload />
        </div>
      )}
    </div>
  );
};

const MainApp: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default MainApp;
