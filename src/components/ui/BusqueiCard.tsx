import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BusqueiCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "gradient";
}

const BusqueiCard = ({ children, className, variant = "default" }: BusqueiCardProps) => {
  const baseClasses = "backdrop-blur-md rounded-2xl shadow-lg border p-4";
  
  const variantClasses = {
    default: "bg-white/95 border-border/50",
    dark: "bg-card/95 border-border/50",
    gradient: "busquei-gradient border-primary/20 text-white",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </div>
  );
};

export default BusqueiCard;
