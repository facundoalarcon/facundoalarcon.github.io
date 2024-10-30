// src/components/Auth/GoogleAuth.tsx

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthProvider';

const AuthComponent: React.FC = () => {
  const { login } = useAuth();

  const handleLoginSuccess = (credentialResponse: any) => {
    console.log('Login Success:', credentialResponse);
    login(credentialResponse); // Llama a la función login del contexto
  };

  const handleLoginError = () => {
    console.log('Login Failed');
  };

  return (
    <div>
      <h1>Contable</h1>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    </div>
  );
};

export default AuthComponent;
