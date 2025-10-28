import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('null');
    


    // Restaura usuário e token do localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userDataString = localStorage.getItem('user');
        

        console.log('AuthContext init -> token:', token);
        console.log('AuthContext init -> userDataString:', userDataString);



        if (token && userDataString) {
            try {
                const userData = JSON.parse(userDataString);
                //console.log('AuthContext -> userData parseado:', userData);
                setIsAuthenticated(true);
                setUser(userData);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUserRole(userData.role || 'null');
            } catch (e) {
                console.error("Erro ao restaurar usuário:", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { identificador: email, senha: password });
            const { token, usuario } = response.data;

            if (!usuario?.id) return { success: false, message: 'Resposta inválida do servidor.' };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(usuario));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setIsAuthenticated(true);
            setUser(usuario);
            setUserRole(usuario.role || 'null');

            return { success: true, message: 'Login realizado com sucesso!' };
        } catch (error) {
            const status = error.response?.status;
            let errorMessage = 'Erro de conexão ou credenciais inválidas.';
            if (status === 401) errorMessage = 'Email ou senha incorretos.';
            else if (status === 400) errorMessage = error.response?.data?.message || errorMessage;
            return { success: false, message: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    const register = async (userData) => {
        try {
            await api.post('/cliente', userData);
            return { success: true, message: 'Conta criada com sucesso! Faça login.' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Não foi possível conectar ao servidor.';
            return { success: false, message: errorMessage };
        }
    };

    // Busca dados do cliente
    const fetchClientData = useCallback(async (userId) => {
        const id = userId || user?.id;
        if (!id) return { success: false, message: 'Usuário não autenticado ou ID ausente.' };

        try {
            const response = await api.get(`/cliente/${id}`);
            const clientData = response.data.data || response.data; // depende do seu backend

            setUser(clientData);
            localStorage.setItem('user', JSON.stringify(clientData));

            return { success: true, data: clientData };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao carregar dados do perfil.';
            return { success: false, message: errorMessage };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [user]);


    const updateClientData = async (updatedData) => {
        if (!isAuthenticated || !user?.id)
            return { success: false, message: 'Usuário não autenticado ou ID ausente.' };

        try {
            await api.patch(`/cliente/${user.id}`, updatedData);
            await fetchClientData(user.id);
            return { success: true, message: 'Dados atualizados com sucesso!' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao atualizar dados.';
            return { success: false, message: errorMessage };
        }
    };

    // CRUD Endereços
    const addAddress = async (addressData) => {
        const clientId = user?.id || JSON.parse(localStorage.getItem('user'))?.id;
        if (!isAuthenticated || !clientId)
            return { success: false, message: 'Usuário não autenticado.' };

        try {
            // Adiciona o clienteId ao body do request
            await api.post('/cliente/endereco', { ...addressData, clienteId: clientId });
            await fetchClientData(clientId);
            return { success: true, message: 'Endereço adicionado com sucesso!' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao salvar novo endereço.';
            return { success: false, message: errorMessage };
        }
    };

    const updateAddress = async (addressId, addressData) => {
        if (!isAuthenticated || !user?.id) return { success: false, message: 'Usuário não autenticado.' };
        try {
            await api.patch(`/cliente/endereco/${addressId}`, addressData);
            await fetchClientData(user.id);
            return { success: true, message: 'Endereço atualizado com sucesso!' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao atualizar endereço.';
            return { success: false, message: errorMessage };
        }
    };

    const deleteAddress = async (addressId) => {
        if (!isAuthenticated || !user?.id) return { success: false, message: 'Usuário não autenticado.' };
        try {
            await api.delete(`/cliente/endereco/${addressId}`);
            await fetchClientData(user.id);
            return { success: true, message: 'Endereço removido com sucesso!' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao remover endereço.';
            return { success: false, message: errorMessage };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                loading,
                userRole,
                login,
                logout,
                register,
                fetchClientData,
                updateClientData,
                addAddress,
                updateAddress,
                deleteAddress,
                   
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
