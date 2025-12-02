import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import { Check } from "lucide-react";

const ConfirmadoPage = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BusqueiLayout>
      {/* Confetti animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fade-in"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10%",
                animation: `confetti-fall ${2 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              <span
                className="text-2xl"
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`,
                  display: "inline-block",
                }}
              >
                {["🎉", "✨", "🎊", "⭐", "💫"][Math.floor(Math.random() * 5)]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* Success icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-gradient-start to-gradient-end rounded-full flex items-center justify-center mb-6 shadow-lg animate-scale-in">
          <Check className="h-12 w-12 text-white" strokeWidth={3} />
        </div>

        {/* Success message */}
        <h1 className="text-3xl font-bold text-foreground mb-4 animate-fade-in">
          Pagamento confirmado!
        </h1>

        <p className="text-lg text-muted-foreground mb-8 animate-fade-in">
          Seu pedido foi realizado com sucesso
        </p>

        {/* Delivery time */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-8 w-full max-w-md animate-fade-in">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Tempo estimado de entrega
          </h3>
          <p className="text-2xl font-bold text-gradient-end">25 - 35 min</p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 w-full max-w-md animate-fade-in">
          <button
            onClick={() => navigate("/cliente/tracking")}
            className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-[1.5rem] py-4 shadow-lg hover:shadow-xl transition-shadow font-semibold"
          >
            Acompanhar pedido
          </button>
          <button
            onClick={() => navigate("/cliente")}
            className="w-full bg-white/80 text-foreground rounded-[1.5rem] py-3 shadow-sm hover:shadow-md transition-shadow font-medium"
          >
            Voltar para início
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </BusqueiLayout>
  );
};

export default ConfirmadoPage;
