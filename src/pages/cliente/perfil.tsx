import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { 
  User, 
  MapPin, 
  Crown, 
  Camera, 
  Edit, 
  Key, 
  MessageCircle, 
  History as HistoryIcon,
  LogOut,
  Home,
  ShoppingCart,
  ClipboardList
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useVipStatus } from "@/hooks/useVipStatus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetails {
  nome: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  idade_calculada: number | null;
  cpf: string | null;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  foto_url: string | null;
}

const PerfilPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isActive: isVIP, plano } = useVipStatus();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  const fetchUserDetails = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_details")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserDetails(data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      toast.error("Erro ao carregar dados do perfil");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    try {
      setUploading(true);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      // Update user_details with new photo URL
      const { error: updateError } = await supabase
        .from("user_details")
        .update({ foto_url: urlData.publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast.success("Foto atualizada com sucesso!");
      fetchUserDetails();
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error("Erro ao atualizar foto");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso");
      navigate("/auth/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  if (loading) {
    return (
      <>
        <BusqueiLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </BusqueiLayout>
        <BottomTabs
          items={[
            { icon: Home, label: "Início", path: "/cliente" },
            { icon: ShoppingCart, label: "Carrinho", path: "/cliente/carrinho" },
            { icon: ClipboardList, label: "Pedidos", path: "/cliente/tracking" },
            { icon: User, label: "Perfil", path: "/cliente/perfil" },
          ]}
        />
      </>
    );
  }

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <BusqueiLayout>
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-gradient-start to-gradient-end rounded-[1.5rem] p-6 mb-6 shadow-lg">
          <h1 className="text-2xl font-bold text-white text-center">
            Meu Perfil
          </h1>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={userDetails?.foto_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-gradient-start to-gradient-end text-white text-2xl font-bold">
                {userDetails?.nome ? getInitials(userDetails.nome) : "U"}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-gradient-start to-gradient-end rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
            >
              <Camera className="h-4 w-4 text-white" />
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          {uploading && (
            <p className="text-sm text-muted-foreground mt-2">
              Enviando foto...
            </p>
          )}
        </div>

        {/* Personal Information */}
        <Card className="bg-white/80 backdrop-blur-md shadow-md mb-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Informações Pessoais
              </h2>
              <button className="text-primary hover:text-primary/80 transition-colors">
                <Edit className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nome completo</p>
                <p className="text-foreground font-medium">
                  {userDetails?.nome || "Não informado"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Data de nascimento
                  </p>
                  <p className="text-foreground font-medium">
                    {userDetails?.data_nascimento
                      ? new Date(userDetails.data_nascimento).toLocaleDateString(
                          "pt-BR"
                        )
                      : "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Idade</p>
                  <p className="text-foreground font-medium">
                    {userDetails?.idade_calculada
                      ? `${userDetails.idade_calculada} anos`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                <p className="text-foreground font-medium">
                  {userDetails?.telefone || "Não informado"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-foreground font-medium">
                  {userDetails?.email || user?.email || "Não informado"}
                </p>
              </div>

              {userDetails?.cpf && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">CPF</p>
                  <p className="text-foreground font-medium">{userDetails.cpf}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* VIP Status */}
        <Card className="bg-white/80 backdrop-blur-md shadow-md mb-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isVIP
                      ? "bg-gradient-to-br from-amber-400 to-amber-600"
                      : "bg-muted"
                  }`}
                >
                  <Crown
                    className={`h-6 w-6 ${isVIP ? "text-white" : "text-muted-foreground"}`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {isVIP ? "Membro VIP" : "Membro Gratuito"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isVIP ? `Plano ${plano}` : "Aproveite benefícios exclusivos"}
                  </p>
                </div>
              </div>
              {!isVIP && (
                <button
                  onClick={() => navigate("/cliente/vip")}
                  className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow"
                >
                  Assinar
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="bg-white/80 backdrop-blur-md shadow-md mb-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Endereço de Entrega
                </h2>
              </div>
              <button className="text-primary hover:text-primary/80 transition-colors">
                <Edit className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-foreground">
                {userDetails?.rua}, {userDetails?.numero}
              </p>
              <p className="text-foreground">{userDetails?.bairro}</p>
              <p className="text-muted-foreground text-sm">
                CEP: {userDetails?.cep}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-md shadow-md mb-4">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Ações Rápidas
            </h2>

            <div className="space-y-2">
              <button
                onClick={() => toast.info("Em breve: Alterar senha")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <Key className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground font-medium">Alterar senha</span>
              </button>

              <button
                onClick={() => navigate("/cliente/suporte")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground font-medium">Suporte</span>
              </button>

              <button
                onClick={() => toast.info("Em breve: Histórico")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <HistoryIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground font-medium">Histórico</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="h-5 w-5 text-destructive" />
                <span className="text-destructive font-medium">Sair</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </BusqueiLayout>

      <BottomTabs
        items={[
          { icon: Home, label: "Início", path: "/cliente" },
          { icon: ShoppingCart, label: "Carrinho", path: "/cliente/carrinho" },
          { icon: ClipboardList, label: "Pedidos", path: "/cliente/tracking" },
          { icon: User, label: "Perfil", path: "/cliente/perfil" },
        ]}
      />
    </>
  );
};

export default PerfilPage;
