import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <FileUpload />
      </header>
    </div>
  );
}

export default App;
