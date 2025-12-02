import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEntregadorRole } from "@/hooks/useEntregadorRole";
import { useAuth } from "@/contexts/AuthContext";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Save } from "lucide-react";
import { toast } from "sonner";
import {
  getDriver,
  createDriver,
  updateDriver,
  uploadDriverPhoto,
  DeliveryDriver,
} from "@/services/entregadorService";

const EntregadorPerfilPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEntregadorUser, loading: roleLoading } = useEntregadorRole();
  const [driver, setDriver] = useState<DeliveryDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [placa, setPlaca] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");

  useEffect(() => {
    if (roleLoading) return;

    if (!isEntregadorUser) {
      navigate("/");
      return;
    }

    if (user) {
      carregarPerfil();
    }
  }, [roleLoading, isEntregadorUser, user, navigate]);

  const carregarPerfil = async () => {
    if (!user) return;

    setLoading(true);
    const data = await getDriver(user.id);

    if (data) {
      setDriver(data);
      setNome(data.nome);
      setTelefone(data.telefone);
      setVeiculo(data.veiculo);
      setPlaca(data.placa || "");
      setFotoUrl(data.foto_url || "");
    }

    setLoading(false);
  };

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo: 5MB");
      return;
    }

    setUploading(true);
    const resultado = await uploadDriverPhoto(user.id, file);

    if (resultado.success && resultado.url) {
      setFotoUrl(resultado.url);
      toast.success("Foto enviada com sucesso!");
    } else {
      toast.error(resultado.error || "Erro ao enviar foto");
    }

    setUploading(false);
  };

  const handleSalvar = async () => {
    if (!user) return;

    if (!nome.trim() || !telefone.trim() || !veiculo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSaving(true);

    if (driver) {
      // Atualizar
      const resultado = await updateDriver(driver.id, {
        nome,
        telefone,
        veiculo,
        placa: placa || null,
        foto_url: fotoUrl || null,
      });

      if (resultado.success) {
        toast.success("Perfil atualizado!");
        await carregarPerfil();
      } else {
        toast.error(resultado.error || "Erro ao atualizar perfil");
      }
    } else {
      // Criar
      const resultado = await createDriver({
        user_id: user.id,
        nome,
        telefone,
        veiculo,
        placa,
        foto_url: fotoUrl,
      });

      if (resultado.success) {
        toast.success("Perfil criado com sucesso!");
        await carregarPerfil();
        navigate("/entregador");
      } else {
        toast.error(resultado.error || "Erro ao criar perfil");
      }
    }

    setSaving(false);
  };

  if (roleLoading || loading) {
    return (
      <BusqueiLayout>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </BusqueiLayout>
    );
  }

  return (
    <BusqueiLayout>
      <GradientHeader>
        {driver ? "Editar Perfil" : "Criar Perfil de Entregador"}
      </GradientHeader>

      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <div className="space-y-6">
          {/* Foto */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-32 h-32">
              {fotoUrl && <AvatarImage src={fotoUrl} />}
              <AvatarFallback className="text-4xl">
                {nome.charAt(0).toUpperCase() || "E"}
              </AvatarFallback>
            </Avatar>

            <div>
              <input
                type="file"
                id="foto-upload"
                accept="image/*"
                className="hidden"
                onChange={handleUploadFoto}
                disabled={uploading}
              />
              <Label htmlFor="foto-upload">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Enviando..." : "Alterar Foto"}
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          {/* Formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div>
              <Label htmlFor="veiculo">Veículo *</Label>
              <Select value={veiculo} onValueChange={setVeiculo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="bike">Bicicleta</SelectItem>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="a_pe">A pé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="placa">Placa do Veículo</Label>
              <Input
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="ABC-1234"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <Button onClick={handleSalvar} disabled={saving} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            {driver && (
              <Button
                variant="outline"
                onClick={() => navigate("/entregador")}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </Card>
    </BusqueiLayout>
  );
};

export default EntregadorPerfilPage;
