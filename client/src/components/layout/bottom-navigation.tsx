import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/hooks/use-language";
import { CalendarDays, Home, Search, User } from "lucide-react";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { language } = useLanguage();
  
  const isArabic = language === "ar";
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-neutral-200 z-10">
      <div className="flex justify-around py-2">
        <Link to="/" className={`flex flex-col items-center ${currentPath === '/' ? 'text-primary' : 'text-neutral-700'}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">{isArabic ? 'الرئيسية' : 'Home'}</span>
        </Link>
        
        <Link to="/map" className={`flex flex-col items-center ${currentPath === '/map' ? 'text-primary' : 'text-neutral-700'}`}>
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">{isArabic ? 'استكشاف' : 'Explore'}</span>
        </Link>
        
        <Link to="/bookings" className={`flex flex-col items-center ${currentPath === '/bookings' ? 'text-primary' : 'text-neutral-700'}`}>
          <CalendarDays className="h-5 w-5" />
          <span className="text-xs mt-1">{isArabic ? 'حجوزاتي' : 'Bookings'}</span>
        </Link>
        
        <Link to="/profile" className={`flex flex-col items-center ${currentPath === '/profile' ? 'text-primary' : 'text-neutral-700'}`}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">{isArabic ? 'حسابي' : 'Account'}</span>
        </Link>
      </div>
    </nav>
  );
}
