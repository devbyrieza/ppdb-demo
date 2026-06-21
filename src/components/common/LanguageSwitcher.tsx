"use client";

import { useEffect, useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "id", name: "Indonesia", flag: "🇮🇩" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ms", name: "Melayu", flag: "🇲🇾" },
  { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("id");

  useEffect(() => {
    // ─── Initialize Active Language from Cookie ───
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
      return null;
    };

        const cookieVal = getCookie("googtrans");
    let initialLang = "id";
    if (cookieVal) {
      const lang = cookieVal.split("/").pop();
      if (lang && LANGUAGES.some((l) => l.code === lang)) {
        initialLang = lang;
        setCurrentLang(lang);
      }
    }

    // ─── Prevent Native Auto-Translate but allow our widget ───
    const allowTranslation = () => {
      document.documentElement.removeAttribute("translate");
      document.documentElement.classList.remove("notranslate");
      document.body.classList.remove("notranslate");
      const meta = document.querySelector('meta[name="google"][content="notranslate"]');
      if (meta) meta.remove();
    };

    if (initialLang !== "id") {
      allowTranslation();
    }

    // ─── Initialize Google Translate ───
    const addGoogleTranslateScript = () => {
      if (document.getElementById("google-translate-script")) return;

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "id",
            includedLanguages: "en,ar,ms,zh-CN,id,fr,de,ja,ko",
            autoDisplay: false,
          },
          "google_translate_element",
        );
      };
    };

    addGoogleTranslateScript();

    // ─── Hide Google Translate UI elements (CSS Hack) ───
    const style = document.createElement("style");
    style.innerHTML = `
      /* Hide top banner frame */
      .goog-te-banner-frame, 
      .goog-te-banner-frame.skiptranslate,
      #goog-gt-tt, 
      .goog-te-balloon-frame { 
        display: none !important; 
      }
      
      /* Reset body position */
      body { 
        top: 0px !important; 
      }
      
      /* Hide native Google Translate combo/widget */
      #google_translate_element {
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
        visibility: hidden !important;
      }
      
      .goog-logo-link,
      .goog-te-gadget span {
        display: none !important;
      }
      
      /* Hide translation suggestion text highlights */
      .goog-text-highlight {
        background-color: transparent !important;
        box-shadow: none !important;
        box-sizing: border-box !important;
      }
      
      /* Hide dynamically injected google translation elements */
      .skiptranslate iframe,
      iframe[class*="goog-te-menu-frame"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Allow translation before triggering it
    document.documentElement.removeAttribute("translate");
    document.documentElement.classList.remove("notranslate");
    document.body.classList.remove("notranslate");
    const meta = document.querySelector('meta[name="google"][content="notranslate"]');
    if (meta) meta.remove();

    if (langCode === "id") {
      // Re-add preventions if returning to default
      document.documentElement.setAttribute("translate", "no");
      document.documentElement.classList.add("notranslate");
      if (!document.querySelector('meta[name="google"][content="notranslate"]')) {
        const newMeta = document.createElement('meta');
        newMeta.name = "google";
        newMeta.content = "notranslate";
        document.head.appendChild(newMeta);
      }
    }

    // 1. Set standard cookie paths
    const cookieDomain = window.location.hostname === "localhost" ? "" : `; domain=.${window.location.hostname.replace(/^www\./, "")}`;
    document.cookie = `googtrans=/id/${langCode}; path=/${cookieDomain}`;
    document.cookie = `googtrans=/id/${langCode}; path=/`;

    // 2. Trigger native select event if element exists
    const select = document.querySelector(
      ".goog-te-combo",
    ) as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    } else {
      // Fallback if not loaded yet
      window.location.reload();
    }
  };

  return (
    <div className="relative">
      {/* Hidden original element */}
      <div id="google_translate_element"></div>

      {/* Custom Premium UI */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-300 group"
      >
        <Globe className="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
        <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider hidden sm:block">
          {LANGUAGES.find((l) => l.code === currentLang)?.code}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[70] overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-slate-50 mb-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Pilih Bahasa
                </p>
              </div>
              <div className="space-y-0.5 max-h-[280px] overflow-y-auto pr-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                      currentLang === lang.code
                        ? "bg-primary-50 text-primary-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                    {currentLang === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}
