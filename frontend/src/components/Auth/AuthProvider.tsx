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
  const [user, setUser] = useState<any>(null);

  // Restaurar el usuario desde localStorage al cargar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (credentialResponse: any) => {
    console.log('Credential Response:', credentialResponse);
    if (credentialResponse && credentialResponse.credential) {
      const profile = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const userData = {
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Guardar en localStorage
    } else {
      console.error('No valid credential response');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Eliminar del almacenamiento
    googleLogout(); // Desconectar de Google si es necesario
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
