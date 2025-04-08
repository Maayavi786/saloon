import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBookingSchema, insertReviewSchema, insertPaymentTransactionSchema } from "@shared/schema";
import Stripe from "stripe";
import { addTestServices } from "./add-test-services";

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
      
      // Create payment intent with Mada as a payment method
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to smallest currency unit (halalas)
        currency: "sar", // Saudi Riyal
        payment_method_types: ["card", "mada"], // Enable both standard cards and Mada cards
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
