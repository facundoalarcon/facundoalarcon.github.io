import React, { useState } from 'react';
import { useAuth } from './Auth/AuthProvider';

const FileUpload: React.FC = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files ? event.target.files[0] : null);
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

    try {
      const uploadUrl = process.env.FILE_URL_UPLOAD;

      if (!uploadUrl) {
        throw new Error("La URL de subida no está definida en las variables de entorno");
      }
      console.log(uploadUrl)
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
    } catch (error) {
      setError('Hubo un problema al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container">
      <h2>Subir y Convertir PDF a CSV</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button type="submit" disabled={!selectedFile || isUploading}>
          {isUploading ? 'Procesando...' : 'Subir y Procesar'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
