// src/components/Auth/AuthProvider.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';

interface AuthContextType {
  user: any;
  login: (credentialResponse: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(() => {
    // Obtener usuario desde localStorage al cargar
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (credentialResponse: any) => {
    if (credentialResponse && credentialResponse.credential) {
      const profile = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const newUser = {
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser)); // Guardar en localStorage
    } else {
      console.error('No valid credential response');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Limpiar de localStorage
    googleLogout();
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
