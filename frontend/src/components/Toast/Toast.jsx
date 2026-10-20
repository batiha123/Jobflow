import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
    error: (msg) => addToast(msg, 'error')
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-${t.type}`}>
            <div className="toast-icon-box">
              {t.type === 'success' && <CheckCircle2 size={18} />}
              {t.type === 'info' && <Info size={18} />}
              {t.type === 'warning' && <AlertTriangle size={18} />}
              {t.type === 'error' && <XCircle size={18} />}
            </div>
            <span className="toast-msg-text">{t.message}</span>
            <button 
              type="button" 
              className="toast-close-btn" 
              onClick={() => removeToast(t.id)}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
