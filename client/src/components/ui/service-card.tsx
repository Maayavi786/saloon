import { useLanguage } from "@/hooks/use-language";
import { Service } from "@shared/schema";
import { useBooking } from "@/contexts/booking-context";
import { Clock } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  layout?: "featured" | "list";
}

export function ServiceCard({ service, layout = "list" }: ServiceCardProps) {
  const { language } = useLanguage();
  const { openBookingModal } = useBooking();
  const isArabic = language === "ar";

  const handleBookClick = () => {
    openBookingModal(service);
  };

  if (layout === "featured") {
    return (
      <div className="w-64 flex-shrink-0 bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-200 border-saudi-gold/20 bg-white/90 backdrop-blur-sm"> {/* Change applied here */}
        <div className="p-3">
          <h3 className="font-bold mb-1">
            {isArabic ? service.name : service.nameEn || service.name}
          </h3>
          <p className="text-xs text-neutral-700 mb-2 line-clamp-2">
            {isArabic ? service.description : service.descriptionEn || service.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-secondary font-bold">
                {service.price} {isArabic ? "ر.س" : "SAR"}
              </span>
              {service.discountedPrice && (
                <span className={`line-through text-xs text-neutral-700 ${isArabic ? "mr-2" : "ml-2"}`}>
                  {service.discountedPrice} {isArabic ? "ر.س" : "SAR"}
                </span>
              )}
            </div>
            <button 
              onClick={handleBookClick}
              className="bg-primary text-white text-xs px-3 py-1 rounded-lg"
            >
              {isArabic ? "حجز" : "Book"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-3 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold mb-1">
            {isArabic ? service.name : service.nameEn || service.name}
          </h3>
          <p className="text-sm text-neutral-700 mb-2">
            {isArabic ? service.description : service.descriptionEn || service.description}
          </p>
          <div className="flex items-center text-sm text-neutral-700">
            <Clock className="h-4 w-4" />
            <span className={`${isArabic ? "mr-1" : "ml-1"}`}>
              {service.duration} {isArabic ? "دقيقة" : "min"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-secondary font-bold mb-2">
            {service.discountedPrice || service.price} {isArabic ? "ر.س" : "SAR"}
          </span>
          <button 
            onClick={handleBookClick}
            className="bg-primary text-white px-4 py-1 rounded-lg text-sm"
          >
            {isArabic ? "حجز" : "Book"}
          </button>
        </div>
      </div>
    </div>
  );
}