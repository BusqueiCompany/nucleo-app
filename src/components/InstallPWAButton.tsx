import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Verificar se usuário já rejeitou a instalação
    const installDismissed = localStorage.getItem('pwa_install_dismissed');
    if (installDismissed === 'true') {
      return;
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listener para verificar se o app foi instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();

    // Aguardar a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('Usuário aceitou instalar o PWA');
    } else {
      console.log('Usuário rejeitou a instalação');
    }

    // Resetar o prompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (isInstalled || !showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in md:left-auto md:right-6 md:max-w-sm">
      <div className="busquei-card p-4 shadow-2xl border-2 border-primary/20">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
          aria-label="Fechar"
        >
          <X className="h-3 w-3" />
        </button>
        
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 busquei-gradient rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-white">B</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-sm">Instalar Busquei</h3>
            <p className="text-xs text-muted-foreground">
              Acesse mais rápido e receba notificações
            </p>
          </div>
        </div>

        <Button
          onClick={handleInstallClick}
          className="w-full busquei-button h-10 text-sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Instalar App
        </Button>
      </div>
    </div>
  );
};

export default InstallPWAButton;
