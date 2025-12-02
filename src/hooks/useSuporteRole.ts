import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useSuporteRole = () => {
  const { user } = useAuth();
  const [isSuporteUser, setIsSuporteUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsSuporteUser(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "suporte")
          .maybeSingle();

        if (error) {
          console.error("Erro ao verificar role:", error);
          setIsSuporteUser(false);
        } else {
          setIsSuporteUser(!!data);
        }
      } catch (error) {
        console.error("Erro ao verificar role:", error);
        setIsSuporteUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  return { isSuporteUser, loading };
};
