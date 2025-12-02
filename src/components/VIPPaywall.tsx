import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VIPPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

const VIPPaywall = ({ isOpen, onClose, feature }: VIPPaywallProps) => {
  const navigate = useNavigate();

  const handleAssinar = () => {
    onClose();
    navigate("/cliente/vip");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-300 sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Crown className="h-10 w-10 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Recurso VIP 👑
          </DialogTitle>
          <DialogDescription className="text-center text-base text-foreground pt-2">
            <span className="font-semibold">{feature}</span> é um recurso
            exclusivo para membros VIP do Clube Busquei.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <h4 className="font-semibold text-foreground mb-2">
              Com o VIP você ganha:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                Comparação automática de preços
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                Sugestão de itens similares mais baratos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                Alertas exclusivos de ofertas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                Economia de até R$ 600/ano
              </li>
            </ul>
          </div>

          <button
            onClick={handleAssinar}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl py-3 font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
          >
            <Crown className="h-5 w-5" />
            Ver Planos VIP
          </button>

          <button
            onClick={onClose}
            className="w-full bg-white text-muted-foreground rounded-xl py-2 font-medium hover:bg-gray-50 transition-colors"
          >
            Agora não
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VIPPaywall;
