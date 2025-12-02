import { ReactNode } from "react";

interface BusqueiLayoutProps {
  children: ReactNode;
}

const BusqueiLayout = ({ children }: BusqueiLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gradient-start to-gradient-end">
      <div className="container mx-auto px-4 pt-6 pb-20">
        <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-6 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BusqueiLayout;
