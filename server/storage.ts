import { 
  users, salons, services, bookings, reviews, 
  staff, promotions, membershipTiers, paymentTransactions 
} from "@shared/schema";
import type { 
  User, InsertUser, Salon, InsertSalon, 
  Service, InsertService, Booking, InsertBooking,
  Review, InsertReview, Staff, InsertStaff,
  Promotion, InsertPromotion, MembershipTier, InsertMembershipTier,
  PaymentTransaction, InsertPaymentTransaction
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
type SessionStore = ReturnType<typeof createMemoryStore>;

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserLoyaltyPoints(id: number, points: number): Promise<User | undefined>;
  updateUserMembershipType(id: number, membershipType: string): Promise<User | undefined>;
  
  // Salon operations
  getSalons(filters?: { 
    gender?: string, 
    city?: string, 
    hasPrivateRooms?: boolean, 
    hasFemaleStaffOnly?: boolean,
    providesHomeService?: boolean,
    category?: string 
  }): Promise<Salon[]>;
  getSalonById(id: number): Promise<Salon | undefined>;
  getSalonsByOwnerId(ownerId: number): Promise<Salon[]>;
  createSalon(salon: InsertSalon): Promise<Salon>;
  updateSalon(id: number, salon: Partial<InsertSalon>): Promise<Salon | undefined>;
  
  // Service operations
  getServices(salonId: number, filters?: { category?: string, isAvailable?: boolean }): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  getFeaturedServices(salonId: number): Promise<Service[]>;
  getPromotedServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  
  // Booking operations
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  getBookingsBySalonId(salonId: number): Promise<Booking[]>;
  getBookingsByServiceId(serviceId: number): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  cancelBooking(id: number): Promise<Booking | undefined>;
  
  // Review operations
  getReviewsBySalonId(salonId: number): Promise<Review[]>;
  getReviewsByUserId(userId: number): Promise<Review[]>;
  getReviewById(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  respondToReview(id: number, response: string): Promise<Review | undefined>;
  
  // Staff operations
  getStaffBySalonId(salonId: number): Promise<Staff[]>;
  getStaffById(id: number): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  
  // Promotion operations
  getPromotions(filters?: { isActive?: boolean, salonId?: number }): Promise<Promotion[]>;
  getPromotionById(id: number): Promise<Promotion | undefined>;
  getPromotionByCode(code: string): Promise<Promotion | undefined>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion | undefined>;
  
  // Membership operations
  getMembershipTiers(): Promise<MembershipTier[]>;
  getMembershipTierById(id: number): Promise<MembershipTier | undefined>;
  getMembershipTierByPointsThreshold(points: number): Promise<MembershipTier | undefined>;
  createMembershipTier(tier: InsertMembershipTier): Promise<MembershipTier>;
  
  // Payment operations
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  getPaymentTransactionsByUserId(userId: number): Promise<PaymentTransaction[]>;
  getPaymentTransactionsByBookingId(bookingId: number): Promise<PaymentTransaction[]>;
  
  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private salons: Map<number, Salon>;
  private services: Map<number, Service>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private staff: Map<number, Staff>;
  private promotions: Map<number, Promotion>;
  private membershipTiers: Map<number, MembershipTier>;
  private paymentTransactions: Map<number, PaymentTransaction>;
  
  sessionStore: SessionStore;
  
  private userIdCounter: number;
  private salonIdCounter: number;
  private serviceIdCounter: number;
  private bookingIdCounter: number;
  private reviewIdCounter: number;
  private staffIdCounter: number;
  private promotionIdCounter: number;
  private membershipTierIdCounter: number;
  private paymentTransactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.salons = new Map();
    this.services = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.staff = new Map();
    this.promotions = new Map();
    this.membershipTiers = new Map();
    this.paymentTransactions = new Map();
    
    this.userIdCounter = 1;
    this.salonIdCounter = 1;
    this.serviceIdCounter = 1;
    this.bookingIdCounter = 1;
    this.reviewIdCounter = 1;
    this.staffIdCounter = 1;
    this.promotionIdCounter = 1;
    this.membershipTierIdCounter = 1;
    this.paymentTransactionIdCounter = 1;
    
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
    
    // Add Al-Ahsa Salons
    this.createSalon({
      name: "واحة الجمال",
      nameEn: "Oasis Beauty Salon",
      description: "صالون تجميل نسائي متميز يقدم جميع خدمات التجميل والعناية بالبشرة والشعر بأحدث التقنيات وعلى أيدي خبيرات متخصصات",
      descriptionEn: "A distinguished women's beauty salon offering all beauty, skin, and hair care services with the latest techniques by specialized experts",
      address: "شارع الظهران، حي المبرز، الأحساء",
      addressEn: "Dhahran Street, Al Mubarraz District, Al-Ahsa",
      city: "الأحساء",
      cityEn: "Al-Ahsa",
      phoneNumber: "+966554789123",
      email: "oasisbeauty@example.com",
      gender: "female_only",
      openingHours: "9:00 - 22:00",
      latitude: 25.4167,
      longitude: 49.5833,
      ownerId: 3,
      logo: "https://img.freepik.com/premium-vector/beauty-hair-salon-logo-design_139869-144.jpg",
      coverImage: "https://img.freepik.com/premium-photo/beauty-salon-interior-makeup-manicure-hairdressing-services_265223-33263.jpg",
      images: ["https://img.freepik.com/free-photo/woman-beauty-salon-getting-makeup-done_1303-12917.jpg", "https://img.freepik.com/free-photo/hairdresser-cutting-woman-s-hair-beauty-salon_1303-26263.jpg"],
      amenities: "wifi,parking,coffee,prayer_area,kids_play_area",
      categories: "hair,makeup,nails,facial,spa,bridal,henna",
      isActive: true
    });
    
    this.createSalon({
      name: "الأصالة للحلاقة الرجالية",
      nameEn: "Al Asala Men's Salon",
      description: "صالون حلاقة رجالي تقليدي يقدم خدمات الحلاقة وتهذيب اللحية والعناية بالبشرة مع لمسة من التراث السعودي الأصيل",
      descriptionEn: "A traditional men's barber shop offering haircuts, beard trimming, and skin care services with a touch of authentic Saudi heritage",
      address: "طريق الملك فهد، حي الهفوف، الأحساء",
      addressEn: "King Fahd Road, Al Hofuf District, Al-Ahsa",
      city: "الأحساء",
      cityEn: "Al-Ahsa",
      phoneNumber: "+966556789012",
      email: "alasala@example.com",
      gender: "male_only",
      openingHours: "10:00 - 23:00",
      latitude: 25.3783,
      longitude: 49.5869,
      ownerId: 3,
      logo: "https://img.freepik.com/premium-vector/barber-pole-vintage-barber-shop-logo_97843-206.jpg",
      coverImage: "https://img.freepik.com/premium-photo/contemporary-barber-shop-salon-with-modern-hairdressing-equipment-tools_613961-14457.jpg",
      images: ["https://img.freepik.com/premium-photo/male-barber-cutting-client-s-hair-barber-shop_97800-344.jpg", "https://img.freepik.com/free-photo/man-barbershop-salon-doing-hairstyle_1303-20932.jpg"],
      amenities: "wifi,parking,coffee,prayer_area,tv",
      categories: "haircut,beard,skin_care,traditional_shave",
      isActive: true
    });
    
    this.createSalon({
      name: "سيدرا سبا",
      nameEn: "Sidra Spa & Beauty",
      description: "مركز سبا وتجميل متكامل للنساء يقدم علاجات مميزة للوجه والجسم والشعر في بيئة فاخرة وهادئة",
      descriptionEn: "A comprehensive spa and beauty center for women offering premium treatments for face, body, and hair in a luxurious and tranquil environment",
      address: "شارع الأمير محمد بن فهد، حي العزيزية، الأحساء",
      addressEn: "Prince Mohammed Bin Fahd Street, Al Aziziyah District, Al-Ahsa",
      city: "الأحساء",
      cityEn: "Al-Ahsa",
      phoneNumber: "+966557890123",
      email: "sidraspa@example.com",
      gender: "female_only",
      openingHours: "10:00 - 22:00",
      latitude: 25.4000,
      longitude: 49.6000,
      ownerId: 3,
      logo: "https://img.freepik.com/premium-vector/luxury-spa-logo-design_139869-88.jpg",
      coverImage: "https://img.freepik.com/premium-photo/beauty-salon-interior-composition-flowers-treatment-room_93675-128458.jpg",
      images: ["https://img.freepik.com/free-photo/top-view-woman-getting-spa-treatment_23-2149559158.jpg", "https://img.freepik.com/free-photo/massage-room-with-candles-flowers_144627-46197.jpg"],
      amenities: "wifi,parking,refreshments,steam_room,sauna,jacuzzi,prayer_area",
      categories: "spa,massage,facial,body_treatments,hair,makeup",
      isActive: true
    });
    
    this.createSalon({
      name: "أريج للتجميل",
      nameEn: "Areej Beauty Center",
      description: "مركز تجميل متكامل يقدم خدمات العناية بالبشرة والشعر والأظافر وخدمات المكياج بأحدث المنتجات وأفضل الخبرات",
      descriptionEn: "A comprehensive beauty center offering skin care, hair, nails, and makeup services with the latest products and best expertise",
      address: "شارع الخليج، حي المطيرفي، الأحساء",
      addressEn: "Al Khaleej Street, Al Mutairfi District, Al-Ahsa",
      city: "الأحساء",
      cityEn: "Al-Ahsa",
      phoneNumber: "+966558901234",
      email: "areejbeauty@example.com",
      gender: "female_only",
      openingHours: "9:00 - 21:00",
      latitude: 25.3950,
      longitude: 49.5930,
      ownerId: 3,
      logo: "https://img.freepik.com/premium-vector/creative-beauty-logo-design-branding_96318-358.jpg",
      coverImage: "https://img.freepik.com/premium-photo/female-hairdresser-working-beauty-salon_85574-3751.jpg",
      images: ["https://img.freepik.com/free-photo/nail-salon-concept-with-woman-doing-her-manicure_23-2149230141.jpg", "https://img.freepik.com/free-photo/beauty-salon-implements-beautiful-nails_186202-3350.jpg"],
      amenities: "wifi,parking,refreshments,prayer_area",
      categories: "hair,makeup,nails,facial,bridal",
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
    const user: User = { 
      ...insertUser,
      role: insertUser.role || 'customer', // Ensure role is always set
      gender: insertUser.gender || null,
      preferences: insertUser.preferences || null,
      profileImage: insertUser.profileImage || null,
      id, 
      createdAt: now,
      loyaltyPoints: 0,
      lastLoginAt: null 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserLoyaltyPoints(id: number, points: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const newPoints = (user.loyaltyPoints || 0) + points;
    const updatedUser = { ...user, loyaltyPoints: newPoints };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserMembershipType(id: number, membershipType: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, membershipType };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Salon operations
  async getSalons(filters?: { 
    gender?: string, 
    city?: string, 
    hasPrivateRooms?: boolean, 
    hasFemaleStaffOnly?: boolean,
    providesHomeService?: boolean,
    category?: string 
  }): Promise<Salon[]> {
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
      
      if (filters.hasPrivateRooms) {
        salons = salons.filter(salon => salon.hasPrivateRooms);
      }
      
      if (filters.hasFemaleStaffOnly) {
        salons = salons.filter(salon => salon.hasFemaleStaffOnly);
      }
      
      if (filters.providesHomeService) {
        salons = salons.filter(salon => salon.providesHomeService);
      }
      
      if (filters.category) {
        salons = salons.filter(salon => 
          salon.categories?.includes(filters.category || '')
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
  async getServices(salonId: number, filters?: { category?: string, isAvailable?: boolean }): Promise<Service[]> {
    let services = Array.from(this.services.values()).filter(
      service => service.salonId === salonId
    );
    
    if (filters) {
      if (filters.category) {
        services = services.filter(service => service.category === filters.category);
      }
      
      if (filters.isAvailable !== undefined) {
        services = services.filter(service => service.isAvailable === filters.isAvailable);
      }
    }
    
    return services;
  }
  
  async getServiceById(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getFeaturedServices(salonId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      service => service.salonId === salonId && service.featured
    );
  }
  
  async getPromotedServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      service => service.isPromoted
    );
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const now = new Date();
    const service: Service = { 
      ...insertService, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.services.set(id, service);
    return service;
  }
  
  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const now = new Date();
    const updatedService = { 
      ...service, 
      ...serviceUpdate,
      updatedAt: now 
    };
    this.services.set(id, updatedService);
    return updatedService;
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
  
  async getBookingsByServiceId(serviceId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.serviceId === serviceId
    );
  }
  
  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const now = new Date();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: now,
      updatedAt: now,
      status: insertBooking.status || 'pending',
      loyaltyPointsEarned: 0,
      loyaltyPointsRedeemed: 0,
      reminderSent: false,
      isRated: false,
      isAnonymous: insertBooking.isAnonymous || false
    };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const now = new Date();
    const updatedBooking = { 
      ...booking, 
      status,
      updatedAt: now
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async cancelBooking(id: number): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const now = new Date();
    const canceledBooking = { 
      ...booking, 
      status: 'canceled',
      updatedAt: now,
      canceledAt: now
    };
    this.bookings.set(id, canceledBooking);
    return canceledBooking;
  }
  
  // Review operations
  async getReviewsBySalonId(salonId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.salonId === salonId
    );
  }
  
  async getReviewsByUserId(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.userId === userId
    );
  }
  
  async getReviewById(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = { 
      ...insertReview, 
      id, 
      date: now,
      updatedAt: now,
      ownerResponse: null,
      ownerResponseDate: null,
      isHidden: false
    };
    this.reviews.set(id, review);
    
    // Update salon rating
    this.updateSalonRating(insertReview.salonId);
    
    // Update booking if this review is for a booking
    if (insertReview.bookingId) {
      const booking = this.bookings.get(insertReview.bookingId);
      if (booking) {
        const updatedBooking = { ...booking, isRated: true };
        this.bookings.set(booking.id, updatedBooking);
      }
    }
    
    return review;
  }
  
  async respondToReview(id: number, response: string): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const now = new Date();
    const updatedReview = { 
      ...review, 
      ownerResponse: response,
      ownerResponseDate: now,
      updatedAt: now
    };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }
  
  // Staff operations
  async getStaffBySalonId(salonId: number): Promise<Staff[]> {
    return Array.from(this.staff.values()).filter(
      staff => staff.salonId === salonId
    );
  }
  
  async getStaffById(id: number): Promise<Staff | undefined> {
    return this.staff.get(id);
  }
  
  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.staffIdCounter++;
    const now = new Date();
    const staff: Staff = { 
      ...insertStaff, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.staff.set(id, staff);
    return staff;
  }
  
  async updateStaff(id: number, staffUpdate: Partial<InsertStaff>): Promise<Staff | undefined> {
    const staff = this.staff.get(id);
    if (!staff) return undefined;
    
    const now = new Date();
    const updatedStaff = { 
      ...staff, 
      ...staffUpdate,
      updatedAt: now 
    };
    this.staff.set(id, updatedStaff);
    return updatedStaff;
  }
  
  // Promotion operations
  async getPromotions(filters?: { isActive?: boolean, salonId?: number }): Promise<Promotion[]> {
    let promotions = Array.from(this.promotions.values());
    
    if (filters) {
      if (filters.isActive !== undefined) {
        promotions = promotions.filter(promo => promo.isActive === filters.isActive);
      }
      
      if (filters.salonId !== undefined) {
        promotions = promotions.filter(promo => promo.salonId === filters.salonId);
      }
    }
    
    return promotions;
  }
  
  async getPromotionById(id: number): Promise<Promotion | undefined> {
    return this.promotions.get(id);
  }
  
  async getPromotionByCode(code: string): Promise<Promotion | undefined> {
    return Array.from(this.promotions.values()).find(
      promo => promo.code === code
    );
  }
  
  async createPromotion(insertPromotion: InsertPromotion): Promise<Promotion> {
    const id = this.promotionIdCounter++;
    const now = new Date();
    const promotion: Promotion = { 
      ...insertPromotion, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.promotions.set(id, promotion);
    return promotion;
  }
  
  async updatePromotion(id: number, promotionUpdate: Partial<InsertPromotion>): Promise<Promotion | undefined> {
    const promotion = this.promotions.get(id);
    if (!promotion) return undefined;
    
    const now = new Date();
    const updatedPromotion = { 
      ...promotion, 
      ...promotionUpdate,
      updatedAt: now 
    };
    this.promotions.set(id, updatedPromotion);
    return updatedPromotion;
  }
  
  // Membership operations
  async getMembershipTiers(): Promise<MembershipTier[]> {
    return Array.from(this.membershipTiers.values());
  }
  
  async getMembershipTierById(id: number): Promise<MembershipTier | undefined> {
    return this.membershipTiers.get(id);
  }
  
  async getMembershipTierByPointsThreshold(points: number): Promise<MembershipTier | undefined> {
    const tiers = Array.from(this.membershipTiers.values())
      .sort((a, b) => b.pointsThreshold - a.pointsThreshold);
    
    for (const tier of tiers) {
      if (points >= tier.pointsThreshold) {
        return tier;
      }
    }
    
    return undefined;
  }
  
  async createMembershipTier(tier: InsertMembershipTier): Promise<MembershipTier> {
    const id = this.membershipTierIdCounter++;
    const now = new Date();
    const membershipTier: MembershipTier = { 
      ...tier, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.membershipTiers.set(id, membershipTier);
    return membershipTier;
  }
  
  // Payment operations
  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const id = this.paymentTransactionIdCounter++;
    const now = new Date();
    const paymentTransaction: PaymentTransaction = { 
      ...transaction, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.paymentTransactions.set(id, paymentTransaction);
    return paymentTransaction;
  }
  
  async getPaymentTransactionsByUserId(userId: number): Promise<PaymentTransaction[]> {
    return Array.from(this.paymentTransactions.values()).filter(
      transaction => transaction.userId === userId
    );
  }
  
  async getPaymentTransactionsByBookingId(bookingId: number): Promise<PaymentTransaction[]> {
    return Array.from(this.paymentTransactions.values()).filter(
      transaction => transaction.bookingId === bookingId
    );
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
