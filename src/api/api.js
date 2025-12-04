import axios from 'axios';
import { logoutRef } from '../context/AuthContext';

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('sessao expirada');
      logoutRef.current?.();
      //window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;