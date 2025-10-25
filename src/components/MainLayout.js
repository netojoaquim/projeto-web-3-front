import React from 'react';
import Header from './Header'; // Importe o Header
// Importe outros elementos de layout, como Footer, CartOffcanvas...

// O prop 'children' receberá o conteúdo da página (Home, Products, etc.)
const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      {/* Aqui ficaria o <CartOffcanvas /> se ele não fosse um componente de contexto */}
      <main className="container mt-4">
        {children}
      </main>
      {/* Opcional: <Footer /> */}
    </>
  );
};

export default MainLayout;