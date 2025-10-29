import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useAlert } from '../context/AlertContext';

export const AlertToast = () => {
  const { alerts, hideAlert } = useAlert();

  return (
    <ToastContainer position="top-end" className="p-3">
      {alerts.map((alert) => (
        <Toast
          key={alert.id}
          onClose={() => hideAlert(alert.id)}
          autohide
          delay={alert.duration}
          bg={alert.bg || alert.type}
        >
          <Toast.Header
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              backgroundColor: alert.bg ? "#fff" : undefined,
              color: alert.bg,
            }}
          >
            <strong className="me-auto">{alert.title}</strong>
          </Toast.Header>
          <Toast.Body>{alert.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};
