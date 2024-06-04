import React from 'react';
import { createRoot } from 'react-dom/client'; // Importe createRoot de 'react-dom/client'
import App from './App';

const root = createRoot(document.getElementById('root')); // Use createRoot para criar a raiz da aplicação
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
