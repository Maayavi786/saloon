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
    
    // Add salon owners
    const femaleOwner = this.createUser({
      username: "femaleowner",
      password: "owner_password_hash",
      name: "منيرة العتيبي",
      email: "female.owner@salon.com",
      phoneNumber: "+966987654321",
      role: "salon_owner",
      gender: "female",
      preferences: "",
      profileImage: "https://randomuser.me/api/portraits/women/54.jpg"
    });
    
    const maleOwner = this.createUser({
      username: "maleowner",
      password: "owner_password_hash",
      name: "محمد القحطاني",
      email: "male.owner@salon.com",
      phoneNumber: "+966987654322",
      role: "salon_owner",
      gender: "male",
      preferences: "",
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
    });
    
    // Add regular customers
    this.createUser({
      username: "customer",
      password: "customer_password_hash",
      name: "سارة محمد",
      email: "customer@example.com",
      phoneNumber: "+966555555555",
      role: "customer",
      gender: "female",
      preferences: "female_only",
      profileImage: "https://randomuser.me/api/portraits/women/22.jpg"
    });
    
    this.createUser({
      username: "malecustomer",
      password: "customer_password_hash",
      name: "عبدالله السعيد",
      email: "male.customer@example.com",
      phoneNumber: "+966555555556",
      role: "customer",
      gender: "male",
      preferences: "male_only",
      profileImage: "https://randomuser.me/api/portraits/men/22.jpg"
    });
    
    // Add salons
    const femaleSalon1 = this.createSalon({
      name: "صالون لمسات الجمال",
      nameEn: "Beauty Touches Salon",
      description: "صالون متخصص في الشعر والمكياج مع خبرة أكثر من 10 سنوات",
      descriptionEn: "Specialized salon for hair and makeup with over 10 years of experience",
      address: "شارع الملك فهد، حي العليا، الرياض",
      addressEn: "King Fahd Road, Olaya District, Riyadh",
      city: "الرياض",
      cityEn: "Riyadh",
      phoneNumber: "+966112345678",
      email: "beauty.touches@example.com",
      gender: "female_only",
      openingHours: "9:00 - 21:00",
      latitude: 24.7136,
      longitude: 46.6753,
      ownerId: femaleOwner.id,
      logo: "https://img.freepik.com/premium-vector/luxury-beauty-salon-logo-design_139869-66.jpg",
      coverImage: "https://img.freepik.com/premium-photo/beauty-salon-interior-makeup-manicure-hairdressing-spa-services-beauty-salon-decor_265223-33264.jpg",
      images: ["https://img.freepik.com/free-photo/interior-beauty-salon_1157-1935.jpg", "https://img.freepik.com/premium-photo/modern-hairdressing-salon-interior-generative-ai_786587-12097.jpg"],
      amenities: "wifi,parking,coffee",
      categories: "haircut,makeup,nails,spa",
      isActive: true
    });
    
    const femaleSalon2 = this.createSalon({
      name: "أنيقة سبا",
      nameEn: "Elegance Spa",
      description: "مركز متكامل للعناية بالبشرة والجسم مع أحدث التقنيات",
      descriptionEn: "Integrated center for skin and body care with the latest technologies",
      address: "شارع التحلية، حي الروضة، جدة",
      addressEn: "Tahlia Street, Al Rawdah District, Jeddah",
      city: "جدة",
      cityEn: "Jeddah",
      phoneNumber: "+966622345678",
      email: "elegance.spa@example.com",
      gender: "female_only",
      openingHours: "10:00 - 22:00",
      latitude: 21.5433,
      longitude: 39.1728,
      ownerId: femaleOwner.id,
      logo: "https://img.freepik.com/premium-vector/beauty-cosmetics-logo-design_12454-5055.jpg",
      coverImage: "https://img.freepik.com/premium-photo/interior-beauty-salon-with-furniture-supplies_176697-3111.jpg",
      images: ["https://img.freepik.com/premium-photo/inside-beauty-salon-interior-with-working-chair-mirror-other-stuff_95868-1348.jpg", "https://img.freepik.com/premium-photo/interior-modern-beauty-salon_97800-364.jpg"],
      amenities: "wifi,parking,coffee,childcare",
      categories: "facial,spa,massage,bodycare",
      isActive: true
    });
    
    const maleSalon1 = this.createSalon({
      name: "بارون للحلاقة",
      nameEn: "Baron Barber Shop",
      description: "صالون رجالي متميز بأجواء كلاسيكية وخدمات عصرية",
      descriptionEn: "Distinguished men's salon with classic ambiance and modern services",
      address: "شارع العروبة، حي الحمراء، الرياض",
      addressEn: "Al Urubah Road, Al Hamra District, Riyadh",
      city: "الرياض",
      cityEn: "Riyadh",
      phoneNumber: "+966115555678",
      email: "baron.barber@example.com",
      gender: "male_only",
      openingHours: "8:00 - 23:00",
      latitude: 24.7276,
      longitude: 46.6977,
      ownerId: maleOwner.id,
      logo: "https://img.freepik.com/premium-vector/vintage-barbershop-logo-barber-pole-vintage-red-blue-stripes-emblem_500213-71.jpg",
      coverImage: "https://img.freepik.com/premium-photo/interior-barber-shop-with-black-leather-chairs-mirror-with-backlight-brick-walls-with-wallpaper-wooden-columns-dark-floor-classic-american-barbershop-interior_613961-14453.jpg",
      images: ["https://img.freepik.com/free-photo/client-doing-hair-cut-barber-shop-salon_1303-20861.jpg", "https://img.freepik.com/premium-photo/barbershop-interior-with-several-work-spaces-shelves-with-cosmetics-men_97800-1051.jpg"],
      amenities: "wifi,parking,coffee,tv",
      categories: "haircut,shave,facial,massage",
      isActive: true
    });
    
    // Add services
    // Female salon services
    this.createService({
      name: "قص شعر",
      nameEn: "Haircut",
      description: "قص الشعر مع غسيل وتجفيف",
      descriptionEn: "Haircut with wash and blow dry",
      price: 150,
      duration: 45,
      category: "haircut",
      salonId: femaleSalon1.id,
      image: "https://img.freepik.com/free-photo/closeup-hairdresser-cutting-hair-young-woman-beauty-salon_186202-7967.jpg",
      featured: true
    });
    
    this.createService({
      name: "صبغ شعر",
      nameEn: "Hair Coloring",
      description: "صبغ الشعر بالكامل مع اختيار الألوان المناسبة",
      descriptionEn: "Full hair coloring with suitable color selection",
      price: 300,
      duration: 120,
      category: "haircut",
      salonId: femaleSalon1.id,
      image: "https://img.freepik.com/free-photo/hairdresser-female-hands-hold-comb-scissors-make-haircut-salon_186202-4704.jpg",
      featured: false
    });
    
    this.createService({
      name: "مكياج سهرة",
      nameEn: "Evening Makeup",
      description: "مكياج كامل للمناسبات والسهرات",
      descriptionEn: "Full makeup for occasions and parties",
      price: 250,
      duration: 60,
      category: "makeup",
      salonId: femaleSalon1.id,
      image: "https://img.freepik.com/free-photo/beautician-hands-with-brushes-making-professional-makeup-woman-studio_186202-5259.jpg",
      featured: true
    });
    
    this.createService({
      name: "مانيكير",
      nameEn: "Manicure",
      description: "عناية كاملة بالأظافر مع تلميع",
      descriptionEn: "Complete nail care with polish",
      price: 100,
      duration: 45,
      category: "nails",
      salonId: femaleSalon1.id,
      image: "https://img.freepik.com/free-photo/nail-maintenance-podiatry-salon_23-2149230135.jpg",
      featured: false
    });
    
    this.createService({
      name: "باديكير",
      nameEn: "Pedicure",
      description: "عناية كاملة بأظافر القدم مع تلميع",
      descriptionEn: "Complete foot nail care with polish",
      price: 120,
      duration: 45,
      category: "nails",
      salonId: femaleSalon1.id,
      image: "https://img.freepik.com/free-photo/female-feet-spa-podiatry-salon-concept-moisturizing-pedicure-procedure_482257-2.jpg",
      featured: false
    });
    
    // Spa services
    this.createService({
      name: "تنظيف بشرة عميق",
      nameEn: "Deep Facial Cleaning",
      description: "تنظيف عميق للبشرة مع استخدام المستحضرات المناسبة",
      descriptionEn: "Deep skin cleansing with appropriate products",
      price: 200,
      duration: 60,
      category: "facial",
      salonId: femaleSalon2.id,
      image: "https://img.freepik.com/free-photo/beautician-doing-facial-massage-attractive-woman-beauty-salon_85574-15291.jpg",
      featured: true
    });
    
    this.createService({
      name: "مساج استرخائي",
      nameEn: "Relaxing Massage",
      description: "مساج كامل للجسم للاسترخاء وتخفيف التوتر",
      descriptionEn: "Full body massage for relaxation and stress relief",
      price: 350,
      duration: 90,
      category: "massage",
      salonId: femaleSalon2.id,
      image: "https://img.freepik.com/free-photo/woman-getting-face-massage-spa_1301-3243.jpg",
      featured: true
    });
    
    this.createService({
      name: "حمام مغربي",
      nameEn: "Moroccan Bath",
      description: "تقشير وتنظيف عميق للجسم على الطريقة المغربية",
      descriptionEn: "Deep body exfoliation and cleansing Moroccan style",
      price: 300,
      duration: 120,
      category: "bodycare",
      salonId: femaleSalon2.id,
      image: "https://img.freepik.com/free-photo/spa-concept-with-body-products_23-2147795507.jpg",
      featured: false
    });
    
    // Male salon services
    this.createService({
      name: "قص وتصفيف شعر",
      nameEn: "Haircut and Styling",
      description: "قص وتصفيف الشعر بأحدث صيحات الموضة",
      descriptionEn: "Haircut and styling with the latest fashion trends",
      price: 80,
      duration: 30,
      category: "haircut",
      salonId: maleSalon1.id,
      image: "https://img.freepik.com/free-photo/young-man-barber-shop-trimming-hair_1303-26255.jpg",
      featured: true
    });
    
    this.createService({
      name: "حلاقة ذقن",
      nameEn: "Beard Shave",
      description: "حلاقة الذقن بالموس التقليدي مع ترطيب",
      descriptionEn: "Beard shaving with traditional razor and moisturizing",
      price: 60,
      duration: 30,
      category: "shave",
      salonId: maleSalon1.id,
      image: "https://img.freepik.com/free-photo/hairdresser-cutting-beard-man-barbershop_1303-20953.jpg",
      featured: true
    });
    
    this.createService({
      name: "مساج وجه",
      nameEn: "Facial Massage",
      description: "مساج للوجه مع ماسكات مرطبة للبشرة",
      descriptionEn: "Facial massage with moisturizing masks",
      price: 100,
      duration: 30,
      category: "facial",
      salonId: maleSalon1.id,
      image: "https://img.freepik.com/free-photo/front-view-barber-giving-facial-massage-client_23-2148867774.jpg",
      featured: false
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
