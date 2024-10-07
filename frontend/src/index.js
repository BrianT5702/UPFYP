import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Ensure that the root element exists
const rootElement = document.getElementById('root');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Root element not found. Please ensure there is a <div id="root"></div> in your index.html.');
}
