import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VipStatus {
  isActive: boolean;
  plano: string | null;
  dataFim: string | null;
}

export function useVipStatus() {
  const { user } = useAuth();
  const [vipStatus, setVipStatus] = useState<VipStatus>({
    isActive: false,
    plano: null,
    dataFim: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkVipStatus() {
      if (!user) {
        setVipStatus({ isActive: false, plano: null, dataFim: null });
        setLoading(false);
        return;
      }

      try {
        // Query vip_subscriptions table
        const { data, error } = await supabase
          .from("vip_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("ativo", true)
          .maybeSingle();

        if (error) {
          console.error("Erro ao verificar status VIP:", error);
          setVipStatus({ isActive: false, plano: null, dataFim: null });
          return;
        }

        if (data) {
          // Check if subscription is still valid
          const isValid =
            !data.data_fim || new Date(data.data_fim) > new Date();

          setVipStatus({
            isActive: isValid,
            plano: data.plano,
            dataFim: data.data_fim,
          });
        } else {
          setVipStatus({ isActive: false, plano: null, dataFim: null });
        }
      } catch (error) {
        console.error("Erro ao verificar status VIP:", error);
        setVipStatus({ isActive: false, plano: null, dataFim: null });
      } finally {
        setLoading(false);
      }
    }

    checkVipStatus();
  }, [user]);

  return { ...vipStatus, loading };
}
