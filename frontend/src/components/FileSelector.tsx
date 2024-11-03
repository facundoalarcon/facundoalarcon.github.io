import React from 'react';

interface FileSelectorProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({ selectedFile, onFileChange }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files ? event.target.files[0] : null);
  };

  const handleRemoveFile = () => {
    onFileChange(null);
  };

  return (
    <div>
      {selectedFile ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>{selectedFile.name}</span>
          <button type="button" onClick={handleRemoveFile} className="red-button" style={{ marginLeft: '10px' }}>
            &times; {/* Icono de eliminar */}
          </button>
        </div>
      ) : (
        <>
          <label htmlFor="file-upload" className="custom-file-upload gray-button">
            Seleccionar archivo
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }} // Oculta el input original
          />
        </>
      )}
    </div>
  );
};

export default FileSelector;
