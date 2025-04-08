import { users, salons, services, bookings, reviews } from "@shared/schema";
import type { 
  User, InsertUser, Salon, InsertSalon, 
  Service, InsertService, Booking, InsertBooking,
  Review, InsertReview 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Salon operations
  getSalons(filters?: { gender?: string, city?: string }): Promise<Salon[]>;
  getSalonById(id: number): Promise<Salon | undefined>;
  getSalonsByOwnerId(ownerId: number): Promise<Salon[]>;
  createSalon(salon: InsertSalon): Promise<Salon>;
  updateSalon(id: number, salon: Partial<InsertSalon>): Promise<Salon | undefined>;
  
  // Service operations
  getServices(salonId: number): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  getFeaturedServices(salonId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  // Booking operations
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  getBookingsBySalonId(salonId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Review operations
  getReviewsBySalonId(salonId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private salons: Map<number, Salon>;
  private services: Map<number, Service>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private salonIdCounter: number;
  private serviceIdCounter: number;
  private bookingIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.users = new Map();
    this.salons = new Map();
    this.services = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    
    this.userIdCounter = 1;
    this.salonIdCounter = 1;
    this.serviceIdCounter = 1;
    this.bookingIdCounter = 1;
    this.reviewIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with demo data
    this.initializeData();
  }
  
  private initializeData() {
    // Add admin user
    this.createUser({
      username: "admin",
      password: "admin_password_hash",
      name: "Admin",
      email: "admin@saloon.com",
      phoneNumber: "+966123456789",
      role: "admin",
      gender: "other",
      preferences: "",
      profileImage: ""
    });
    
    // Add salon owner
    this.createUser({
      username: "salonowner",
      password: "owner_password_hash",
      name: "صاحبة الصالون",
      email: "owner@salon.com",
      phoneNumber: "+966987654321",
      role: "salon_owner",
      gender: "female",
      preferences: "",
      profileImage: ""
    });
    
    // Add regular customer
    this.createUser({
      username: "customer",
      password: "customer_password_hash",
      name: "سارة محمد",
      email: "customer@example.com",
      phoneNumber: "+966555555555",
      role: "customer",
      gender: "female",
      preferences: "female_only",
      profileImage: ""
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Salon operations
  async getSalons(filters?: { gender?: string, city?: string }): Promise<Salon[]> {
    let salons = Array.from(this.salons.values());
    
    if (filters) {
      if (filters.gender) {
        salons = salons.filter(salon => 
          salon.gender === filters.gender || salon.gender === 'both'
        );
      }
      
      if (filters.city) {
        salons = salons.filter(salon => 
          salon.city.toLowerCase() === filters.city?.toLowerCase() ||
          salon.cityEn?.toLowerCase() === filters.city?.toLowerCase()
        );
      }
    }
    
    return salons;
  }
  
  async getSalonById(id: number): Promise<Salon | undefined> {
    return this.salons.get(id);
  }
  
  async getSalonsByOwnerId(ownerId: number): Promise<Salon[]> {
    return Array.from(this.salons.values()).filter(
      salon => salon.ownerId === ownerId
    );
  }
  
  async createSalon(insertSalon: InsertSalon): Promise<Salon> {
    const id = this.salonIdCounter++;
    const now = new Date();
    const salon: Salon = { 
      ...insertSalon, 
      id, 
      rating: 0, 
      reviewCount: 0,
      createdAt: now 
    };
    this.salons.set(id, salon);
    return salon;
  }
  
  async updateSalon(id: number, salonUpdate: Partial<InsertSalon>): Promise<Salon | undefined> {
    const salon = this.salons.get(id);
    if (!salon) return undefined;
    
    const updatedSalon = { ...salon, ...salonUpdate };
    this.salons.set(id, updatedSalon);
    return updatedSalon;
  }
  
  // Service operations
  async getServices(salonId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      service => service.salonId === salonId
    );
  }
  
  async getServiceById(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getFeaturedServices(salonId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      service => service.salonId === salonId && service.featured
    );
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const now = new Date();
    const service: Service = { ...insertService, id, createdAt: now };
    this.services.set(id, service);
    return service;
  }
  
  // Booking operations
  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.userId === userId
    );
  }
  
  async getBookingsBySalonId(salonId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.salonId === salonId
    );
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const now = new Date();
    const booking: Booking = { ...insertBooking, id, createdAt: now };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  // Review operations
  async getReviewsBySalonId(salonId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.salonId === salonId
    );
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = { ...insertReview, id, date: now };
    this.reviews.set(id, review);
    
    // Update salon rating
    this.updateSalonRating(insertReview.salonId);
    
    return review;
  }
  
  private async updateSalonRating(salonId: number) {
    const salon = await this.getSalonById(salonId);
    if (!salon) return;
    
    const reviews = await this.getReviewsBySalonId(salonId);
    if (reviews.length === 0) return;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const updatedSalon = { 
      ...salon, 
      rating: parseFloat(averageRating.toFixed(1)), 
      reviewCount: reviews.length 
    };
    
    this.salons.set(salonId, updatedSalon);
  }
}

export const storage = new MemStorage();
