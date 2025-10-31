import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("null");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userDataString = localStorage.getItem("user");
    //console.log('AuthContext init -> token:', token);
    //console.log('AuthContext init -> userDataString:', userDataString);
    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        //console.log('AuthContext -> userData parseado:', userData);
        setIsAuthenticated(true);
        setUser(userData);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUserRole(userData.role || "null");
      } catch (e) {
        console.error("Erro ao restaurar usuário:", e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        identificador: email,
        senha: password,
      });
      const { token, usuario } = response.data;
      const jwtToken = token.access_token; // 🔹 CORREÇÃO

      if (!usuario?.id)
        return { success: false, message: "Resposta inválida do servidor." };

      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(usuario));
      api.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;

      setIsAuthenticated(true);
      setUser(usuario);
      setUserRole(usuario.role || "null");

      return { success: true, message: "Login realizado com sucesso!" };
    } catch (error) {
      const status = error.response?.status;
      let errorMessage = "Erro de conexão ou credenciais inválidas.";
      if (status === 401) errorMessage = "Email ou senha incorretos.";
      else if (status === 400)
        errorMessage = error.response?.data?.message || errorMessage;
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  const register = async (userData) => {
    try {
      await api.post("/cliente", userData);
      return {
        success: true,
        message: "Conta criada com sucesso! Faça login.",
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Não foi possível conectar ao servidor.";
      return { success: false, message: errorMessage };
    }
  };

  // Busca dados do cliente
  const fetchClientData = useCallback(
    async (userId) => {
      const id = userId || user?.id;
      if (!id)
        return {
          success: false,
          message: "Usuário não autenticado ou ID ausente.",
        };

      try {
        const response = await api.get(`/cliente/${id}`);
        const clientData = response.data.data || response.data; // depende do seu backend

        setUser(clientData);
        localStorage.setItem("user", JSON.stringify(clientData));

        return { success: true, data: clientData };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Erro ao carregar dados do perfil.";
        return { success: false, message: errorMessage };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [user]
  );

  const updateClientData = async (updatedData) => {
    if (!isAuthenticated || !user?.id)
      return {
        success: false,
        message: "Usuário não autenticado ou ID ausente.",
      };

    try {
      await api.patch(`/cliente/${user.id}`, updatedData);
      await fetchClientData(user.id);
      return { success: true, message: "Dados atualizados com sucesso!" };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao atualizar dados.";
      return { success: false, message: errorMessage };
    }
  };
  // CRUD enderecos
  const addAddress = async (addressData) => {
    const clientId = user?.id || JSON.parse(localStorage.getItem("user"))?.id;
    if (!isAuthenticated || !clientId)
      return { success: false, message: "Usuário não autenticado." };

    try {
      await api.post("/cliente/endereco", {
        ...addressData,
        clienteId: clientId,
      });
      await fetchClientData(clientId);
      return { success: true, message: "Endereço adicionado com sucesso!" };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao salvar novo endereço.";
      return { success: false, message: errorMessage };
    }
  };

  const updateAddress = async (addressId, addressData) => {
    if (!isAuthenticated || !user?.id)
      return { success: false, message: "Usuário não autenticado." };
    try {
      await api.patch(`/cliente/endereco/${addressId}`, addressData);
      await fetchClientData(user.id);
      return { success: true, message: "Endereço atualizado com sucesso!" };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao atualizar endereço.";
      return { success: false, message: errorMessage };
    }
  };

  const deleteAddress = async (addressId) => {
    if (!isAuthenticated || !user?.id)
      return { success: false, message: "Usuário não autenticado." };
    try {
      await api.delete(`/cliente/endereco/${addressId}`);
      await fetchClientData(user.id);
      return { success: true, message: "Endereço removido com sucesso!" };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao remover endereço.";
      return { success: false, message: errorMessage };
    }
  };
  //produtos
  // LISTAR TODOS OS PRODUTOS
  const fetchAllProducts = async () => {
    try {
      const response = await api.get("/produto"); // sua rota backend que retorna todos os produtos
      return { success: true, data: response.data.data }; // ajuste dependendo do formato do backend
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar produtos.";
      return { success: false, message: errorMessage };
    }
  };

  // CRIAR OU ATUALIZAR PRODUTO
  const saveProduct = async (id, productData) => {
    try {
      if (id) {
        await api.patch(`/produto/${id}`, productData);
      } else {
        await api.post("/produto", productData);
      }
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao salvar produto.";
      return { success: false, message: errorMessage };
    }
  };

  // DELETAR PRODUTO
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/produto/${id}`);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao excluir produto.";
      return { success: false, message: errorMessage };
    }
  };
  //categorias
  //listar
  const fetchCategorias = async () => {
    try {
      const response = await api.get("/categoria"); // rota backend
      // Ajuste conforme o retorno da sua API: pode ser response.data.data ou response.data
      const categorias = response.data.data || response.data;
      return { success: true, data: categorias };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar categorias.";
      return { success: false, message: errorMessage };
    }
  };
  //salva
  const saveCategoria = async (categoriaData, id = null) => {
    try {
      if (id) {
        // Atualiza categoria existente
        await api.patch(`/categoria/${id}`, categoriaData);
      } else {
        // Cria nova categoria
        await api.post("/categoria", categoriaData);
      }
      return { success: true, message: "Categoria salva com sucesso!" };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao salvar categoria.";
      return { success: false, message: errorMessage };
    }
  };
  //deleta
  const deleteCategoria = async (id) => {
    try {
      await api.delete(`/categoria/${id}`);
      return { success: true, message: "Categoria excluída com sucesso!" };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao excluir categoria.";
      return { success: false, message: errorMessage };
    }
  };
  //clientes
  //busca
  const fetchClientes = async () => {
    try {
      const response = await api.get("/cliente");
      const clientes = response.data.data || response.data; // ajusta conforme backend
      console.log(clientes);
      return { success: true, data: clientes };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar clientes.";
      return { success: false, message: errorMessage };
    }
  };

  const saveCliente = async (id, clienteData) => {
    try {
      await api.patch(`/cliente/${id}`, clienteData);
      return { success: true, message: "Cliente atualizado com sucesso!" };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao salvar cliente.";
      return { success: false, message: errorMessage };
    }
  };
  //update role e ativo
  const updateClienteRoleAtivo = async (id, role, ativo) => {
    try {
      const response = await api.patch(`/cliente/${id}`, { role, ativo });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erro ao atualizar role/ativo do cliente:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao atualizar cliente.",
      };
    }
  };

  const deleteCliente = async (id) => {
    try {
      await api.patch(`/cliente/${id}`, { ativo: false });
      return { success: true, message: "Cliente desativado com sucesso!" };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao desativar cliente.";
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
        fetchAllProducts,
        saveProduct,
        deleteProduct,
        fetchCategorias,
        saveCategoria,
        deleteCategoria,
        fetchClientes,
        saveCliente,
        deleteCliente,
        updateClienteRoleAtivo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
