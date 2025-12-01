import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/auth";
import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import ClientePage from "./pages/cliente";
import EntregadorPage from "./pages/entregador";
import ParceiroPage from "./pages/parceiro";
import SuportePage from "./pages/suporte";
import AdmPage from "./pages/adm";
import NotFound from "./pages/NotFound";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/cadastro" element={<Cadastro />} />
      <Route path="/cliente" element={<ClientePage />} />
      <Route path="/entregador" element={<EntregadorPage />} />
      <Route path="/parceiro" element={<ParceiroPage />} />
      <Route path="/suporte" element={<SuportePage />} />
      <Route path="/adm" element={<AdmPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
