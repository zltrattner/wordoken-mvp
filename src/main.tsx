import React from 'react';
import ReactDOM from 'react-dom/client';
import { PreviewApp } from './preview/PreviewApp';
import '@fontsource/montserrat/latin-500.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/black-han-sans/latin-400.css';
import './styles.css';
import './preview/preview.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PreviewApp />
  </React.StrictMode>,
);
