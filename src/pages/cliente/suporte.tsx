import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { 
  ArrowLeft, 
  MessageCircle, 
  Upload, 
  Send,
  Home,
  ShoppingCart,
  User,
  ClipboardList,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  criarTicket,
  listarTickets,
  uploadImagemSuporte,
  Ticket,
  CategoriasSupporte,
  PrioridadeTicket,
  CATEGORIAS_LABELS,
  STATUS_LABELS,
} from "@/services/suporteService";
import { z } from "zod";

const ticketSchema = z.object({
  categoria: z.string().min(1, "Selecione uma categoria"),
  titulo: z
    .string()
    .min(5, "Título deve ter no mínimo 5 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  descricao: z
    .string()
    .min(20, "Descrição deve ter no mínimo 20 caracteres")
    .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
  prioridade: z.string(),
});

const SuportePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [categoria, setCategoria] = useState<string>("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState<string>("normal");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await listarTickets(user.id);
      setTickets(data);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
      toast.error("Erro ao carregar tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }

    setImagemFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    try {
      // Validate form
      const formData = {
        categoria,
        titulo,
        descricao,
        prioridade,
      };

      ticketSchema.parse(formData);

      setSubmitting(true);

      let imagemUrl: string | undefined = undefined;

      // Upload image if selected
      if (imagemFile) {
        setUploading(true);
        const uploadResult = await uploadImagemSuporte(user.id, imagemFile);
        setUploading(false);

        if (!uploadResult.success) {
          toast.error(uploadResult.error || "Erro ao fazer upload da imagem");
          return;
        }

        imagemUrl = uploadResult.url;
      }

      // Create ticket
      const result = await criarTicket({
        userId: user.id,
        categoria: categoria as CategoriasSupporte,
        titulo,
        descricao,
        prioridade: prioridade as PrioridadeTicket,
        imagemUrl,
      });

      if (result.success) {
        toast.success("Ticket criado com sucesso!");
        
        // Reset form
        setCategoria("");
        setTitulo("");
        setDescricao("");
        setPrioridade("normal");
        setImagemFile(null);
        setImagemPreview(null);

        // Refresh tickets list
        fetchTickets();
      } else {
        toast.error(result.error || "Erro ao criar ticket");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Erro ao criar ticket:", error);
        toast.error("Erro ao criar ticket");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "em_andamento":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "resolvido":
        return "bg-green-100 text-green-700 border-green-200";
      case "fechado":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      <BusqueiLayout>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Suporte</h1>
          </div>
        </div>

        {/* New Ticket Form */}
        <Card className="bg-white/80 backdrop-blur-md shadow-md mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Abrir Novo Ticket
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Categoria *
                </label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {Object.entries(CATEGORIAS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Título *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Problema com entrega"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  maxLength={100}
                  className="bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Descrição *
                </label>
                <Textarea
                  placeholder="Descreva seu problema em detalhes..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  maxLength={1000}
                  rows={6}
                  className="bg-white resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {descricao.length}/1000 caracteres
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Prioridade
                </label>
                <Select value={prioridade} onValueChange={setPrioridade}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Imagem (opcional)
                </label>
                <div className="flex flex-col gap-3">
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-white"
                  >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {imagemFile ? imagemFile.name : "Selecionar imagem"}
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {imagemPreview && (
                    <img
                      src={imagemPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || uploading}
                className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-xl"
              >
                {submitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Ticket
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Meus Tickets
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-md shadow-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Você ainda não tem nenhum ticket
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 mb-6">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                onClick={() => navigate(`/cliente/suporte/${ticket.id}`)}
                className="bg-white/80 backdrop-blur-md shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground flex-1">
                      {ticket.titulo}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {ticket.descricao}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{CATEGORIAS_LABELS[ticket.categoria]}</span>
                    <span>
                      {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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

export default SuportePage;
