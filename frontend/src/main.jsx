import React from 'react';
import { createRoot } from 'react-dom/client';
import { Howl, Howler } from 'howler';
import App from './App.jsx';
import './index.css';

// Make Howl available globally for the App component
window.Howl = Howl;
window.Howler = Howler;

// Set the global volume
Howler.volume(0.7);

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
