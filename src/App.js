import React from 'react';
import AppRoutes from './routes/AppRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CarrinhoContext';
import { LayoutProvider } from './context/LayoutContext';
import CartOffcanvas from './components/CartOffcanvas'; 
import { BrowserRouter } from 'react-router-dom';
import {AlertToast} from './components/AlertToast' 
import { AlertProvider } from './context/AlertContext';

function App() {
  return (
    <BrowserRouter>
      <AlertProvider>
        <AlertToast />
        <AuthProvider>
          <CartProvider>
            <LayoutProvider>
              <AppRoutes />
              <CartOffcanvas />
              <AlertToast />
            </LayoutProvider>
          </CartProvider>
        </AuthProvider>
      </AlertProvider>
    </BrowserRouter>
  );
}

export default App;