import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // adiciona um novo alerta
  const showAlert = ({ id, title, message, type = 'info', duration = 3000, bg }) => {
    const alertId = id || Date.now();
    setAlerts(prev => [...prev, { id: alertId, title, message, type, duration, bg }]);

    // remove automaticamente após duration
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }, duration);
  };

  // remove um alerta manualmente
  const hideAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
