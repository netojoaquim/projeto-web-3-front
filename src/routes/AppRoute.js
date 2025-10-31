import { Route, Routes } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import Categoria from "../pages/CategoriaForm";
import CreateProduct from "../pages/CreateProduct";
import DadosCliente from "../pages/DadosCliente";
import EnderecoCliente from "../pages/EnderecoForm";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ProdutoForm from "../pages/ProdutoForm";
import ClienteForm from "../pages/ClienteForm";
import CheckoutPage from "../pages/CheckoutPage";
import PedidosPage from "../pages/PedidoPage";
import Register from "../pages/Register";
import PrivateRoute from "./PrivateRoutes";
const AppRoute = () => {
  return (
    <Routes>
      {/*(Login, Register).*/}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/*logad*/}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />

      {/* protegida*/}
      <Route element={<PrivateRoute />}>
        <Route
          path="/checkout"
          element={<MainLayout>{<CheckoutPage />}</MainLayout>}
        />
        <Route
          path="/cliente/dados"
          element={<MainLayout>{<DadosCliente />}</MainLayout>}
        />
        <Route
          path="/cliente/enderecos"
          element={<MainLayout>{<EnderecoCliente />}</MainLayout>}
        />
        <Route
          path="/cliente/pedidos"
          element={<MainLayout>{<PedidosPage/>}</MainLayout>}
        />
        <Route
          path="/produto"
          element={<MainLayout>{<ProdutoForm />}</MainLayout>}
        />
        
      </Route>

      <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
        <Route
          path="/produto/novo"
          element={<MainLayout>{<CreateProduct />}</MainLayout>}
        />
        <Route
          path="produto/categoria"
          element={<MainLayout>{<Categoria />}</MainLayout>}
        />
        <Route
          path="cliente"
          element={<MainLayout>{<ClienteForm />}</MainLayout>}
        />
      </Route>

      {/* Not Found */}
      <Route path="*" element={<div>404 - Página não encontrada</div>} />
    </Routes>
  );
};
export default AppRoute;
