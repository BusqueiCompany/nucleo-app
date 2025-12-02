import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdmRole = () => {
  const { user } = useAuth();
  const [isAdmUser, setIsAdmUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsAdmUser(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) {
          console.error("Erro ao verificar role:", error);
          setIsAdmUser(false);
        } else {
          setIsAdmUser(!!data);
        }
      } catch (error) {
        console.error("Erro ao verificar role:", error);
        setIsAdmUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  return { isAdmUser, loading };
};
