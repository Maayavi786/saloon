
import { InsertSalon, InsertService, InsertStaff } from "@shared/schema";

export const salonData: InsertSalon[] = [
  {
    name: "صالون لمسة الجمال",
    nameEn: "Glamour Touch Salon",
    description: "صالون نسائي متكامل يقدم خدمات التجميل والعناية بالبشرة",
    descriptionEn: "Complete ladies salon offering beauty and skincare services",
    address: "الهفوف، الأحساء",
    addressEn: "Hofuf, Al Ahsa",
    city: "الأحساء",
    cityEn: "Al-Ahsa",
    district: "الهفوف",
    districtEn: "Hofuf",
    phoneNumber: "050-123-4567",
    email: "info@glamourtouch.com",
    gender: "female_only",
    hasPrivateRooms: true,
    hasFemaleStaffOnly: true,
    providesHomeService: false,
    verified: true,
    ownerId: 1,
    isActive: true,
    socialMediaLinks: { instagram: "@glamourtouch_ahsa" }
  },
  // Add other salons similarly...
];

export const staffData: InsertStaff[] = [
  {
    name: "سارة الحارثي",
    nameEn: "Sarah Al Harthy",
    specialization: "مكياج عرائس وسهرات",
    bio: "متخصصة في مكياج العرائس والمناسبات",
    bioEn: "Specialized in bridal and event makeup",
    gender: "female",
    salonId: 1,
    isAvailable: true
  },
  // Add other staff...
];

export const serviceData: InsertService[] = [
  {
    name: "قص الشعر",
    nameEn: "Haircut",
    description: "قص الشعر مع التصفيف والتجفيف",
    descriptionEn: "Haircut with styling and blow dry",
    price: 150,
    duration: 60,
    category: "hair",
    salonId: 1,
    isAvailable: true
  },
  // Add other services...
];
