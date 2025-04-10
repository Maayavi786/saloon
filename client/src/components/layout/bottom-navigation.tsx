import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { CalendarDays, Home, Search, User } from "lucide-react";

export function BottomNavigation() {
  const [location] = useLocation();
  const { language } = useLanguage();
  
  const isArabic = language === "ar";
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-neutral-200 z-10">
      <div className="flex justify-around py-2">
        <Link href="/">
          <div className={`flex flex-col items-center ${location === '/' ? 'text-primary' : 'text-neutral-700'}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">{isArabic ? 'الرئيسية' : 'Home'}</span>
          </div>
        </Link>
        
        <Link href="/search">
          <div className={`flex flex-col items-center ${location === '/search' ? 'text-primary' : 'text-neutral-700'}`}>
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">{isArabic ? 'استكشاف' : 'Explore'}</span>
          </div>
        </Link>
        
        <Link href="/bookings">
          <div className={`flex flex-col items-center ${location === '/bookings' ? 'text-primary' : 'text-neutral-700'}`}>
            <CalendarDays className="h-5 w-5" />
            <span className="text-xs mt-1">{isArabic ? 'حجوزاتي' : 'Bookings'}</span>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className={`flex flex-col items-center ${location === '/profile' ? 'text-primary' : 'text-neutral-700'}`}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">{isArabic ? 'حسابي' : 'Account'}</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
