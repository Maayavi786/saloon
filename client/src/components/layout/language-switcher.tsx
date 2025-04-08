import { useLanguage } from "@/hooks/use-language";

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <div className="fixed top-4 left-4 z-50 bg-white rounded-full shadow-md">
      <button 
        onClick={toggleLanguage}
        className="flex items-center justify-center w-10 h-10 text-primary"
      >
        <span className="text-sm font-medium">
          {language === "ar" ? "EN" : "عربي"}
        </span>
      </button>
    </div>
  );
}
