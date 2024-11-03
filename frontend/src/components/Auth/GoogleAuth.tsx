// src/components/Auth/GoogleAuth.tsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthProvider';

const AuthComponent: React.FC = () => {
  const { login } = useAuth();

  const handleLoginSuccess = (credentialResponse: any) => {
    console.log('Login Success:', credentialResponse);
    login(credentialResponse);
  };

  const handleLoginError = () => {
    console.log('Login Failed');
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    </div>
  );
};

export default AuthComponent;
