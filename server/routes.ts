import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBookingSchema, insertReviewSchema, insertPaymentTransactionSchema, Service } from "@shared/schema";
import Stripe from "stripe";
import { addTestServices } from "./add-test-services";
import { getRecommendations, generateWelcomeMessage, suggestAppointmentTimes, ServiceRecommendation } from "./ai-service";

// Validate Stripe secret key exists
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Salons API
  app.get("/api/salons", async (req, res) => {
    try {
      const { 
        gender, 
        city, 
        hasPrivateRooms, 
        hasFemaleStaffOnly, 
        providesHomeService,
        category
      } = req.query;
      
      const filters: { 
        gender?: string, 
        city?: string,
        hasPrivateRooms?: boolean,
        hasFemaleStaffOnly?: boolean,
        providesHomeService?: boolean,
        category?: string
      } = {};
      
      if (gender) filters.gender = gender as string;
      if (city) filters.city = city as string;
      
      // Handle privacy settings
      if (hasPrivateRooms === 'true') filters.hasPrivateRooms = true;
      if (hasFemaleStaffOnly === 'true') filters.hasFemaleStaffOnly = true;
      if (providesHomeService === 'true') filters.providesHomeService = true;
      
      // Handle category filter
      if (category) filters.category = category as string;
      
      const salons = await storage.getSalons(filters);
      res.json(salons);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع الصالونات" });
    }
  });

  app.get("/api/salons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const salon = await storage.getSalonById(id);
      
      if (!salon) {
        return res.status(404).json({ message: "الصالون غير موجود" });
      }
      
      res.json(salon);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع الصالون" });
    }
  });

  // Services API
  app.get("/api/salons/:id/services", async (req, res) => {
    try {
      const salonId = parseInt(req.params.id);
      const { category, isAvailable } = req.query;
      
      const filters: { 
        category?: string, 
        isAvailable?: boolean
      } = {};
      
      if (category) filters.category = category as string;
      if (isAvailable === 'true') filters.isAvailable = true;
      
      const services = await storage.getServices(salonId, filters);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع الخدمات" });
    }
  });

  app.get("/api/salons/:id/featured-services", async (req, res) => {
    try {
      const salonId = parseInt(req.params.id);
      const featuredServices = await storage.getFeaturedServices(salonId);
      res.json(featuredServices);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع الخدمات المميزة" });
    }
  });
  
  // AI Recommendation API
  app.get("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }
    
    try {
      const { salonId, limit = 3, preferences } = req.query;
      const salonIdNum = salonId ? parseInt(salonId as string) : undefined;
      const limitNum = Math.min(parseInt(limit as string) || 3, 5); // Cap at 5 recommendations
      
      // Get user's booking history
      const bookingHistory = await storage.getBookingsByUserId(req.user.id);
      
      // Get available services (filtered by salon if provided)
      let availableServices: Service[] = [];
      if (salonIdNum) {
        availableServices = await storage.getServices(salonIdNum);
      } else {
        // Get services from featured or popular salons
        const salons = await storage.getSalons({ city: req.user.city as string });
        
        // Get services from top 3 salons
        if (salons.length > 0) {
          const topSalons = salons.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
          const servicesPromises = topSalons.map(salon => storage.getServices(salon.id));
          const allSalonServices = await Promise.all(servicesPromises);
          availableServices = allSalonServices.flat();
        }
      }
      
      if (availableServices.length === 0) {
        return res.status(404).json({ 
          message: "لا توجد خدمات متاحة للتوصية",
          recommendations: []
        });
      }
      
      // Parse preferences if provided
      const userPrefs = preferences 
        ? (typeof preferences === 'string' ? [preferences] : preferences as string[])
        : undefined;
      
      // Get recommendations from AI
      const recommendationRequest = {
        user: req.user,
        bookingHistory,
        salonId: salonIdNum,
        preferences: userPrefs,
        gender: req.user.gender as string,
        city: req.user.city as string
      };
      
      const recommendations = await getRecommendations(
        recommendationRequest, 
        availableServices, 
        limitNum
      );
      
      // Enrich recommendations with full service details
      const enrichedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          const service = await storage.getServiceById(rec.serviceId);
          return {
            ...rec,
            service
          };
        })
      );
      
      res.json({
        recommendations: enrichedRecommendations,
        message: "تم إنشاء التوصيات بنجاح"
      });
    } catch (error: any) {
      console.error("Error generating recommendations:", error.message);
      res.status(500).json({ 
        message: "حدث خطأ أثناء إنشاء التوصيات",
        error: error.message
      });
    }
  });
  
  // Get AI-generated welcome message with recommendations
  app.get("/api/user/welcome-message", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }
    
    try {
      // Get user's booking history
      const bookingHistory = await storage.getBookingsByUserId(req.user.id);
      
      // Get available services from featured salons
      const salons = await storage.getSalons({ city: req.user.city as string });
      let availableServices: Service[] = [];
      
      if (salons.length > 0) {
        const topSalons = salons.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
        const servicesPromises = topSalons.map(salon => storage.getServices(salon.id));
        const allSalonServices = await Promise.all(servicesPromises);
        availableServices = allSalonServices.flat();
      }
      
      // Get recommendations
      const recommendationRequest = {
        user: req.user,
        bookingHistory,
        gender: req.user.gender as string,
        city: req.user.city as string
      };
      
      const recommendations = await getRecommendations(
        recommendationRequest, 
        availableServices, 
        3
      );
      
      // Generate welcome message with recommendations
      const welcomeMessage = await generateWelcomeMessage(req.user, recommendations);
      
      res.json({
        message: welcomeMessage,
        recommendations
      });
    } catch (error: any) {
      console.error("Error generating welcome message:", error.message);
      res.status(500).json({ 
        message: "حدث خطأ أثناء إنشاء رسالة الترحيب",
        error: error.message
      });
    }
  });
  
  // Suggest appointment times based on service and user preferences
  app.get("/api/bookings/suggest-times/:serviceId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }
    
    try {
      const serviceId = parseInt(req.params.serviceId);
      const service = await storage.getServiceById(serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "الخدمة غير موجودة" });
      }
      
      // Get AI-suggested appointment times
      const suggestedTimes = await suggestAppointmentTimes(service, req.user);
      
      res.json({
        suggestedTimes,
        service
      });
    } catch (error: any) {
      console.error("Error suggesting appointment times:", error.message);
      res.status(500).json({ 
        message: "حدث خطأ أثناء اقتراح أوقات الحجز",
        error: error.message
      });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getServiceById(id);
      
      if (!service) {
        return res.status(404).json({ message: "الخدمة غير موجودة" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع الخدمة" });
    }
  });
  
  // Endpoint to add test services to all salons
  app.post("/api/admin/add-test-services", async (req, res) => {
    try {
      await addTestServices();
      res.status(201).json({ message: "تم إضافة الخدمات التجريبية بنجاح" });
    } catch (error: any) {
      console.error("Error adding test services:", error.message);
      res.status(500).json({ 
        message: "حدث خطأ أثناء إضافة الخدمات التجريبية",
        error: error.message 
      });
    }
  });
  
  // Debug endpoint to check all services
  app.get("/api/admin/debug-services", async (req, res) => {
    try {
      const allServices = await storage.debugServices();
      const salonId = req.query.salonId ? parseInt(req.query.salonId as string) : undefined;
      
      const result = {
        totalServices: allServices.length,
        servicesBySalon: {} as Record<number, number>,
        services: salonId ? allServices.filter(s => s.salonId === salonId) : allServices
      };
      
      // Count services by salon
      allServices.forEach(service => {
        if (!result.servicesBySalon[service.salonId]) {
          result.servicesBySalon[service.salonId] = 0;
        }
        result.servicesBySalon[service.salonId]++;
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error debugging services:", error.message);
      res.status(500).json({ 
        message: "حدث خطأ أثناء جلب بيانات الخدمات للتصحيح",
        error: error.message 
      });
    }
  });

  // Bookings API
  app.get("/api/bookings/my", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }
    
    try {
      const bookings = await storage.getBookingsByUserId(req.user.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع الحجوزات" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }
    
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: "بيانات الحجز غير صالحة" });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "حالة الحجز غير صالحة" });
      }
      
      const booking = await storage.updateBookingStatus(id, status);
      
      if (!booking) {
        return res.status(404).json({ message: "الحجز غير موجود" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء تحديث حالة الحجز" });
    }
  });

  // Reviews API
  app.get("/api/salons/:id/reviews", async (req, res) => {
    try {
      const salonId = parseInt(req.params.id);
      const reviews = await storage.getReviewsBySalonId(salonId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع التقييمات" });
    }
  });
  
  // Staff API
  app.get("/api/salons/:id/staff", async (req, res) => {
    try {
      const salonId = parseInt(req.params.id);
      const staff = await storage.getStaffBySalonId(salonId);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع الموظفين" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }
    
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "بيانات التقييم غير صالحة" });
    }
  });
  
  // Salon owner API
  app.get("/api/owner/salons", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "salon_owner") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    
    try {
      const salons = await storage.getSalonsByOwnerId(req.user.id);
      res.json(salons);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع الصالونات" });
    }
  });
  
  app.get("/api/owner/bookings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "salon_owner") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    
    try {
      // Get all salons owned by user
      const userSalons = await storage.getSalonsByOwnerId(req.user.id);
      
      if (userSalons.length === 0) {
        return res.json([]);
      }
      
      // Get bookings for all user's salons
      const bookingsPromises = userSalons.map(salon => 
        storage.getBookingsBySalonId(salon.id)
      );
      
      const salonBookings = await Promise.all(bookingsPromises);
      
      // Flatten array of booking arrays
      const allBookings = salonBookings.flat();
      
      res.json(allBookings);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع الحجوزات" });
    }
  });

  // Payment API - Stripe integration with Mada support
  app.post("/api/payment/create-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }
    
    try {
      const { amount, serviceId, bookingDetails } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "المبلغ غير صحيح" });
      }
      
      // Create payment intent with standard payment method types
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to smallest currency unit (halalas)
        currency: "sar", // Saudi Riyal
        payment_method_types: ["card"], // Standard card payments
        metadata: {
          userId: req.user.id.toString(),
          serviceId: serviceId?.toString() || null,
          bookingDetails: JSON.stringify(bookingDetails || {})
        }
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        message: "تم إنشاء عملية الدفع بنجاح"
      });
    } catch (error: any) {
      console.error("Stripe error:", error.message);
      res.status(500).json({ 
        message: "حدث خطأ أثناء إنشاء عملية الدفع",
        error: error.message 
      });
    }
  });
  
  app.post("/api/payment/confirm-booking", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }
    
    try {
      const { paymentIntentId, serviceId, bookingDetails } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "معرف عملية الدفع مطلوب" });
      }
      
      // Retrieve payment intent to verify status
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          message: "لم يتم إكمال عملية الدفع بنجاح", 
          paymentStatus: paymentIntent.status 
        });
      }
      
      // Create booking record
      const userId = req.user.id;
      const booking = await storage.createBooking({
        ...bookingDetails,
        userId,
        serviceId: parseInt(serviceId),
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: new Date()
      });
      
      // Record payment transaction
      const paymentTransaction = await storage.createPaymentTransaction({
        userId,
        bookingId: booking.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency || "sar",
        paymentMethod: "card",
        status: "completed",
        paymentGateway: "stripe",
        gatewayTransactionId: paymentIntentId,
        // Skip card details since we don't have access to them in this context
        cardLast4: null,
        createdAt: new Date()
      });
      
      // Add loyalty points for successful booking
      await storage.updateUserLoyaltyPoints(userId, 10);
      
      res.status(201).json({ 
        booking, 
        paymentTransaction,
        message: "تم تأكيد الحجز والدفع بنجاح"
      });
    } catch (error: any) {
      console.error("Payment confirmation error:", error.message);
      res.status(500).json({ 
        message: "حدث خطأ أثناء تأكيد الحجز",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
