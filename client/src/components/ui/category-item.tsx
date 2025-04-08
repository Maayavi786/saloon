import { useLanguage } from "@/hooks/use-language";
import { 
  Slice, Scissors, Sparkles, Bath, 
  ThumbsUp, Heart, Star, Brush 
} from "lucide-react";

interface CategoryItemProps {
  category: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function CategoryItem({ category, isActive = false, onClick }: CategoryItemProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  
  // Map category to icon and translations
  const getCategoryDetails = () => {
    switch (category) {
      case "haircut":
        return { 
          icon: <Scissors className={`${isActive ? "text-white" : "text-primary"}`} />, 
          label: isArabic ? "قص الشعر" : "Haircut" 
        };
      case "makeup":
        return { 
          icon: <Brush className={`${isActive ? "text-white" : "text-secondary"}`} />, 
          label: isArabic ? "مكياج" : "Makeup" 
        };
      case "spa":
        return { 
          icon: <Bath className={`${isActive ? "text-white" : "text-accent"}`} />, 
          label: isArabic ? "سبا" : "Bath" 
        };
      case "nails":
        return { 
          icon: <Sparkles className={`${isActive ? "text-white" : "text-primary"}`} />, 
          label: isArabic ? "أظافر" : "Nails" 
        };
      case "coloring":
        return { 
          icon: <Brush className={`${isActive ? "text-white" : "text-secondary"}`} />, 
          label: isArabic ? "صبغة وتلوين" : "Hair Color" 
        };
      case "skin":
        return { 
          icon: <ThumbsUp className={`${isActive ? "text-white" : "text-accent"}`} />, 
          label: isArabic ? "عناية بالبشرة" : "Skin Care" 
        };
      case "all":
        return { 
          icon: <Star className={`${isActive ? "text-white" : "text-primary"}`} />, 
          label: isArabic ? "الكل" : "All" 
        };
      default:
        return { 
          icon: <Heart className={`${isActive ? "text-white" : "text-primary"}`} />, 
          label: category 
        };
    }
  };
  
  const { icon, label } = getCategoryDetails();
  
  // Use for grid display (home page)
  if (!onClick) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          {icon}
        </div>
        <span className="text-sm text-center">{label}</span>
      </div>
    );
  }
  
  // Use for filters (salon details page)
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap ${
        isActive 
          ? "bg-primary text-white" 
          : "bg-white border border-neutral-200"
      } px-4 py-2 rounded-lg text-sm`}
    >
      {label}
    </button>
  );
}
