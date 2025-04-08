import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Booking, Salon, Service } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";

export default function MyBookingsPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const isArabic = language === "ar";
  
  // Fetch user bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/my"],
    enabled: !!user,
  });
  
  // Fetch salons for each booking when bookings are loaded
  const { data: salons, isLoading: isLoadingSalons } = useQuery<Salon[]>({
    queryKey: ["/api/salons"],
    enabled: !!bookings,
  });
  
  // Helper function to get salon by ID
  const getSalonById = (salonId: number) => {
    return salons?.find(salon => salon.id === salonId);
  };
  
  // Cancel booking mutation
  const cancelBooking = async (bookingId: number) => {
    try {
      await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status: "cancelled" });
      
      // Invalidate bookings query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/my"] });
      
      toast({
        title: isArabic ? "تم إلغاء الحجز" : "Booking cancelled",
        description: isArabic ? "تم إلغاء الحجز بنجاح" : "Your booking has been cancelled successfully",
      });
    } catch (error) {
      toast({
        title: isArabic ? "فشل الإلغاء" : "Cancellation failed",
        description: isArabic ? "حدث خطأ أثناء محاولة إلغاء الحجز" : "An error occurred while trying to cancel your booking",
        variant: "destructive",
      });
    }
  };
  
  // Filter bookings by status
  const upcomingBookings = bookings?.filter(
    booking => ["pending", "confirmed"].includes(booking.status)
  ) || [];
  
  const pastBookings = bookings?.filter(
    booking => ["completed", "cancelled"].includes(booking.status)
  ) || [];
  
  // Booking status badges
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            {isArabic ? "قيد الانتظار" : "Pending"}
          </div>
        );
      case "confirmed":
        return (
          <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            {isArabic ? "مؤكد" : "Confirmed"}
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            {isArabic ? "مكتمل" : "Completed"}
          </div>
        );
      case "cancelled":
        return (
          <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            {isArabic ? "ملغي" : "Cancelled"}
          </div>
        );
      default:
        return null;
    }
  };
  
  // Format date for display
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  // Render a booking card
  const renderBookingCard = (booking: Booking) => {
    const salon = getSalonById(booking.salonId);
    const bookingDate = new Date(booking.date);
    
    return (
      <Card key={booking.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-primary">
                {salon ? (isArabic ? salon.name : salon.nameEn || salon.name) : `Salon #${booking.salonId}`}
              </CardTitle>
              <CardDescription>
                {renderStatusBadge(booking.status)}
              </CardDescription>
            </div>
            <div className="text-sm font-semibold">
              {booking.totalPrice} {isArabic ? "ر.س" : "SAR"}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="space-y-2">
            <div className="flex items-start">
              <Calendar className="h-4 w-4 text-neutral-700 mt-1 mr-2" />
              <div>
                <div className="text-sm font-medium">{isArabic ? "تاريخ الحجز" : "Appointment Date"}</div>
                <div className="text-sm text-neutral-700">{formatDate(bookingDate)}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-4 w-4 text-neutral-700 mt-1 mr-2" />
              <div>
                <div className="text-sm font-medium">{isArabic ? "وقت الحجز" : "Appointment Time"}</div>
                <div className="text-sm text-neutral-700">{formatTime(booking.time)}</div>
              </div>
            </div>
            
            {salon && (
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-neutral-700 mt-1 mr-2" />
                <div>
                  <div className="text-sm font-medium">{isArabic ? "العنوان" : "Location"}</div>
                  <div className="text-sm text-neutral-700">
                    {isArabic 
                      ? `${salon.district || ""} - ${salon.city}` 
                      : `${salon.districtEn || ""} - ${salon.cityEn || salon.city}`}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <div className="h-4 w-4 text-neutral-700 mt-1 mr-2">
                <i className="fas fa-credit-card"></i>
              </div>
              <div>
                <div className="text-sm font-medium">{isArabic ? "طريقة الدفع" : "Payment Method"}</div>
                <div className="text-sm text-neutral-700">
                  {booking.paymentMethod === "mada" ? "Mada" :
                   booking.paymentMethod === "applepay" ? "Apple Pay" :
                   booking.paymentMethod === "cash" ? (isArabic ? "نقداً" : "Cash") :
                   booking.paymentMethod || (isArabic ? "غير محدد" : "Not specified")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          {(booking.status === "pending" || booking.status === "confirmed") && (
            <Button 
              variant="outline" 
              className="w-full text-red-500 border-red-500 hover:bg-red-50"
              onClick={() => cancelBooking(booking.id)}
            >
              {isArabic ? "إلغاء الحجز" : "Cancel Booking"}
            </Button>
          )}
          
          {booking.status === "completed" && (
            <Button 
              variant="outline" 
              className="w-full text-primary border-primary hover:bg-primary/10"
            >
              {isArabic ? "إضافة تقييم" : "Add Review"}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  // Loading state
  if (isLoadingBookings || isLoadingSalons) {
    return (
      <div className="bg-neutral-100 min-h-screen">
        <LanguageSwitcher />
        <Header />
        
        <main className="container mx-auto px-4 py-6">
          <h1 className="text-xl font-bold mb-6">{isArabic ? "حجوزاتي" : "My Bookings"}</h1>
          
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }
  
  // No bookings state
  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-neutral-100 min-h-screen pb-20">
        <LanguageSwitcher />
        <Header />
        
        <main className="container mx-auto px-4 py-6">
          <h1 className="text-xl font-bold mb-6">{isArabic ? "حجوزاتي" : "My Bookings"}</h1>
          
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="mb-4 text-neutral-400">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-lg font-bold mb-2">
              {isArabic ? "لا توجد حجوزات" : "No Bookings Found"}
            </h2>
            <p className="text-neutral-700 mb-4">
              {isArabic 
                ? "لم تقم بإجراء أي حجوزات بعد. تصفح الصالونات واحجز خدمتك الآن!" 
                : "You haven't made any bookings yet. Browse salons and book your service now!"}
            </p>
            <Button 
              className="bg-primary text-white"
              onClick={() => window.location.href = "/"}
            >
              {isArabic ? "تصفح الصالونات" : "Browse Salons"}
            </Button>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="bg-neutral-100 min-h-screen pb-20">
      <LanguageSwitcher />
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">{isArabic ? "حجوزاتي" : "My Bookings"}</h1>
        
        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming">
              {isArabic ? "الحجوزات القادمة" : "Upcoming"}
            </TabsTrigger>
            <TabsTrigger value="past">
              {isArabic ? "الحجوزات السابقة" : "Past"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => renderBookingCard(booking))
            ) : (
              <div className="bg-white rounded-xl p-6 text-center">
                <p className="text-neutral-700">
                  {isArabic 
                    ? "لا توجد حجوزات قادمة" 
                    : "No upcoming bookings"}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {pastBookings.length > 0 ? (
              pastBookings.map(booking => renderBookingCard(booking))
            ) : (
              <div className="bg-white rounded-xl p-6 text-center">
                <p className="text-neutral-700">
                  {isArabic 
                    ? "لا توجد حجوزات سابقة" 
                    : "No past bookings"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
