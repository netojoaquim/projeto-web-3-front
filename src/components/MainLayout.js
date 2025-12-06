import React from 'react';
import Header from './Header';

const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="container mt-4">
        {children}
      </main>
    </>
  );
};

export default MainLayout;