import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bem-vindo</CardTitle>
          <CardDescription>Escolha uma opção para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate("/auth/login")}
            className="w-full"
            size="lg"
          >
            Entrar
          </Button>
          <Button
            onClick={() => navigate("/auth/cadastro")}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Criar Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
