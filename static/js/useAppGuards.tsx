import { useState, useRef, useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addListener, removeListener, launch } from "devtools-detector";

export const usePWAProtection = () => {
  const { t } = useTranslation();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const isInStandaloneMode = () => {
      const isStandaloneDisplay = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone =
        typeof navigator !== "undefined" && "standalone" in navigator && (navigator as any).standalone === true;

      return isStandaloneDisplay || isIOSStandalone;
    };

    const isNativeApp = (window as any).__IS_NATIVE_APP__ === true || Capacitor.getPlatform() === "android";

    if (!isNativeApp && !isInStandaloneMode()) {
      alert(t("modal.exit_app"));
      window.location.href = "https://comicloveu.com/";
    }
  }, []);
};

export const useDevtoolsBlocker = () => {
  const { t } = useTranslation();
  const hasBlockedRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const threshold = 160;
    let checkInterval: NodeJS.Timeout;

    const detectDevtools = () => {
      const start = new Date().getTime();
      debugger;
      const end = new Date().getTime();

      if (end - start > threshold) {
        triggerBlock();
      }
    };

    const triggerBlock = () => {
      if (!hasBlockedRef.current) {
        hasBlockedRef.current = true;
        alert(t("modal.devtools_blocked"));
        window.location.href = "https://comicloveu.com/";
      }
    };

    const checkByConsoleTiming = () => {
      const start = performance.now();
      console.log("%c", {
        get value() {
          const duration = performance.now() - start;
          if (duration > 100) {
            triggerBlock();
          }
          return "";
        },
      });
    };

    checkInterval = setInterval(() => {
      detectDevtools();
      checkByConsoleTiming();
    }, 2000); // 每 2 秒偵測一次

    return () => {
      clearInterval(checkInterval);
    };
  }, []);
};
interface ExitState {
  alert: boolean;
  message: string;
  confirm: boolean;
  id: string;
}

export const useBackButtonExit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [exit, setExit] = useState<ExitState>({
    alert: false,
    message: "",
    confirm: false,
    id: "",
  });

  const handleConfirmExit = () => {
    setExit((prev) => ({ ...prev, alert: false }));
    CapacitorApp.exitApp();
  };

  useEffect(() => {
    let backHandler: any;

    const setupBackHandler = async () => {
      backHandler = await CapacitorApp.addListener("backButton", () => {
        if (location.pathname !== "/") {
          navigate(-1);
        } else {
          setExit((prev) => ({
            ...prev,
            alert: true,
            message: t("modal.confirm_exit_app"),
          }));
        }
      });
    };

    setupBackHandler();

    return () => {
      if (backHandler) backHandler.remove();
    };
  }, [location, navigate]);

  return {
    exit,
    setExit,
    confirmExit: handleConfirmExit,
  };
};
