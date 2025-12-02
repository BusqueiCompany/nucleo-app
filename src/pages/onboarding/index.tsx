import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ShoppingBag, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const OnboardingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      icon: ShoppingBag,
      title: "Encontre tudo que precisa",
      description: "Produtos de mercados, farmácias, petshops e muito mais em um só lugar",
      color: "from-primary to-gradient-end",
    },
    {
      icon: Zap,
      title: "Economia inteligente",
      description: "Compare preços automaticamente e economize em cada compra com ofertas exclusivas",
      color: "from-secondary to-blue-600",
    },
    {
      icon: Brain,
      title: "Lista inteligente",
      description: "Crie listas de compras com IA e receba sugestões personalizadas para você",
      color: "from-vip to-amber-500",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    navigate("/auth");
  };

  const handleGetStarted = () => {
    localStorage.setItem("onboarding_completed", "true");
    navigate("/auth");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      {/* Skip button */}
      <div className="container mx-auto px-6 pt-6">
        <button
          onClick={handleSkip}
          className="ml-auto block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          Pular
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Icon */}
        <div
          className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-2xl animate-scale-in`}
        >
          <Icon className="w-16 h-16 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground text-center mb-4 animate-fade-in">
          {slide.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground text-center max-w-md mb-12 animate-fade-in">
          {slide.description}
        </p>

        {/* Dots indicator */}
        <div className="flex gap-2 mb-12">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        {currentSlide < slides.length - 1 ? (
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full max-w-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-14 text-lg font-semibold shadow-lg"
          >
            Continuar
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <div className="w-full max-w-sm space-y-3">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-14 text-lg font-semibold shadow-lg"
            >
              Começar agora
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
