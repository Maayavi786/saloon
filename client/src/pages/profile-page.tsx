import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  Mail, 
  UserCheck, 
  ChevronRight, 
  LogOut,
  Star,
  HelpCircle,
  Lock,
  Settings
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const isArabic = language === "ar";
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-700 mb-2">
            {isArabic ? "غير مسجل دخول" : "Not logged in"}
          </h2>
          <Button 
            onClick={() => window.location.href = "/auth"}
            className="bg-primary text-white"
          >
            {isArabic ? "تسجيل الدخول" : "Login"}
          </Button>
        </div>
      </div>
    );
  }
  
  // Profile update schema
  const profileSchema = z.object({
    name: z.string().min(1, isArabic ? "الاسم مطلوب" : "Name is required"),
    email: z.string().email(isArabic ? "البريد الإلكتروني غير صالح" : "Invalid email"),
    phoneNumber: z.string().min(1, isArabic ? "رقم الجوال مطلوب" : "Phone number is required"),
    gender: z.string().optional(),
    preferences: z.string().optional(),
  });
  
  // Profile update form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      gender: user.gender || undefined,
      preferences: user.preferences || undefined,
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, profileData);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: isArabic ? "تم تحديث الملف الشخصي" : "Profile updated",
        description: isArabic ? "تم تحديث بياناتك بنجاح" : "Your information has been updated successfully",
      });
      setIsEditingProfile(false);
    },
    onError: () => {
      toast({
        title: isArabic ? "فشل التحديث" : "Update failed",
        description: isArabic ? "حدث خطأ أثناء تحديث البيانات" : "An error occurred while updating your information",
        variant: "destructive",
      });
    }
  });
  
  const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(values);
  };
  
  // Password change schema
  const passwordSchema = z.object({
    currentPassword: z.string().min(1, isArabic ? "كلمة المرور الحالية مطلوبة" : "Current password is required"),
    newPassword: z.string().min(6, isArabic ? "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" : "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, isArabic ? "تأكيد كلمة المرور مطلوب" : "Confirm password is required"),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match",
    path: ["confirmPassword"],
  });
  
  // Password change form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (passwordData: z.infer<typeof passwordSchema>) => {
      const res = await apiRequest("POST", `/api/users/${user.id}/change-password`, passwordData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: isArabic ? "تم تغيير كلمة المرور" : "Password changed",
        description: isArabic ? "تم تغيير كلمة المرور بنجاح" : "Your password has been changed successfully",
      });
      passwordForm.reset();
    },
    onError: () => {
      toast({
        title: isArabic ? "فشل تغيير كلمة المرور" : "Password change failed",
        description: isArabic ? "حدث خطأ أثناء تغيير كلمة المرور" : "An error occurred while changing your password",
        variant: "destructive",
      });
    }
  });
  
  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutate(values);
  };
  
  return (
    <div className="bg-neutral-100 min-h-screen pb-20">
      <LanguageSwitcher />
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">{isArabic ? "الملف الشخصي" : "Profile"}</h1>
        
        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle>{isArabic ? "المعلومات الشخصية" : "Personal Information"}</CardTitle>
              {!isEditingProfile && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  {isArabic ? "تعديل" : "Edit"}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {isEditingProfile ? (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? "الاسم" : "Name"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? "البريد الإلكتروني" : "Email"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? "رقم الجوال" : "Phone Number"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? "الجنس" : "Gender"}</FormLabel>
                        <FormControl>
                          <select 
                            className="w-full p-2 border border-input rounded-md" 
                            {...field}
                            value={field.value || ""}
                          >
                            <option value="">{isArabic ? "اختر الجنس" : "Select gender"}</option>
                            <option value="female">{isArabic ? "أنثى" : "Female"}</option>
                            <option value="male">{isArabic ? "ذكر" : "Male"}</option>
                            <option value="other">{isArabic ? "آخر" : "Other"}</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="preferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? "التفضيلات" : "Preferences"}</FormLabel>
                        <FormControl>
                          <select 
                            className="w-full p-2 border border-input rounded-md" 
                            {...field}
                            value={field.value || ""}
                          >
                            <option value="">{isArabic ? "اختر التفضيلات" : "Select preferences"}</option>
                            <option value="female_only">{isArabic ? "صالونات نسائية فقط" : "Female salons only"}</option>
                            <option value="private_rooms">{isArabic ? "غرف خاصة فقط" : "Private rooms only"}</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      {isArabic ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending 
                        ? (isArabic ? "جاري الحفظ..." : "Saving...") 
                        : (isArabic ? "حفظ التغييرات" : "Save Changes")}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-sm text-neutral-700">{isArabic ? "الاسم" : "Name"}</div>
                    <div className="font-medium">{user.name}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-sm text-neutral-700">{isArabic ? "البريد الإلكتروني" : "Email"}</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-sm text-neutral-700">{isArabic ? "رقم الجوال" : "Phone Number"}</div>
                    <div className="font-medium">{user.phoneNumber}</div>
                  </div>
                </div>
                
                {user.gender && (
                  <div className="flex items-center">
                    <UserCheck className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="text-sm text-neutral-700">{isArabic ? "الجنس" : "Gender"}</div>
                      <div className="font-medium">
                        {user.gender === "female" ? (isArabic ? "أنثى" : "Female") :
                         user.gender === "male" ? (isArabic ? "ذكر" : "Male") :
                         user.gender === "other" ? (isArabic ? "آخر" : "Other") : ""}
                      </div>
                    </div>
                  </div>
                )}
                
                {user.preferences && (
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="text-sm text-neutral-700">{isArabic ? "التفضيلات" : "Preferences"}</div>
                      <div className="font-medium">
                        {user.preferences === "female_only" ? (isArabic ? "صالونات نسائية فقط" : "Female salons only") :
                         user.preferences === "private_rooms" ? (isArabic ? "غرف خاصة فقط" : "Private rooms only") : ""}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Password Change */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-primary mr-3" />
                    <div className="font-medium">{isArabic ? "تغيير كلمة المرور" : "Change Password"}</div>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-neutral-400 ${!isArabic && "transform rotate-180"}`} />
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isArabic ? "تغيير كلمة المرور" : "Change Password"}</DialogTitle>
              <DialogDescription>
                {isArabic 
                  ? "أدخل كلمة المرور الحالية وكلمة المرور الجديدة" 
                  : "Enter your current password and the new password"}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? "كلمة المرور الحالية" : "Current Password"}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? "كلمة المرور الجديدة" : "New Password"}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending 
                    ? (isArabic ? "جاري التغيير..." : "Changing...") 
                    : (isArabic ? "تغيير كلمة المرور" : "Change Password")}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Help & FAQ */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="faq">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-primary mr-3" />
                    <span>{isArabic ? "المساعدة والأسئلة الشائعة" : "Help & FAQ"}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 py-2">
                    <div>
                      <h3 className="font-medium mb-1">
                        {isArabic ? "كيف يمكنني حجز موعد؟" : "How do I book an appointment?"}
                      </h3>
                      <p className="text-sm text-neutral-700">
                        {isArabic 
                          ? "يمكنك تصفح الصالونات واختيار الخدمة المناسبة ثم النقر على زر الحجز لإكمال عملية الحجز" 
                          : "You can browse salons, select a service, and click on the booking button to complete the booking process"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">
                        {isArabic ? "كيف يمكنني إلغاء حجز؟" : "How do I cancel a booking?"}
                      </h3>
                      <p className="text-sm text-neutral-700">
                        {isArabic 
                          ? "يمكنك الانتقال إلى صفحة حجوزاتي ثم النقر على زر إلغاء الحجز" 
                          : "You can go to My Bookings page and click on the Cancel Booking button"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">
                        {isArabic ? "ما هي طرق الدفع المتاحة؟" : "What payment methods are available?"}
                      </h3>
                      <p className="text-sm text-neutral-700">
                        {isArabic 
                          ? "نحن ندعم الدفع عبر بطاقة مدى، آبل باي، ودفع نقدي عند الوصول" 
                          : "We support payment via Mada card, Apple Pay, and cash on arrival"}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        {/* My Reviews */}
        <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-primary mr-3" />
                <div className="font-medium">{isArabic ? "تقييماتي" : "My Reviews"}</div>
              </div>
              <ChevronRight className={`h-5 w-5 text-neutral-400 ${!isArabic && "transform rotate-180"}`} />
            </div>
          </CardContent>
        </Card>
        
        {/* Logout */}
        <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => logoutMutation.mutate()}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <LogOut className="h-5 w-5 text-red-500 mr-3" />
                <div className="font-medium text-red-500">{isArabic ? "تسجيل الخروج" : "Logout"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* App Version */}
        <div className="text-center text-neutral-500 text-sm mt-8">
          {isArabic ? "تطبيق صالون - الإصدار 1.0.0" : "Saloon App - Version 1.0.0"}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
