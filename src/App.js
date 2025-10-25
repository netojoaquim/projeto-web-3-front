import React from 'react';
import AppRoutes from './routes/AppRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CarrinhoContext';
import { LayoutProvider } from './context/LayoutContext'; // Importe o novo Provider
import CartOffcanvas from './components/CartOffcanvas'; // Importe o carrinho lateral
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>
        <CartProvider>
          <LayoutProvider> {/* Envolve a aplicação */}
            <AppRoutes />
            <CartOffcanvas /> {/* Componente de layout que fica fora das rotas */}
          </LayoutProvider>
        </CartProvider>
      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;