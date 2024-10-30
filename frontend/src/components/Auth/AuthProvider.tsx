// src/components/Auth/AuthProvider.tsx

import React, { createContext, useContext, useState } from 'react';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';

interface AuthContextType {
  user: any;
  login: (credentialResponse: any) => void;
  logout: () => void; // Aquí defines la función de logout
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  const login = (credentialResponse: any) => {
    console.log('Credential Response:', credentialResponse);
    if (credentialResponse && credentialResponse.credential) {
      const profile = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      setUser({
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      });
    } else {
      console.error('No valid credential response');
    }
  };

  const logout = () => {
    setUser(null);
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
