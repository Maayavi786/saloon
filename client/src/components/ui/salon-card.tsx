import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { Salon } from "@shared/schema";
import { Check, MapPin, Star } from "lucide-react";

interface SalonCardProps {
  salon: Salon;
  layout?: "grid" | "list";
  distance?: number; // in kilometers
}

export function SalonCard({ salon, layout = "list", distance }: SalonCardProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  // Handle missing images with a placeholder
  const coverImage = salon.coverImage || "https://images.unsplash.com/photo-1470259078422-826894b933aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=240&h=240&q=80";

  if (layout === "grid") {
    return (
      <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm overflow-hidden card-hover">
        <Link href={`/salon/${salon.id}`}>
          <div className="relative">
            <img 
              src={coverImage}
              alt={isArabic ? salon.name : salon.nameEn || salon.name} 
              className="w-full h-32 object-cover" 
            />
            {distance && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <div className="text-white text-xs">{distance} كم</div>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-bold mb-1">{isArabic ? salon.name : salon.nameEn || salon.name}</h3>
            <div className="flex items-center text-sm mb-2">
              <MapPin className="h-3 w-3 text-neutral-700" />
              <span className={`${isArabic ? "mr-1" : "ml-1"} text-xs text-neutral-700`}>
                {isArabic 
                  ? `${salon.district || ""} - ${salon.city}` 
                  : `${salon.districtEn || ""} - ${salon.cityEn || salon.city}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className={`text-sm ${isArabic ? "mr-1" : "ml-1"}`}>
                  {salon.rating?.toFixed(1) || "جديد"}
                </span>
              </div>
              <button className="text-primary text-sm">
                {isArabic ? (
                  <>
                    حجز <i className="fas fa-arrow-left text-xs mr-1"></i>
                  </>
                ) : (
                  <>
                    Book <i className="fas fa-arrow-right text-xs ml-1"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 border-saudi-green/10 bg-white/95 backdrop-blur-sm"> {/* This line is modified */}
      <Link href={`/salon/${salon.id}`}>
        <div className="flex">
          <div className="relative w-24 h-24">
            <img 
              src={coverImage}
              alt={isArabic ? salon.name : salon.nameEn || salon.name} 
              className="w-full h-full object-cover" 
            />
            {salon.verified && (
              <div className="absolute top-2 right-2 bg-white text-green-500 text-xs p-1 rounded">
                <Check className="h-3 w-3" />
              </div>
            )}
          </div>
          <div className="flex-1 p-3">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold">{isArabic ? salon.name : salon.nameEn || salon.name}</h3>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className={`text-sm ${isArabic ? "mr-1" : "ml-1"}`}>
                  {salon.rating?.toFixed(1) || "جديد"}
                </span>
              </div>
            </div>
            <div className="flex items-center text-sm text-neutral-700 mb-2">
              <MapPin className="h-3 w-3" />
              <span className={`${isArabic ? "mr-1" : "ml-1"}`}>
                {isArabic 
                  ? `${salon.district || ""} - ${salon.city}` 
                  : `${salon.districtEn || ""} - ${salon.cityEn || salon.city}`}
              </span>
            </div>
            <div className="flex">
              {salon.gender === "female_only" && (
                <span className={`text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ${isArabic ? "ml-2" : "mr-2"}`}>
                  {isArabic ? "للسيدات فقط" : "Ladies Only"}
                </span>
              )}
              {salon.hasPrivateRooms && (
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                  {isArabic ? "غرف خاصة" : "Private Rooms"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}