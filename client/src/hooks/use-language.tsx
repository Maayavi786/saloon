import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check if language is stored in localStorage
    const storedLanguage = localStorage.getItem("language") as Language;
    return storedLanguage || "ar";
  });

  // Compute if the current language is RTL
  const isRTL = language === "ar";

  useEffect(() => {
    // Update the HTML lang and dir attributes when language changes
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    
    // Store the language preference in localStorage
    localStorage.setItem("language", language);
  }, [language, isRTL]);

  // Function to toggle between Arabic and English
  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === "ar" ? "en" : "ar"));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
