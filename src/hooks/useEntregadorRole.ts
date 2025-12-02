import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useEntregadorRole = () => {
  const { user } = useAuth();
  const [isEntregadorUser, setIsEntregadorUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsEntregadorUser(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "entregador")
          .maybeSingle();

        if (error) {
          console.error("Erro ao verificar role:", error);
          setIsEntregadorUser(false);
        } else {
          setIsEntregadorUser(!!data);
        }
      } catch (error) {
        console.error("Erro ao verificar role:", error);
        setIsEntregadorUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  return { isEntregadorUser, loading };
};
