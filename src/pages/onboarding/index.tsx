import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import slide1Image from "@/assets/onboarding-slide1.png";
import slide2Image from "@/assets/onboarding-slide2.png";
import slide3Image from "@/assets/onboarding-slide3.png";

const OnboardingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Economia Inteligente",
      description: "Compare preços automaticamente e economize no seu mercado.",
      image: slide1Image,
    },
    {
      title: "Praticidade Total",
      description: "Peça tudo em um só lugar: mercados, padarias, bebidas, farmácias, petshops.",
      image: slide2Image,
    },
    {
      title: "Entrega Rápida",
      description: "Entregadores avaliados com rotas otimizadas em tempo real.",
      image: slide3Image,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-gradient-end flex flex-col relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48" />
      
      {/* Skip button */}
      <div className="container mx-auto px-6 pt-6 relative z-10">
        <button
          onClick={handleSkip}
          className="ml-auto block text-white/80 hover:text-white transition-colors text-sm font-medium"
        >
          Pular
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 relative z-10">
        {/* Image */}
        <div 
          key={currentSlide}
          className="w-full max-w-sm mb-12 animate-fade-in"
        >
          <img 
            src={slide.image} 
            alt={slide.title}
            className="w-full h-auto drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <h1 
          key={`title-${currentSlide}`}
          className="text-3xl md:text-4xl font-bold text-white text-center mb-4 animate-fade-in px-4"
        >
          {slide.title}
        </h1>

        {/* Description */}
        <p 
          key={`desc-${currentSlide}`}
          className="text-lg text-white/90 text-center max-w-md mb-12 animate-fade-in px-4"
        >
          {slide.description}
        </p>

        {/* Dots indicator */}
        <div className="flex gap-2 mb-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm px-4">
          {currentSlide < slides.length - 1 ? (
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full bg-white hover:bg-white/90 text-primary rounded-2xl h-14 text-lg font-semibold shadow-2xl"
            >
              Avançar
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full bg-white hover:bg-white/90 text-primary rounded-2xl h-14 text-lg font-semibold shadow-2xl"
            >
              Começar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
