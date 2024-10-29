import React, { useState } from 'react';

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);  // Estado de carga
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files ? event.target.files[0] : null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError('No file selected');
      return;
    }

    setError(null);
    setIsUploading(true);  // Inicia la carga

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://contable-eed6.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error during file upload');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.name.replace('.pdf', '')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      setError('Error uploading the file');
    } finally {
      setIsUploading(false);  // Termina la carga
    }
  };

  return (
    <div>
      <h2>Upload PDF and Convert to CSV</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button type="submit" disabled={!selectedFile || isUploading}>
          Upload and Process
        </button>
      </form>

      {/* Mostrar el spinner mientras está subiendo */}
      {isUploading && (
        <div style={{ marginTop: '20px' }}>
          <img
            src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif"  // Un logo o spinner, lo puedes reemplazar con lo que quieras
            alt="Processing..."
            style={{ width: '70px'}}
          />
          <p>Processing file, please wait...</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
