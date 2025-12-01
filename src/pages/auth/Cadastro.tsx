import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Cadastro = () => {
  const navigate = useNavigate();
  const { registerUser, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    data_nascimento: "",
    cpf: "",
    cep: "",
    rua: "",
    bairro: "",
    numero: "",
    email: "",
    telefone: "",
    password: "",
    aceita_campanhas: false,
    aceita_termos: false,
  });
  const [idade, setIdade] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate("/cliente");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (formData.data_nascimento) {
      const birthDate = new Date(formData.data_nascimento);
      const today = new Date();
      const calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setIdade(calculatedAge - 1);
      } else {
        setIdade(calculatedAge);
      }
    } else {
      setIdade(null);
    }
  }, [formData.data_nascimento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.aceita_termos) {
      alert("Você precisa aceitar os termos para continuar");
      return;
    }

    setIsLoading(true);

    const { error } = await registerUser(formData.email, formData.password, {
      nome: formData.nome,
      data_nascimento: formData.data_nascimento,
      cpf: formData.cpf || undefined,
      cep: formData.cep,
      rua: formData.rua,
      bairro: formData.bairro,
      numero: formData.numero,
      email: formData.email,
      telefone: formData.telefone,
      aceita_campanhas: formData.aceita_campanhas,
    });

    setIsLoading(false);

    if (!error) {
      navigate("/auth/login");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>Preencha seus dados para criar uma conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  name="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                  required
                />
                {idade !== null && (
                  <p className="text-sm text-muted-foreground">{idade} anos</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (Opcional)</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  name="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  name="rua"
                  value={formData.rua}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="aceita_campanhas"
                name="aceita_campanhas"
                checked={formData.aceita_campanhas}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, aceita_campanhas: checked as boolean }))
                }
              />
              <Label htmlFor="aceita_campanhas" className="text-sm font-normal cursor-pointer">
                Aceito receber promoções e cupons por email
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="aceita_termos"
                name="aceita_termos"
                checked={formData.aceita_termos}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, aceita_termos: checked as boolean }))
                }
              />
              <Label htmlFor="aceita_termos" className="text-sm font-normal cursor-pointer">
                Aceito os termos e condições do aplicativo *
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/auth/login")}
              >
                Já tem conta? Fazer login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cadastro;