import { useEffect, useState } from "react";

const DISMISS_KEY = "owl_tatame_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent;
  }
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");

  useEffect(() => {
    if (isStandalone()) return;

    // The event may have already fired (and been captured by the inline
    // script in index.html) before this component ever mounted.
    if (window.__deferredInstallPrompt) setDeferredPrompt(window.__deferredInstallPrompt);

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      window.__deferredInstallPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    if (isIos()) setIosHint(true);

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (dismissed || isStandalone() || (!deferredPrompt && !iosHint)) return null;

  return (
    <div className="w-full rounded-xl border border-primary/30 bg-primary/10 p-4 mb-6 animate-slide-up flex items-start gap-3">
      {deferredPrompt ? (
        <>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Instala la app en tu celular</p>
            <p className="text-sm text-muted mt-0.5">Acceso mas rapido para anotarte a tus clases.</p>
          </div>
          <button
            onClick={install}
            className="shrink-0 rounded-md bg-primary text-on-primary text-sm font-semibold px-3 py-2 min-h-[36px] cursor-pointer hover:bg-primary/90 transition-colors"
          >
            Instalar
          </button>
        </>
      ) : (
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Instala la app en tu iPhone</p>
          <p className="text-sm text-muted mt-0.5 flex flex-wrap items-center gap-1">
            Toca
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="inline shrink-0 text-primary">
              <path
                d="M12 3v12m0-12 4 4m-4-4-4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            y despues "Agregar a pantalla de inicio".
          </p>
        </div>
      )}
      <button
        onClick={dismiss}
        aria-label="Cerrar"
        className="shrink-0 rounded-md p-1 text-muted hover:text-foreground hover:bg-surface-alt cursor-pointer min-h-[32px] min-w-[32px]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
