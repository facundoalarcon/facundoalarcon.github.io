// src/components/FileUpload.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './Auth/AuthProvider';
import FileSelector from './FileSelector';
import PasswordInput from './PasswordInput';

const FileUpload: React.FC = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      setError('No tienes permisos para subir archivos. Inicia sesión para continuar.');
    } else {
      setError(null);
    }
  }, [user]);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setStep(2); // Cambia de paso si hay un archivo seleccionado
    } else {
      setStep(1); // Permite regresar si no hay archivo
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError('Por favor, seleccione un archivo');
      return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('password', password);
    formData.append('email', user?.email || '');

    try {
      const uploadUrl = process.env.REACT_APP_FILE_URL_UPLOAD;

      if (!uploadUrl) {
        throw new Error("La URL de subida no está definida en las variables de entorno");
      }
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la subida del archivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.name.replace('.pdf', '')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setIsCompleted(true);
    } catch (error) {
      setError('Hubo un problema al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleNewUpload = () => {
    setSelectedFile(null);
    setPassword('');
    setStep(1);
    setIsCompleted(false);
    setError(null); // Resetear el mensaje de error al iniciar una nueva subida
  };

  return (
    <div className="container">
      <h2>Subir y Convertir PDF a CSV</h2>
      {!isCompleted ? (
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div>
              <FileSelector selectedFile={selectedFile} onFileChange={handleFileChange} />
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                disabled={!selectedFile} // Habilitar solo si hay un archivo seleccionado
                style={{ marginTop: '10px' }}
              >
                Siguiente
              </button>
            </div>
          )}

          {step === 2 && (
            <PasswordInput password={password} onPasswordChange={handlePasswordChange} handleBack={handleBack} setStep={setStep} />
          )}

          {step === 3 && (
            <div>
              {/* Mostrar solo el botón de "Procesando..." si está subiendo, o "Subir y Procesar" si no lo está */}
              {isUploading ? (
                <button type="button" disabled>
                  Procesando...
                </button>
              ) : (
                <>
                  <button type="button" onClick={handleBack} style={{ marginRight: '10px' }}>
                      Atrás
                    </button>
                  
                  <button type="submit">
                    Subir y Procesar
                  </button>
                </>
              )}
              {/* Mostrar el mensaje de error solo en el último paso */}
              {error && <p className="error-message">{error}</p>}
            </div>
          )}
        </form>
      ) : (
        <div>
          <p>Archivo procesado exitosamente. Puedes subir otro archivo si lo deseas.</p>
          <button type="button" onClick={handleNewUpload}>
            Subir otro archivo
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
