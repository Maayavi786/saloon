import { useLanguage } from "@/hooks/use-language";
import { Staff } from "@shared/schema";
import { Star } from "lucide-react";

interface StaffCardProps {
  staff: Staff;
  onClick?: (staff: Staff) => void;
}

export function StaffCard({ staff, onClick }: StaffCardProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  
  const handleClick = () => {
    if (onClick) onClick(staff);
  };
  
  return (
    <div 
      className="bg-white rounded-xl border border-neutral-200 p-3 mb-3 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-3 flex-shrink-0">
          <img 
            src={staff.image || "https://i.pravatar.cc/100"} 
            alt={isArabic ? staff.name : staff.nameEn || staff.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-bold mb-1">
              {isArabic ? staff.name : staff.nameEn || staff.name}
            </h3>
            {staff.rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className={`${isArabic ? "mr-1" : "ml-1"}`}>{staff.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="text-sm text-neutral-700 mb-1">
            {isArabic ? staff.specialization : staff.specialization}
          </div>
          <p className="text-xs text-neutral-600 line-clamp-2">
            {isArabic ? staff.bio : staff.bioEn || staff.bio}
          </p>
        </div>
      </div>
    </div>
  );
}