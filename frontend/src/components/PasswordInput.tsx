import React from 'react';

interface PasswordInputProps {
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBack: () => void;
  setStep: (step: number) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ password, onPasswordChange, handleBack, setStep }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
    <input
      type="password"
      value={password}
      onChange={onPasswordChange}
      placeholder="Contraseña del PDF (opcional)"
    />
      <div style={{ marginTop: '10px' }}>
        <button type="button" onClick={handleBack} style={{ marginRight: '10px' }}>
          Atrás
        </button>
        <button type="button" onClick={() => setStep(3)}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
