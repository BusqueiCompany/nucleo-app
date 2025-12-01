import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserDetails {
  nome: string;
  data_nascimento: string;
  cpf?: string;
  cep: string;
  rua: string;
  bairro: string;
  numero: string;
  email: string;
  telefone: string;
  aceita_campanhas: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  loginGoogle: () => Promise<{ error: any }>;
  logout: () => Promise<void>;
  registerUser: (email: string, password: string, details: UserDetails) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message,
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message,
      });
      return { error };
    }
  };

  const loginGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login com Google",
          description: error.message,
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login com Google",
        description: error.message,
      });
      return { error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer logout",
          description: error.message,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      });
    }
  };

  const registerUser = async (email: string, password: string, details: UserDetails) => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: signUpError.message,
        });
        return { error: signUpError };
      }

      if (authData.user) {
        // Calculate age
        const birthDate = new Date(details.data_nascimento);
        const today = new Date();
        const idade = today.getFullYear() - birthDate.getFullYear();

        const { error: insertError } = await supabase
          .from("user_details")
          .insert({
            user_id: authData.user.id,
            nome: details.nome,
            data_nascimento: details.data_nascimento,
            idade_calculada: idade,
            cpf: details.cpf || null,
            cep: details.cep,
            rua: details.rua,
            bairro: details.bairro,
            numero: details.numero,
            email: details.email,
            telefone: details.telefone,
            aceita_campanhas: details.aceita_campanhas,
          });

        if (insertError) {
          toast({
            variant: "destructive",
            title: "Erro ao salvar dados",
            description: insertError.message,
          });
          return { error: insertError };
        }

        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode fazer login.",
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message,
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    login,
    loginGoogle,
    logout,
    registerUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};