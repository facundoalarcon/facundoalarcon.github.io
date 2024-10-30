// src/App.tsx

import React from 'react';
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import AuthComponent from './components/Auth/GoogleAuth';
import FileUpload from './components/FileUpload';

const App: React.FC = () => {
  const { user, logout } = useAuth(); // Obtén el logout del contexto

  return (
    <div>
      {!user ? (
        <AuthComponent />
      ) : (
        <div>
          <FileUpload />
          <button onClick={logout}>Log Out</button> {/* Llama a logout aquí */}
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
