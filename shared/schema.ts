import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  role: text("role").notNull().default("customer"),
  gender: text("gender"), // male, female, other
  city: text("city"), // User's city for location-based recommendations
  preferences: text("preferences"), // comma-separated: female_only, male_only, private_rooms, etc.
  profileImage: text("profile_image"),
  privacySettings: json("privacy_settings"), // JSON for detailed privacy configuration
  loyaltyPoints: integer("loyalty_points").default(0), // For loyalty program
  membershipType: text("membership_type").default("standard"), // standard, premium, vip
  notificationPreferences: json("notification_preferences"), // Email, SMS, push notification preferences
  savedAddresses: json("saved_addresses"), // For at-home services
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const salons = pgTable("salons", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description"),
  descriptionEn: text("description_en"),
  address: text("address").notNull(),
  addressEn: text("address_en"),
  city: text("city").notNull(),
  cityEn: text("city_en"),
  district: text("district"),
  districtEn: text("district_en"),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  logo: text("logo"),
  coverImage: text("cover_image"),
  images: json("images"), // Array of image URLs
  gender: text("gender").notNull(), // female_only, male_only, both
  amenities: text("amenities"), // Comma-separated: wifi, parking, coffee, etc.
  categories: text("categories"), // Comma-separated categories offered
  hasPrivateRooms: boolean("has_private_rooms").default(false),
  hasLadiesSection: boolean("has_ladies_section").default(false),
  hasFemaleStaffOnly: boolean("has_female_staff_only").default(false),
  providesHomeService: boolean("provides_home_service").default(false),
  verified: boolean("verified").default(false),
  isActive: boolean("is_active").default(true),
  openingHours: json("opening_hours"), // Structured opening hours by day
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  socialMediaLinks: json("social_media_links"), // JSON of social media links
  latitude: real("latitude"),
  longitude: real("longitude"),
  avgWaitTime: integer("avg_wait_time"), // Average wait time in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").notNull().references(() => salons.id),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description"),
  descriptionEn: text("description_en"),
  price: real("price").notNull(),
  discountedPrice: real("discounted_price"),
  category: text("category").notNull(),
  categoryEn: text("category_en"),
  duration: integer("duration").notNull(), // in minutes
  featured: boolean("featured").default(false),
  image: text("image"),
  galleryImages: json("gallery_images"), // Multiple images of the service
  isAvailable: boolean("is_available").default(true),
  minBookingNotice: integer("min_booking_notice").default(60), // Minutes required in advance
  maxConcurrentBookings: integer("max_concurrent_bookings").default(1), // How many can be booked at once
  isSeasonal: boolean("is_seasonal").default(false), // For seasonal offers
  isPromoted: boolean("is_promoted").default(false), // For promoted services
  requiresConsultation: boolean("requires_consultation").default(false), // If consultation is required before booking
  dynamicPricing: json("dynamic_pricing"), // Rules for dynamic pricing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  salonId: integer("salon_id").notNull().references(() => salons.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(), // In minutes
  staffId: integer("staff_id"), // Optional staff assignment
  totalPrice: real("total_price").notNull(),
  discountApplied: real("discount_applied").default(0),
  loyaltyPointsEarned: integer("loyalty_points_earned").default(0),
  loyaltyPointsRedeemed: integer("loyalty_points_redeemed").default(0),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"),
  isPrivateRoom: boolean("is_private_room").default(false),
  isHomeService: boolean("is_home_service").default(false),
  homeAddress: json("home_address"), // For at-home services
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  checkInTime: timestamp("check_in_time"),
  serviceStartTime: timestamp("service_start_time"),
  serviceEndTime: timestamp("service_end_time"),
  isAnonymous: boolean("is_anonymous").default(false), // For privacy
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  salonId: integer("salon_id").notNull().references(() => salons.id),
  serviceId: integer("service_id").references(() => services.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  rating: real("rating").notNull(),
  comment: text("comment"),
  isAnonymous: boolean("is_anonymous").default(false), // For privacy
  isVerified: boolean("is_verified").default(false), // Verified purchase
  images: json("images"), // Review images
  staffRating: real("staff_rating"), // Separate rating for staff
  privacyRating: real("privacy_rating"), // Rating for privacy compliance
  cleanlinesRating: real("cleanlines_rating"), // Rating for cleanliness
  valueRating: real("value_rating"), // Rating for value for money
  ownerResponse: text("owner_response"), // Salon owner response
  ownerResponseDate: timestamp("owner_response_date"),
  isHidden: boolean("is_hidden").default(false), // Admin can hide inappropriate reviews
  date: timestamp("date").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Staff table for salon staff members
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").notNull().references(() => salons.id),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  gender: text("gender").notNull(), // male, female
  specialization: text("specialization"), // hair, makeup, nails, etc.
  bio: text("bio"),
  bioEn: text("bio_en"),
  image: text("image"),
  rating: real("rating").default(5),
  isAvailable: boolean("is_available").default(true),
  workingHours: json("working_hours"), // JSON of working hours
  createdAt: timestamp("created_at").defaultNow(),
});

// Promotions for discounts and special offers
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id), // Optional, if null applies to all salons
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description"),
  descriptionEn: text("description_en"),
  code: text("code").unique(), // Promo code
  discountType: text("discount_type").notNull(), // percentage, fixed_amount
  discountValue: real("discount_value").notNull(),
  minSpend: real("min_spend").default(0),
  maxDiscount: real("max_discount"), // Cap on discount amount
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  usageLimit: integer("usage_limit"), // Total number of times it can be used
  perUserLimit: integer("per_user_limit").default(1), // Times per user
  applicableServices: json("applicable_services"), // Array of service IDs or categories
  userGroups: json("user_groups"), // Who can use this promo: new, existing, vip
  createdAt: timestamp("created_at").defaultNow(),
});

// Membership tiers table
export const membershipTiers = pgTable("membership_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description"),
  descriptionEn: text("description_en"),
  pointsThreshold: integer("points_threshold").notNull(), // Points needed for this tier
  discountPercentage: real("discount_percentage").default(0),
  perks: json("perks"), // Array of perks
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment transactions
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  currency: text("currency").default("SAR"),
  paymentMethod: text("payment_method").notNull(), // mada, visa, apple_pay, cash
  paymentGateway: text("payment_gateway"), // stripe, hyperpay, etc.
  gatewayTransactionId: text("gateway_transaction_id"),
  status: text("status").notNull(), // success, failed, pending
  errorMessage: text("error_message"),
  cardLast4: text("card_last4"),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
  loyaltyPoints: true,
});

export const insertSalonSchema = createInsertSchema(salons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
  avgWaitTime: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  checkInTime: true,
  serviceStartTime: true,
  serviceEndTime: true,
  reminderSent: true,
  loyaltyPointsEarned: true,
  loyaltyPointsRedeemed: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  date: true,
  updatedAt: true,
  ownerResponse: true,
  ownerResponseDate: true,
  isHidden: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  rating: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
});

export const insertMembershipTierSchema = createInsertSchema(membershipTiers).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  receiptUrl: true,
  errorMessage: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSalon = z.infer<typeof insertSalonSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type InsertMembershipTier = z.infer<typeof insertMembershipTierSchema>;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;

export type User = typeof users.$inferSelect;
export type Salon = typeof salons.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type MembershipTier = typeof membershipTiers.$inferSelect;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

// Additional schemas for login
export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
