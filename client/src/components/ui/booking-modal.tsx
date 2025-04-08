import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Service } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Clock } from "lucide-react";
import { PaymentModal } from "./payment/payment-modal";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

export function BookingModal({ isOpen, onClose, service }: BookingModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const isArabic = language === "ar";
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("mada");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Generate available dates (next 7 days)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        dayName: date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { weekday: 'short' })
      });
    }
    
    return dates;
  };
  
  // Generate time slots (9 AM to 9 PM, every 1.5 hours)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 21;
    
    for (let hour = startHour; hour < endHour; hour += 1.5) {
      const hourFloor = Math.floor(hour);
      const minutes = hour % 1 === 0.5 ? '30' : '00';
      const period = hourFloor < 12 ? (isArabic ? 'ص' : 'AM') : (isArabic ? 'م' : 'PM');
      const displayHour = hourFloor > 12 ? hourFloor - 12 : hourFloor;
      
      slots.push({
        time: `${hourFloor}:${minutes}`,
        display: isArabic 
          ? `${displayHour}:${minutes} ${period}`
          : `${displayHour}:${minutes} ${period}`
      });
    }
    
    return slots;
  };
  
  const availableDates = generateDates();
  const availableTimes = generateTimeSlots();
  
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/my"] });
      toast({
        title: isArabic ? "تم الحجز بنجاح" : "Booking successful",
        description: isArabic 
          ? "يمكنك مراجعة حجوزاتك في صفحة حجوزاتي" 
          : "You can check your booking in My Bookings page",
      });
      onClose();
      navigate("/bookings");
    },
    onError: () => {
      toast({
        title: isArabic ? "فشل الحجز" : "Booking failed",
        description: isArabic 
          ? "حدث خطأ أثناء محاولة الحجز، يرجى المحاولة مرة أخرى" 
          : "An error occurred while trying to book, please try again",
        variant: "destructive",
      });
    }
  });
  
  const handleBooking = () => {
    if (!user) {
      toast({
        title: isArabic ? "يجب تسجيل الدخول" : "Login required",
        description: isArabic 
          ? "يرجى تسجيل الدخول لإكمال الحجز" 
          : "Please login to complete the booking",
        variant: "destructive",
      });
      onClose();
      navigate("/auth");
      return;
    }
    
    if (!service || !selectedDate || !selectedTime) {
      toast({
        title: isArabic ? "معلومات غير مكتملة" : "Incomplete information",
        description: isArabic 
          ? "يرجى اختيار التاريخ والوقت" 
          : "Please select date and time",
        variant: "destructive",
      });
      return;
    }
    
    // For Mada or ApplePay, use Stripe payment flow
    if (paymentMethod === "mada" || paymentMethod === "applepay") {
      setShowPaymentModal(true);
      return;
    }
    
    // For cash payments, use the original booking flow
    const bookingData = {
      serviceId: service.id,
      salonId: service.salonId,
      date: new Date(selectedDate).toISOString(),
      time: selectedTime,
      totalPrice: service.discountedPrice || service.price,
      paymentMethod,
      paymentStatus: "pending",
      status: "pending"
    };
    
    bookingMutation.mutate(bookingData);
  };
  
  const handlePaymentSuccess = (result: any) => {
    queryClient.invalidateQueries({ queryKey: ["/api/bookings/my"] });
    toast({
      title: isArabic ? "تم الدفع والحجز بنجاح" : "Payment and booking successful",
      description: isArabic 
        ? "يمكنك مراجعة حجوزاتك في صفحة حجوزاتي" 
        : "You can check your booking in My Bookings page",
    });
    setShowPaymentModal(false);
    onClose();
    navigate("/bookings");
  };
  
  if (!service) return null;
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isArabic ? "حجز خدمة" : "Book Service"}</DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">
              {isArabic ? service.name : service.nameEn || service.name}
            </h4>
            <p className="text-sm text-neutral-700 mb-2">
              {isArabic ? service.description : service.descriptionEn || service.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-secondary font-bold">
                  {service.discountedPrice || service.price} {isArabic ? "ر.س" : "SAR"}
                </span>
                {service.discountedPrice && (
                  <span className={`line-through text-xs text-neutral-700 ${isArabic ? "mr-2" : "ml-2"}`}>
                    {service.price} {isArabic ? "ر.س" : "SAR"}
                  </span>
                )}
              </div>
              <div className="text-sm">
                <Clock className="inline h-4 w-4 mr-1" />
                <span>{service.duration} {isArabic ? "دقيقة" : "minutes"}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">{isArabic ? "اختر التاريخ" : "Select Date"}</h4>
            <div className="grid grid-cols-5 gap-2">
              {availableDates.map((date) => (
                <button
                  key={date.date}
                  onClick={() => setSelectedDate(date.date)}
                  className={`text-center py-2 rounded-lg ${
                    selectedDate === date.date
                      ? "bg-primary text-white"
                      : "border border-neutral-200"
                  }`}
                >
                  <div className="text-xs">{date.dayName}</div>
                  <div className="font-medium">{date.day}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">{isArabic ? "اختر الوقت" : "Select Time"}</h4>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`text-center py-2 rounded-lg ${
                    selectedTime === slot.time
                      ? "bg-primary text-white"
                      : "border border-neutral-200 text-neutral-700"
                  }`}
                >
                  {slot.display}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">{isArabic ? "طريقة الدفع" : "Payment Method"}</h4>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <button
                onClick={() => setPaymentMethod("mada")}
                className={`flex items-center justify-center ${
                  paymentMethod === "mada"
                    ? "border-primary"
                    : "border-neutral-200"
                } border rounded-xl p-2 flex-1`}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Mada_Logo.svg" alt="Mada" className="h-6" />
              </button>
              <button
                onClick={() => setPaymentMethod("applepay")}
                className={`flex items-center justify-center ${
                  paymentMethod === "applepay"
                    ? "border-primary"
                    : "border-neutral-200"
                } border rounded-xl p-2 flex-1`}
              >
                <i className="fab fa-apple-pay text-2xl"></i>
              </button>
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`flex items-center justify-center ${
                  paymentMethod === "cash"
                    ? "border-primary"
                    : "border-neutral-200"
                } border rounded-xl p-2 flex-1`}
              >
                <i className="fas fa-money-bill-wave text-xl text-green-500"></i>
              </button>
            </div>
          </div>
          
          <div className="mb-4 bg-neutral-100 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span>{isArabic ? "سعر الخدمة" : "Service Price"}</span>
              <span>{service.price} {isArabic ? "ر.س" : "SAR"}</span>
            </div>
            {service.discountedPrice && (
              <div className="flex justify-between items-center mb-2 text-green-500">
                <span>{isArabic ? "خصم" : "Discount"}</span>
                <span>-{(service.price - service.discountedPrice).toFixed(2)} {isArabic ? "ر.س" : "SAR"}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-bold">
              <span>{isArabic ? "المجموع" : "Total"}</span>
              <span>{service.discountedPrice || service.price} {isArabic ? "ر.س" : "SAR"}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-neutral-700">{isArabic ? "المجموع" : "Total"}</div>
              <div className="font-bold text-lg">
                {service.discountedPrice || service.price} {isArabic ? "ر.س" : "SAR"}
              </div>
            </div>
            <Button 
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || bookingMutation.isPending}
              className="bg-primary text-white py-3 px-6 rounded-xl"
            >
              {bookingMutation.isPending 
                ? (isArabic ? "جاري الحجز..." : "Booking...") 
                : (isArabic ? "تأكيد الحجز" : "Confirm Booking")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Payment Modal */}
      {showPaymentModal && service && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          service={service}
          bookingDetails={{
            date: selectedDate || '',
            time: selectedTime || '',
            salonId: service.salonId,
            customerName: user?.name || '',
            customerEmail: user?.email || '',
            customerPhone: user?.phoneNumber || ''
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
