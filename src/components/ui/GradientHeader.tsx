import { ReactNode } from "react";

interface GradientHeaderProps {
  children: ReactNode;
}

const GradientHeader = ({ children }: GradientHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-gradient-start to-gradient-end rounded-[1.5rem] p-6 mb-6 shadow-sm">
      <h1 className="text-2xl font-bold text-white">{children}</h1>
    </div>
  );
};

export default GradientHeader;
