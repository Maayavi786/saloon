import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Header } from "@/components/layout/header";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
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
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const isArabic = language === "ar";
  
  // Use useEffect for navigation instead of redirecting during render
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Login schema
  const loginSchema = z.object({
    username: z.string().min(3, isArabic ? "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" : "Username must be at least 3 characters"),
    password: z.string().min(6, isArabic ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters"),
  });
  
  // Registration schema
  const extendedRegisterSchema = insertUserSchema.extend({
    password: z.string().min(6, isArabic ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match",
    path: ["confirmPassword"],
  });
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof extendedRegisterSchema>>({
    resolver: zodResolver(extendedRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
      phoneNumber: "",
      role: "customer",
      gender: "female",
    },
  });
  
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };
  
  const onRegisterSubmit = (values: z.infer<typeof extendedRegisterSchema>) => {
    const { confirmPassword, ...registrationData } = values;
    registerMutation.mutate(registrationData);
  };
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <LanguageSwitcher />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
          <div className="md:w-1/2">
            <div className="mb-6 text-center md:text-left">
              <h1 className="text-2xl font-bold text-primary mb-2">
                {isArabic ? "مرحبًا بك في صالون" : "Welcome to Saloon"}
              </h1>
              <p className="text-neutral-700">
                {isArabic 
                  ? "منصة الحجز الأولى للصالونات في المملكة العربية السعودية" 
                  : "The premier salon booking platform in Saudi Arabia"}
              </p>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">
                  {isArabic ? "تسجيل الدخول" : "Login"}
                </TabsTrigger>
                <TabsTrigger value="register">
                  {isArabic ? "إنشاء حساب" : "Register"}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>{isArabic ? "تسجيل الدخول" : "Login"}</CardTitle>
                    <CardDescription>
                      {isArabic 
                        ? "أدخل بيانات الدخول للوصول إلى حسابك" 
                        : "Enter your credentials to access your account"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isArabic ? "اسم المستخدم" : "Username"}</FormLabel>
                              <FormControl>
                                <Input placeholder={isArabic ? "أدخل اسم المستخدم" : "Enter username"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isArabic ? "كلمة المرور" : "Password"}</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder={isArabic ? "أدخل كلمة المرور" : "Enter password"} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-primary" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending 
                            ? (isArabic ? "جاري تسجيل الدخول..." : "Logging in...") 
                            : (isArabic ? "تسجيل الدخول" : "Login")}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>{isArabic ? "إنشاء حساب جديد" : "Create a new account"}</CardTitle>
                    <CardDescription>
                      {isArabic 
                        ? "أدخل بياناتك لإنشاء حساب جديد" 
                        : "Enter your details to create a new account"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isArabic ? "الاسم الكامل" : "Full Name"}</FormLabel>
                              <FormControl>
                                <Input placeholder={isArabic ? "أدخل اسمك الكامل" : "Enter your full name"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isArabic ? "اسم المستخدم" : "Username"}</FormLabel>
                              <FormControl>
                                <Input placeholder={isArabic ? "أدخل اسم المستخدم" : "Enter username"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isArabic ? "البريد الإلكتروني" : "Email"}</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder={isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isArabic ? "رقم الجوال" : "Phone Number"}</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={isArabic ? "أدخل رقم الجوال" : "Enter phone number"} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{isArabic ? "كلمة المرور" : "Password"}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder={isArabic ? "أدخل كلمة المرور" : "Enter password"} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder={isArabic ? "أعد إدخال كلمة المرور" : "Re-enter password"} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={registerForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isArabic ? "الجنس" : "Gender"}</FormLabel>
                              <FormControl>
                                <select 
                                  className="w-full p-2 border border-input rounded-md" 
                                  {...field}
                                >
                                  <option value="female">{isArabic ? "أنثى" : "Female"}</option>
                                  <option value="male">{isArabic ? "ذكر" : "Male"}</option>
                                  <option value="other">{isArabic ? "آخر" : "Other"}</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-primary" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending 
                            ? (isArabic ? "جاري إنشاء الحساب..." : "Creating account...") 
                            : (isArabic ? "إنشاء حساب" : "Register")}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:w-1/2 hidden md:block bg-primary rounded-xl p-6 text-white flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? "احجز خدمات الصالون بكل سهولة" : "Book salon services with ease"}
            </h2>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="mt-1 mr-2">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div>
                  <h3 className="font-bold">
                    {isArabic ? "اكتشف أفضل الصالونات" : "Discover top salons"}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {isArabic 
                      ? "تصفح وابحث عن أفضل الصالونات في منطقتك" 
                      : "Browse and search for the best salons in your area"}
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="mt-1 mr-2">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div>
                  <h3 className="font-bold">
                    {isArabic ? "احجز بنقرة واحدة" : "Book with a single click"}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {isArabic 
                      ? "احجز موعدك في أي وقت وبكل سهولة" 
                      : "Schedule your appointment anytime with ease"}
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="mt-1 mr-2">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div>
                  <h3 className="font-bold">
                    {isArabic ? "خصوصية تامة" : "Complete privacy"}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {isArabic 
                      ? "تمتع بخصوصية تامة وخدمات مخصصة" 
                      : "Enjoy complete privacy and personalized services"}
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="mt-1 mr-2">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div>
                  <h3 className="font-bold">
                    {isArabic ? "عروض حصرية" : "Exclusive offers"}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {isArabic 
                      ? "استمتع بعروض وخصومات حصرية لمستخدمي التطبيق" 
                      : "Enjoy exclusive deals and discounts for app users"}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
