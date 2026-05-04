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
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("id");

  useEffect(() => {
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
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
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
      .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
      body { top: 0px !important; }
      .goog-te-gadget-simple { 
        background-color: transparent !important; 
        border: none !important;
        font-size: 0 !important;
      }
      .goog-te-menu-value { display: none !important; }
      #google_translate_element { display: none; }
      .goog-te-menu-frame { box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; border: none !important; border-radius: 12px !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const changeLanguage = (langCode: string) => {
    const select = document.querySelector(
      ".goog-te-combo",
    ) as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
      setCurrentLang(langCode);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Hidden original element */}
      <div id="google_translate_element"></div>

      {/* Custom Premium UI */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/30 transition-all duration-300 group"
      >
        <Globe className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
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
              <div className="space-y-0.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                      currentLang === lang.code
                        ? "bg-teal-50 text-teal-700 font-bold"
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
              <div className="mt-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => {
                    const el = document.querySelector(
                      ".goog-te-gadget-simple",
                    ) as HTMLElement;
                    if (el) el.click();
                    setIsOpen(false);
                  }}
                  className="w-full text-center py-2 text-[10px] font-bold text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest"
                >
                  Bahasa Lainnya...
                </button>
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
