import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/auth";
import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import ClientePage from "./pages/cliente";
import MercadoPage from "./pages/cliente/mercado";
import CarrinhoPage from "./pages/cliente/carrinho";
import CheckoutPage from "./pages/cliente/checkout";
import ConfirmadoPage from "./pages/cliente/confirmado";
import TrackingPage from "./pages/cliente/tracking";
import ListaInteligentePage from "./pages/cliente/lista-inteligente";
import ListaInteligenteResultPage from "./pages/cliente/lista-inteligente-result";
import VIPPage from "./pages/cliente/vip";
import PerfilPage from "./pages/cliente/perfil";
import EntregadorPage from "./pages/entregador";
import ParceiroPage from "./pages/parceiro";
import SuportePage from "./pages/suporte";
import AdmPage from "./pages/adm";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/cadastro" element={<Cadastro />} />
      <Route
        path="/cliente"
        element={
          <ProtectedRoute>
            <ClientePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/mercado"
        element={
          <ProtectedRoute>
            <MercadoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/carrinho"
        element={
          <ProtectedRoute>
            <CarrinhoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/confirmado"
        element={
          <ProtectedRoute>
            <ConfirmadoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/tracking"
        element={
          <ProtectedRoute>
            <TrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/lista-inteligente"
        element={
          <ProtectedRoute>
            <ListaInteligentePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/lista-inteligente-result"
        element={
          <ProtectedRoute>
            <ListaInteligenteResultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/vip"
        element={
          <ProtectedRoute>
            <VIPPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/perfil"
        element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entregador"
        element={
          <ProtectedRoute>
            <EntregadorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parceiro"
        element={
          <ProtectedRoute>
            <ParceiroPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suporte"
        element={
          <ProtectedRoute>
            <SuportePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adm"
        element={
          <ProtectedRoute>
            <AdmPage />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
