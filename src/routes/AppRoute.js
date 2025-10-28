import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/MainLayout'; 
import Home from '../pages/Home';
import Login from '../pages/Login';
import DadosCliente from '../pages/DadosCliente';
import EnderecoCliente from '../pages/EnderecoForm';
import CreateProduct from '../pages/CreateProduct';
import ProdutoForm from '../pages/ProdutoForm';
//import CheckoutPage from '../pages/CheckoutPage';
import Register from '../pages/Register';
import PrivateRoute from './PrivateRoutes';
const AppRoute = () => {
 return (
    <Routes>
        
        {/*
        ========================================
        1. ROTAS DE AUTENTICAÇÃO (SEM LAYOUT)
        Renderiza SÓ o componente (Login, Register).
        ========================================
        */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        {/*
        ========================================
        2. ROTAS QUE USAM O LAYOUT PRINCIPAL (COM HEADER)
        A rota '/' e outras páginas de usuário logado (PrivateRoute).
        ========================================
        */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        
        {/* Envolve as rotas protegidas (PrivateRoutes) dentro do MainLayout */}
        <Route element={<PrivateRoute/>}>
            {/* <Route 
                path="/checkout" 
                element={<MainLayout>{<CheckoutPage />}</MainLayout>} 
            /> */}
            <Route 
                path="/cliente/dados" 
                element={<MainLayout>{ <DadosCliente />}</MainLayout>} 
            />
            <Route 
                path="/cliente/enderecos" 
                element={<MainLayout>{ <EnderecoCliente />}</MainLayout>} 
            />
            <Route 
                path="/produto" 
                element={<MainLayout>{<ProdutoForm/>}</MainLayout>} 
            />
            <Route 
                path="/produto/novo" 
                element={<MainLayout>{<CreateProduct/>}</MainLayout>} 
            />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['admin']}/>}>
            
            
        </Route>

        {/* Rota de Not Found */}
        <Route path="*" element={<div>404 - Página não encontrada</div>} />
    </Routes>
);
};
export default AppRoute;