import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { SalonCard } from "@/components/ui/salon-card";
import { CategoryItem } from "@/components/ui/category-item";
import { ServiceCard } from "@/components/ui/service-card";
import { AIRecommendations } from "@/components/ui/ai-recommendations";
import { Salon, Service } from "@shared/schema";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { BookingModal } from "@/components/ui/booking-modal";
import { useBooking } from "@/contexts/booking-context";

export default function HomePage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { selectedService, isBookingModalOpen, closeBookingModal } = useBooking();
  const isArabic = language === "ar";
  
  const [activeTab, setActiveTab] = useState<"female" | "male">("female");
  const [location, setLocation] = useState("الرياض");
  
  // Fetch salons
  const { data: salons, isLoading: isLoadingSalons } = useQuery<Salon[]>({
    queryKey: [`/api/salons?gender=${activeTab === "female" ? "female_only" : "male_only"}`],
  });
  
  // Dummy categories for UI 
  const categories = [
    { id: "haircut", name: isArabic ? "قص الشعر" : "Haircut" },
    { id: "makeup", name: isArabic ? "مكياج" : "Makeup" },
    { id: "spa", name: isArabic ? "سبا" : "Spa" },
    { id: "nails", name: isArabic ? "أظافر" : "Nails" },
  ];
  
  // Dummy special offers
  const { data: featuredServices, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ["/api/salons/featured-services"],
    enabled: false, // disabled until we have salon data
  });
  
  return (
    <div className="bg-gradient-to-b from-saudi-sand to-white min-h-screen pb-20">
      <LanguageSwitcher />
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-center mb-6">
        {isArabic ? 'حجز خدمات الصالون' : 'Salon Services Booking'}
      </h1>
      {/* Tab Navigation */}
        <div className="grid grid-cols-2 mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
          <button 
            onClick={() => setActiveTab("female")}
            className={`py-3 text-center border-b-2 ${
              activeTab === "female" 
                ? "border-saudi-green font-medium text-saudi-green bg-saudi-sand/50" 
                : "border-transparent font-medium text-neutral-700"
            }`}
          >
            <i className="fas fa-female mr-1"></i> {isArabic ? 'للسيدات' : 'For Women'}
            {!isArabic && <span className="block text-xs">{isArabic ? 'For Women' : 'للسيدات'}</span>}
          </button>
          <button 
            onClick={() => setActiveTab("male")}
            className={`py-3 text-center border-b-2 ${
              activeTab === "male" 
                ? "border-primary font-medium text-primary" 
                : "border-transparent font-medium text-neutral-700"
            }`}
          >
            <i className="fas fa-male mr-1"></i> {isArabic ? 'للرجال' : 'For Men'}
            {!isArabic && <span className="block text-xs">{isArabic ? 'For Men' : 'للرجال'}</span>}
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="flex items-center bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-3">
              <Search className="h-5 w-5 text-neutral-700" />
            </div>
            <input 
              type="text" 
              placeholder={isArabic ? "ابحث عن صالون أو خدمة..." : "Search for a salon or service..."} 
              className="w-full py-3 px-2 outline-none" 
            />
            <div className="p-3">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
        
        {/* Location Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-secondary" />
            <span className={`${isArabic ? "mr-2" : "ml-2"} text-neutral-700`}>{location}</span>
          </div>
          <button className="text-primary text-sm font-medium">
            {isArabic ? 'تغيير' : 'Change'} <i className={`fas fa-chevron-${isArabic ? 'down' : 'up'} text-xs ${isArabic ? "mr-1" : "ml-1"}`}></i>
          </button>
        </div>
        
        {/* Featured Slider */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">{isArabic ? 'عروض خاصة' : 'Special Offers'}</h2>
          
          {isLoadingServices ? (
            <div className="flex space-x-4 rtl:space-x-reverse">
              {[1, 2].map((i) => (
                <div key={i} className="w-64 h-56 bg-white rounded-xl shadow-sm animate-pulse"></div>
              ))}
            </div>
          ) : featuredServices && featuredServices.length > 0 ? (
            <div className="flex space-x-4 rtl:space-x-reverse overflow-x-auto pb-2 scrollbar-hide">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} layout="featured" />
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-4">
              {isArabic ? 'لا توجد عروض متاحة حاليًا' : 'No special offers available right now'}
            </p>
          )}
        </section>
        
        {/* AI Recommendations */}
        <section className="mb-8 bg-white p-4 rounded-xl shadow-sm">
          {user ? (
            <AIRecommendations limit={3} showReasons={true} />
          ) : (
            <div className="text-center py-4">
              <h3 className="text-lg font-bold mb-2">{isArabic ? "توصيات مخصصة لك" : "Personalized Recommendations"}</h3>
              <p className="text-muted-foreground mb-4">
                {isArabic 
                  ? "سجل دخول للحصول على توصيات شخصية بناءً على تفضيلاتك وتاريخ حجزك"
                  : "Sign in to get personalized recommendations based on your preferences and booking history"}
              </p>
              <button 
                onClick={() => window.location.href = "/auth"}
                className="bg-primary/10 text-primary px-4 py-2 rounded-md font-medium"
              >
                {isArabic ? "تسجيل الدخول" : "Sign In"}
              </button>
            </div>
          )}
        </section>
        
        {/* Service Categories */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">{isArabic ? 'تصفح الخدمات' : 'Browse Services'}</h2>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryItem key={category.id} category={category.id} />
            ))}
          </div>
        </section>
        
        {/* Top Rated Salons */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              {isArabic 
                ? `أعلى تقييماً ${activeTab === "female" ? "للسيدات" : "للرجال"}` 
                : `Top Rated ${activeTab === "female" ? "Women's" : "Men's"} Salons`}
            </h2>
            <button className="text-primary text-sm">{isArabic ? 'عرض الكل' : 'View All'}</button>
          </div>
          
          {isLoadingSalons ? (
            <div>
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm h-24 mb-4 animate-pulse"></div>
              ))}
            </div>
          ) : salons && salons.length > 0 ? (
            <div>
              {salons.slice(0, 3).map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-4">
              {isArabic ? 'لا توجد صالونات متاحة حاليًا' : 'No salons available right now'}
            </p>
          )}
        </section>
        
        {/* Nearby Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{isArabic ? 'قريب منك' : 'Near You'}</h2>
            <button className="text-primary text-sm">{isArabic ? 'عرض الكل' : 'View All'}</button>
          </div>
          
          {isLoadingSalons ? (
            <div className="flex space-x-4 rtl:space-x-reverse">
              {[1, 2].map((i) => (
                <div key={i} className="w-64 h-56 bg-white rounded-xl shadow-sm animate-pulse"></div>
              ))}
            </div>
          ) : salons && salons.length > 0 ? (
            <div className="flex space-x-4 rtl:space-x-reverse overflow-x-auto pb-2 scrollbar-hide">
              {salons.map((salon) => (
                <SalonCard 
                  key={salon.id} 
                  salon={salon} 
                  layout="grid" 
                  distance={Math.random() * 3 + 1} // Mock distance
                />
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-4">
              {isArabic ? 'لا توجد صالونات قريبة منك حاليًا' : 'No nearby salons available right now'}
            </p>
          )}
        </section>
      </main>
      
      <BottomNavigation />
      
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={closeBookingModal}
        service={selectedService}
      />
    </div>
  );
}
