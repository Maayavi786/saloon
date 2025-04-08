import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ServiceCard } from "@/components/ui/service-card";
import { StaffCard } from "@/components/ui/staff-card";
import { CategoryItem } from "@/components/ui/category-item";
import { Salon, Service, Review, Staff } from "@shared/schema";
import { BookingModal } from "@/components/ui/booking-modal";
import { useBooking } from "@/contexts/booking-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Clock, MapPin, Phone, ChevronRight, 
  Star, CheckCircle, Calendar, Users
} from "lucide-react";

export default function SalonDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const { isBookingModalOpen, closeBookingModal, openBookingModal } = useBooking();
  const isArabic = language === "ar";
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<Service | null>(null);
  
  // Fetch salon details
  const { data: salon, isLoading: isLoadingSalon } = useQuery<Salon>({
    queryKey: [`/api/salons/${id}`],
  });
  
  // Fetch salon services
  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: [`/api/salons/${id}/services`],
    enabled: !!id,
  });
  
  // Fetch featured services
  const { data: featuredServices, isLoading: isLoadingFeatured } = useQuery<Service[]>({
    queryKey: [`/api/salons/${id}/featured-services`],
    enabled: !!id,
  });
  
  // Fetch reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/salons/${id}/reviews`],
    enabled: !!id,
  });
  
  // Fetch staff
  const { data: staff, isLoading: isLoadingStaff } = useQuery<Staff[]>({
    queryKey: [`/api/salons/${id}/staff`],
    enabled: !!id,
  });
  
  // Filter services by category
  const filteredServices = services?.filter(
    service => activeCategory === "all" || service.category === activeCategory
  );
  
  // Categories for filters
  const serviceCategories = [
    { id: "all", name: isArabic ? "الكل" : "All" },
    { id: "haircut", name: isArabic ? "قص الشعر" : "Haircut" },
    { id: "coloring", name: isArabic ? "صبغة وتلوين" : "Hair Color" },
    { id: "makeup", name: isArabic ? "مكياج" : "Makeup" },
    { id: "skin", name: isArabic ? "عناية بالبشرة" : "Skin Care" },
  ];
  
  if (isLoadingSalon) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-pulse text-primary">
          <i className="fas fa-spinner fa-spin text-3xl"></i>
        </div>
      </div>
    );
  }
  
  if (!salon) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-700 mb-2">
            {isArabic ? "الصالون غير موجود" : "Salon not found"}
          </h2>
          <Button 
            onClick={() => navigate("/")}
            className="bg-primary text-white"
          >
            {isArabic ? "العودة للرئيسية" : "Back to home"}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-neutral-100 min-h-screen pb-20">
      <LanguageSwitcher />
      
      <div className="relative">
        <div className="h-48">
          <img 
            src={salon.coverImage || "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80"} 
            alt={isArabic ? salon.name : salon.nameEn || salon.name} 
            className="w-full h-full object-cover" 
          />
          
          <button 
            onClick={() => navigate("/")}
            className={`absolute top-4 ${isArabic ? "right-4" : "left-4"} w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-neutral-700 shadow-sm z-10`}
          >
            <ChevronRight className={`h-5 w-5 ${!isArabic && "transform rotate-180"}`} />
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-white text-xl font-bold">
                  {isArabic ? salon.name : salon.nameEn || salon.name}
                </h1>
                <div className="flex items-center text-white">
                  <MapPin className="h-4 w-4" />
                  <span className={`${isArabic ? "mr-1" : "ml-1"} text-sm`}>
                    {isArabic 
                      ? `${salon.district || ""} - ${salon.city}` 
                      : `${salon.districtEn || ""} - ${salon.cityEn || salon.city}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center bg-white/30 backdrop-blur-sm text-white px-2 py-1 rounded-lg">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className={`${isArabic ? "mr-1" : "ml-1"}`}>
                  {salon.rating?.toFixed(1) || "جديد"}
                </span>
                <span className={`text-xs ${isArabic ? "mr-1" : "ml-1"}`}>
                  ({salon.reviewCount || 0})
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex mb-4">
            {salon.gender === "female_only" && (
              <span className={`text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ${isArabic ? "ml-2" : "mr-2"}`}>
                {isArabic ? "للسيدات فقط" : "Ladies Only"}
              </span>
            )}
            {salon.hasPrivateRooms && (
              <span className={`text-xs bg-accent/10 text-accent px-2 py-1 rounded-full ${isArabic ? "ml-2" : "mr-2"}`}>
                {isArabic ? "غرف خاصة" : "Private Rooms"}
              </span>
            )}
            <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
              {isArabic ? "عروض خاصة" : "Special Offers"}
            </span>
          </div>
          
          <div className="mb-6">
            <h2 className="font-bold mb-2">{isArabic ? "حول الصالون" : "About the Salon"}</h2>
            <p className="text-sm text-neutral-700">
              {isArabic ? salon.description : salon.descriptionEn || salon.description}
            </p>
          </div>
          
          {/* Featured Services */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold">{isArabic ? "الخدمات المميزة" : "Featured Services"}</h2>
              <button className="text-primary text-sm">{isArabic ? "عرض الكل" : "View All"}</button>
            </div>
            
            {isLoadingFeatured ? (
              <div className="flex space-x-3 rtl:space-x-reverse">
                {[1, 2].map(i => (
                  <div key={i} className="w-64 h-32 bg-white rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : featuredServices && featuredServices.length > 0 ? (
              <div className="flex space-x-3 rtl:space-x-reverse overflow-x-auto pb-2 scrollbar-hide">
                {featuredServices.map(service => (
                  <ServiceCard key={service.id} service={service} layout="featured" />
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">
                {isArabic ? "لا توجد خدمات مميزة" : "No featured services available"}
              </p>
            )}
          </div>
          
          {/* All Services */}
          <div className="mb-6">
            <h2 className="font-bold mb-3">{isArabic ? "جميع الخدمات" : "All Services"}</h2>
            
            {/* Service Categories Tabs */}
            <div className="overflow-x-auto mb-4">
              <div className="flex space-x-2 rtl:space-x-reverse pb-2">
                {serviceCategories.map(category => (
                  <CategoryItem 
                    key={category.id}
                    category={category.id}
                    isActive={activeCategory === category.id}
                    onClick={() => setActiveCategory(category.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Services List */}
            {isLoadingServices ? (
              <div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl h-24 mb-3 animate-pulse"></div>
                ))}
              </div>
            ) : filteredServices && filteredServices.length > 0 ? (
              <div>
                {filteredServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">
                {isArabic ? "لا توجد خدمات في هذه الفئة" : "No services in this category"}
              </p>
            )}
          </div>
          
          {/* Staff Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold">{isArabic ? "طاقم العمل" : "Our Staff"}</h2>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-primary" />
                <span className={`${isArabic ? "mr-1" : "ml-1"} text-neutral-700`}>
                  {staff?.length || 0}
                </span>
              </div>
            </div>
            
            {isLoadingStaff ? (
              <div>
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-xl h-24 mb-3 animate-pulse"></div>
                ))}
              </div>
            ) : staff && staff.length > 0 ? (
              <div>
                {staff.map(member => (
                  <StaffCard key={member.id} staff={member} />
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">
                {isArabic ? "لا يوجد معلومات عن الطاقم حالياً" : "No staff information available"}
              </p>
            )}
          </div>
          
          {/* Reviews */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold">{isArabic ? "التقييمات والمراجعات" : "Ratings & Reviews"}</h2>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className={`${isArabic ? "mr-1" : "ml-1"}`}>
                  {salon.rating?.toFixed(1) || "جديد"}
                </span>
                <span className={`text-neutral-700 ${isArabic ? "mr-1" : "ml-1"}`}>
                  ({salon.reviewCount || 0})
                </span>
              </div>
            </div>
            
            {isLoadingReviews ? (
              <div>
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-xl h-32 mb-3 animate-pulse"></div>
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <>
                {reviews.slice(0, 2).map(review => (
                  <div key={review.id} className="bg-white rounded-xl border border-neutral-200 p-3 mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                          <span>{review.userId.toString()[0]}</span>
                        </div>
                        <div className={`${isArabic ? "mr-2" : "ml-2"}`}>
                          <div className="font-medium">User {review.userId}</div>
                          <div className="text-xs text-neutral-700">
                            {new Date(review.date ? review.date : new Date()).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className={`${isArabic ? "mr-1" : "ml-1"}`}>{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-700">
                      {review.comment}
                    </p>
                  </div>
                ))}
                
                <button className="w-full text-center text-primary py-2 border border-primary rounded-lg">
                  {isArabic ? "عرض جميع التقييمات" : "View all reviews"}
                </button>
              </>
            ) : (
              <p className="text-neutral-500 text-center py-4">
                {isArabic ? "لا توجد تقييمات حتى الآن" : "No reviews yet"}
              </p>
            )}
          </div>
          
          {/* Contact Info */}
          <div className="mb-6">
            <h2 className="font-bold mb-3">{isArabic ? "معلومات الاتصال" : "Contact Information"}</h2>
            
            <div className="bg-white rounded-xl border border-neutral-200 p-3">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{isArabic ? "العنوان" : "Address"}</div>
                  <div className="text-sm text-neutral-700">
                    {isArabic 
                      ? `${salon.district || ""}, ${salon.address}, ${salon.city}` 
                      : `${salon.districtEn || ""}, ${salon.addressEn || salon.address}, ${salon.cityEn || salon.city}`}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{isArabic ? "رقم الهاتف" : "Phone Number"}</div>
                  <div className="text-sm text-neutral-700">{salon.phoneNumber}</div>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{isArabic ? "ساعات العمل" : "Working Hours"}</div>
                  <div className="text-sm text-neutral-700">
                    {salon.openingHours ? (
                      typeof salon.openingHours === 'string' ? 
                        salon.openingHours : 
                        JSON.stringify(salon.openingHours)
                    ) : (
                      isArabic 
                        ? "السبت - الخميس: 9:00 ص - 10:00 م، الجمعة: 2:00 م - 10:00 م" 
                        : "Sat - Thu: 9:00 AM - 10:00 PM, Fri: 2:00 PM - 10:00 PM"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Book Now Button */}
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-neutral-200 flex justify-between items-center">
            <div>
              <div className="text-neutral-700 text-sm">{isArabic ? "احجز الآن" : "Book Now"}</div>
              <div className="text-xl font-bold text-primary">{salon.name}</div>
            </div>
            <Button 
              onClick={() => {
                if (!user) {
                  toast({
                    title: isArabic ? "يجب تسجيل الدخول" : "Login required",
                    description: isArabic 
                      ? "يرجى تسجيل الدخول لإكمال الحجز" 
                      : "Please login to complete booking",
                    variant: "destructive",
                  });
                  navigate("/auth");
                  return;
                }
                
                // If services are available, open modal with the first service
                if (services && services.length > 0) {
                  setSelectedServiceForModal(services[0]);
                  openBookingModal(services[0]);
                } else {
                  toast({
                    title: isArabic ? "لا توجد خدمات متاحة" : "No services available",
                    description: isArabic 
                      ? "لا توجد خدمات متاحة للحجز حالياً" 
                      : "No services available for booking at the moment",
                    variant: "destructive",
                  });
                }
              }}
              className="bg-primary text-white rounded-xl py-3 px-6 flex items-center"
            >
              <Calendar className="h-5 w-5 mr-2" />
              {isArabic ? "حجز موعد" : "Book Appointment"}
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
      
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={closeBookingModal}
        service={selectedServiceForModal}
      />
    </div>
  );
}
