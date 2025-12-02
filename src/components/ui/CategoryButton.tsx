import { LucideIcon } from "lucide-react";

interface CategoryButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

const CategoryButton = ({ icon: Icon, label, onClick }: CategoryButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95"
    >
      <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center">
        <Icon className="h-7 w-7 text-gradient-end" />
      </div>
      <span className="text-xs text-foreground/80 font-medium">{label}</span>
    </button>
  );
};

export default CategoryButton;
