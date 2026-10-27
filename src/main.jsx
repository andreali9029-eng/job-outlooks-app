/**
 * @file main.jsx
 * @description Application entry point — mounts the <App /> component into #root.
 * @author andreali9029-eng
 * @copyright © 2026 andreali9029-eng
 * @version 1.0.0
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
