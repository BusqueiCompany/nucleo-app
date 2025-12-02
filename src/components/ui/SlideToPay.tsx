import { useState, useRef, useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideToPayProps {
  onComplete: () => void;
  className?: string;
  disabled?: boolean;
}

const SlideToPay = ({ onComplete, className, disabled = false }: SlideToPayProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const threshold = 0.85; // 85% of the bar

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current || !buttonRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonWidth = buttonRef.current.offsetWidth;
      const maxPosition = containerRect.width - buttonWidth;

      let clientX: number;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
      } else {
        clientX = e.touches[0].clientX;
      }

      const newPosition = Math.max(
        0,
        Math.min(maxPosition, clientX - containerRect.left - buttonWidth / 2)
      );

      setPosition(newPosition);

      // Check if completed
      if (newPosition / maxPosition >= threshold && !isCompleted) {
        setIsCompleted(true);
        setIsDragging(false);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    };

    const handleMouseUp = () => {
      if (!isCompleted) {
        setPosition(0);
      }
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, isCompleted, onComplete]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-16 bg-white/80 backdrop-blur-md rounded-full shadow-lg overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Background gradient that fills as you slide */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-gradient-start to-gradient-end transition-all duration-300"
        style={{
          width: isCompleted ? "100%" : `${position + 64}px`,
          opacity: isCompleted ? 1 : 0.2,
        }}
      />

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-foreground font-semibold transition-opacity duration-300">
          {isCompleted ? "Processando..." : "Deslize para pagar"}
        </span>
      </div>

      {/* Draggable button */}
      <div
        ref={buttonRef}
        className={cn(
          "absolute left-1 top-1 w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-300",
          isDragging && "scale-110",
          isCompleted && "bg-gradient-to-r from-gradient-start to-gradient-end"
        )}
        style={{
          transform: `translateX(${position}px)`,
        }}
        onMouseDown={() => !isCompleted && !disabled && setIsDragging(true)}
        onTouchStart={() => !isCompleted && !disabled && setIsDragging(true)}
      >
        {isCompleted ? (
          <Check className="h-6 w-6 text-white" />
        ) : (
          <ArrowRight className="h-6 w-6 text-gradient-end" />
        )}
      </div>
    </div>
  );
};

export default SlideToPay;
