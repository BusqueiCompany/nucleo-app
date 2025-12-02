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
import ClienteSuportePage from "./pages/cliente/suporte";
import SuporteDetalhePage from "./pages/cliente/suporte-detalhe";
import EntregadorPage from "./pages/entregador";
import ParceiroDashboardPage from "./pages/parceiro/dashboard";
import ParceiroProdutosPage from "./pages/parceiro/produtos";
import ParceiroPedidosPage from "./pages/parceiro/pedidos";
import ParceiroAnalyticsPage from "./pages/parceiro/analytics";
import SuporteTicketsPage from "./pages/suporte/tickets";
import SuporteTicketDetalhePage from "./pages/suporte/ticket-detalhe";
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
        path="/cliente/suporte"
        element={
          <ProtectedRoute>
            <ClienteSuportePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/suporte/:ticketId"
        element={
          <ProtectedRoute>
            <SuporteDetalhePage />
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
            <ParceiroDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parceiro/produtos"
        element={
          <ProtectedRoute>
            <ParceiroProdutosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parceiro/pedidos"
        element={
          <ProtectedRoute>
            <ParceiroPedidosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parceiro/analytics"
        element={
          <ProtectedRoute>
            <ParceiroAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parceiro/promocoes"
        element={
          <ProtectedRoute>
            <ParceiroDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suporte"
        element={
          <ProtectedRoute>
            <SuporteTicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suporte/ticket-detalhe"
        element={
          <ProtectedRoute>
            <SuporteTicketDetalhePage />
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
