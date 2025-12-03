import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/auth";
import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import OnboardingPage from "./pages/onboarding/index";
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
import MapaClientePage from "./pages/cliente/mapa";
import EntregadorDashboardPage from "./pages/entregador/dashboard";
import EntregadorRotasPage from "./pages/entregador/rotas";
import EntregadorGanhosPage from "./pages/entregador/ganhos";
import EntregadorPerfilPage from "./pages/entregador/perfil";
import ParceiroDashboardPage from "./pages/parceiro/dashboard";
import ParceiroProdutosPage from "./pages/parceiro/produtos";
import ParceiroPedidosPage from "./pages/parceiro/pedidos";
import ParceiroAnalyticsPage from "./pages/parceiro/analytics";
import SuporteTicketsPage from "./pages/suporte/tickets";
import SuporteTicketDetalhePage from "./pages/suporte/ticket-detalhe";
import AdmDashboardPage from "./pages/adm/dashboard";
import AdmEstabelecimentosPage from "./pages/adm/estabelecimentos";
import AdmNotificacoesPage from "./pages/adm/notificacoes";
import AdmRotasPrioritariasPage from "./pages/adm/rotas-prioritarias";
import AdmMapaPage from "./pages/adm/mapa";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/cadastro" element={<Cadastro />} />
      <Route
        path="/cliente"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ClientePage />
            </OnboardingGuard>
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
        path="/cliente/mapa"
        element={
          <ProtectedRoute>
            <MapaClientePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entregador"
        element={
          <ProtectedRoute>
            <EntregadorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entregador/rotas"
        element={
          <ProtectedRoute>
            <EntregadorRotasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entregador/ganhos"
        element={
          <ProtectedRoute>
            <EntregadorGanhosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entregador/perfil"
        element={
          <ProtectedRoute>
            <EntregadorPerfilPage />
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
            <AdmDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adm/estabelecimentos"
        element={
          <ProtectedRoute>
            <AdmEstabelecimentosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adm/notificacoes"
        element={
          <ProtectedRoute>
            <AdmNotificacoesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adm/rotas-prioritarias"
        element={
          <ProtectedRoute>
            <AdmRotasPrioritariasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adm/mapa"
        element={
          <ProtectedRoute>
            <AdmMapaPage />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
