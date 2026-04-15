import React, { useState, useEffect, createContext, useContext } from 'react';
import styles from './Toast.module.css';

// Toast上下文
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast提供者组件
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const newToast = {
      id,
      message,
      type,
      duration,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // 自动移除
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// 单个Toast项目组件
const ToastItem = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 等待动画完成
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) {
    return null;
  }

  const getTypeClass = () => {
    switch (type) {
      case 'error':
        return styles.toastError;
      case 'warning':
        return styles.toastWarning;
      case 'info':
        return styles.toastInfo;
      default:
        return styles.toastSuccess;
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  return (
    <div className={`${styles.toast} ${getTypeClass()}`}>
      <span className={styles.toastIcon}>{getTypeIcon()}</span>
      <span className={styles.toastMessage}>{message}</span>
      <button className={styles.toastClose} onClick={onClose}>
        ×
      </button>
    </div>
  );
};

// 主Toast组件
const Toast = () => {
  // 这个组件只是一个容器，实际功能由ToastProvider提供
  return null;
};

Toast.Provider = ToastProvider;
Toast.useToast = useToast;

export default Toast;