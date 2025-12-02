import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const SearchBar = ({ placeholder = "Buscar...", value, onChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-white/60 backdrop-blur-md border-0 rounded-[1.5rem] pl-12 pr-4 py-6 text-base placeholder:text-muted-foreground/60 shadow-sm focus-visible:ring-gradient-end"
      />
    </div>
  );
};

export default SearchBar;
