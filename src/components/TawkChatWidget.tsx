import { useEffect } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

declare global {
  interface Window {
    Tawk_API?: {
      visitor?: {
        name?: string;
        email?: string;
      };
      maximize?: () => void;
      setAttributes?: (
        attributes: Record<string, string>,
        callback?: (error?: unknown) => void,
      ) => void;
    };
    Tawk_LoadStart?: Date;
  }
}

const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID?.trim() ?? "";
const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID?.trim() ?? "";

export const isTawkConfigured = propertyId !== "" && widgetId !== "";

const TawkChatWidget = () => {
  const { user } = useCustomerAuth();

  useEffect(() => {
    if (!isTawkConfigured) {
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const existing = document.querySelector('script[data-tawk="asafo-tech"]');
    if (existing) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    script.setAttribute("data-tawk", "asafo-tech");
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  useEffect(() => {
    if (!isTawkConfigured || !user) {
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.visitor = {
      name: user.fullName,
      email: user.email,
    };

    window.Tawk_API.setAttributes?.({
      name: user.fullName,
      email: user.email,
    });
  }, [user]);

  return null;
};

export default TawkChatWidget;
