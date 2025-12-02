import { LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TabItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface BottomTabsProps {
  items: TabItem[];
}

const BottomTabs = ({ items }: BottomTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 transition-colors min-w-[60px]"
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    isActive ? "text-gradient-end" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-gradient-end" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-8 h-1 bg-gradient-end rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomTabs;
