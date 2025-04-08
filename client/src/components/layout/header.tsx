import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "./language-switcher";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, User } from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const { language } = useLanguage();
  
  const isArabic = language === "ar";
  
  return (
    <header className="bg-white shadow-md relative z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {isArabic ? 'ص' : 'S'}
              </span>
            </div>
            <h1 className={`text-xl font-bold text-primary ${isArabic ? 'mr-2' : 'ml-2'}`}>
              {isArabic ? 'صالون' : 'Saloon'}
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center">
          <Link href={user ? "/bookings" : "/auth"} className={`${isArabic ? 'ml-4' : 'mr-4'}`}>
            <Bell className="text-neutral-700 h-5 w-5" />
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-white">
                <User className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      {isArabic ? 'الملف الشخصي' : 'Profile'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookings">
                      {isArabic ? 'حجوزاتي' : 'My Bookings'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                    {isArabic ? 'تسجيل الخروج' : 'Logout'}
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/auth">
                    {isArabic ? 'تسجيل الدخول' : 'Login'}
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
