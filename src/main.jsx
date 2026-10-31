/**
 * @file main.jsx
 * @description Application entry point — mounts the <App /> component into #root.
 * @author Xiaopeng Li
 * @copyright © 2026 Xiaopeng Li
 * @version 1.0.0
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

/*
 * Service worker: register ONLY on the deployed origin. Localhost previews
 * (vite preview) would otherwise precache a snapshot and keep serving the old
 * bundle — the reason phone/desktop previews looked unchanged after rebuilds.
 * autoUpdate keeps the installed PWA fresh on the live site.
 */
if (
  typeof window !== 'undefined' &&
  window.location &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname)
) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({ immediate: true })
    })
    .catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
