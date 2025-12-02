import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useParceiroRole = () => {
  const { user } = useAuth();
  const [isParceiroUser, setIsParceiroUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsParceiroUser(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "parceiro")
          .maybeSingle();

        if (error) {
          console.error("Erro ao verificar role:", error);
          setIsParceiroUser(false);
        } else {
          setIsParceiroUser(!!data);
        }
      } catch (error) {
        console.error("Erro ao verificar role:", error);
        setIsParceiroUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  return { isParceiroUser, loading };
};
