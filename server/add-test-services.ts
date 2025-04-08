import { storage } from "./storage";

export async function addTestServices() {
  console.log("Before adding services, services for Salon 4:", await storage.debugServices(4));
  // Add services for Salon ID 2 (Elegance Spa)
  await storage.createService({
    name: "سبا للقدمين",
    nameEn: "Foot Spa",
    description: "علاج متكامل للقدمين مع تقشير وتدليك",
    descriptionEn: "Complete foot treatment with exfoliation and massage",
    price: 150,
    duration: 60,
    category: "spa",
    salonId: 2,
    image: "https://img.freepik.com/free-photo/woman-having-pedicure-treatment-spa_1098-561.jpg",
    featured: true
  });

  await storage.createService({
    name: "ماسك الكولاجين",
    nameEn: "Collagen Mask",
    description: "ماسك غني بالكولاجين لبشرة أكثر شباباً",
    descriptionEn: "Collagen-rich mask for more youthful skin",
    price: 220,
    duration: 45,
    category: "facial",
    salonId: 2,
    image: "https://img.freepik.com/free-photo/woman-having-mask-procedure-beautician_23-2148209004.jpg",
    featured: true
  });

  // Add services for Salon ID 3 (Baron Barber)
  await storage.createService({
    name: "حلاقة شعر احترافية",
    nameEn: "Professional Haircut",
    description: "قص شعر على أحدث الصيحات مع تصفيف",
    descriptionEn: "Haircut with the latest trends and styling",
    price: 100,
    duration: 30,
    category: "haircut",
    salonId: 3,
    image: "https://img.freepik.com/free-photo/handsome-man-barbershop-styling-hair_1157-6329.jpg",
    featured: true
  });

  await storage.createService({
    name: "تنظيف بشرة للرجال",
    nameEn: "Men's Facial",
    description: "تنظيف عميق للبشرة مصمم خصيصاً للرجال",
    descriptionEn: "Deep skin cleansing specially designed for men",
    price: 170,
    duration: 45,
    category: "facial",
    salonId: 3,
    image: "https://img.freepik.com/free-photo/man-having-facial-massage-spa-salon_1157-28053.jpg",
    featured: false
  });

  // Add services for Al-Ahsa salons

  // Salon 4: واحة الجمال (Oasis Beauty)
  await storage.createService({
    name: "قص وتصفيف شعر",
    nameEn: "Haircut and Styling",
    description: "قص الشعر مع التصفيف حسب أحدث الصيحات",
    descriptionEn: "Haircut with styling according to the latest trends",
    price: 120,
    duration: 45,
    category: "haircut",
    salonId: 4,
    image: "https://img.freepik.com/free-photo/hairdresser-doing-hairstyle-young-woman-beauty-salon_1303-26883.jpg",
    featured: true
  });
  
  await storage.createService({
    name: "حمام كريم",
    nameEn: "Cream Bath",
    description: "علاج مغذي للشعر مع تدليك فروة الرأس",
    descriptionEn: "Nourishing hair treatment with scalp massage",
    price: 180,
    duration: 60,
    category: "haircare",
    salonId: 4,
    image: "https://img.freepik.com/free-photo/woman-getting-treatment-hairdresser-shop_23-2149230873.jpg",
    featured: true
  });
  
  // Salon 5: أنامل الإحساء (Anamil Al-Ahsa)
  await storage.createService({
    name: "مانيكير وباديكير",
    nameEn: "Manicure & Pedicure",
    description: "عناية كاملة بالأظافر مع طلاء",
    descriptionEn: "Complete nail care with polish",
    price: 150,
    duration: 90,
    category: "nails",
    salonId: 5,
    image: "https://img.freepik.com/free-photo/manicurist-master-makes-manicure-woman-s-hands_186202-5051.jpg",
    featured: true
  });
  
  await storage.createService({
    name: "علاج البشرة",
    nameEn: "Facial Treatment",
    description: "تنظيف وترطيب البشرة مع مستحضرات طبيعية",
    descriptionEn: "Skin cleansing and moisturizing with natural products",
    price: 200,
    duration: 60,
    category: "facial",
    salonId: 5,
    image: "https://img.freepik.com/free-photo/beautiful-girl-standing-beauty-salon_1157-28763.jpg",
    featured: false
  });
  
  // Salon 6: نور الجمال (Noor Beauty)
  await storage.createService({
    name: "مكياج عروس",
    nameEn: "Bridal Makeup",
    description: "مكياج كامل للعروس يناسب جميع الأذواق",
    descriptionEn: "Complete bridal makeup for all tastes",
    price: 500,
    duration: 120,
    category: "makeup",
    salonId: 6,
    image: "https://img.freepik.com/free-photo/beautiful-bride-posing-wedding-dress_1328-3542.jpg",
    featured: true
  });
  
  await storage.createService({
    name: "تسريحة شعر",
    nameEn: "Hair Styling",
    description: "تسريحات للمناسبات والحفلات",
    descriptionEn: "Hairstyles for occasions and parties",
    price: 250,
    duration: 60,
    category: "haircut",
    salonId: 6,
    image: "https://img.freepik.com/free-photo/portrait-beautiful-face-young-woman-with-long-brown-hair_186202-4331.jpg",
    featured: true
  });
  
  // Salon 7: سبا الواحة (Oasis Spa)
  await storage.createService({
    name: "مساج استرخائي",
    nameEn: "Relaxation Massage",
    description: "مساج كامل للجسم للاسترخاء وتخفيف التوتر",
    descriptionEn: "Full body massage for relaxation and stress relief",
    price: 300,
    duration: 90,
    category: "massage",
    salonId: 7,
    image: "https://img.freepik.com/free-photo/masseur-doing-massage-woman-body-spa-salon_186202-2898.jpg",
    featured: true
  });
  
  await storage.createService({
    name: "حمام مغربي",
    nameEn: "Moroccan Bath",
    description: "تقشير وتنظيف للجسم على الطريقة المغربية",
    descriptionEn: "Body exfoliation and cleansing in Moroccan style",
    price: 280,
    duration: 80,
    category: "spa",
    salonId: 7,
    image: "https://img.freepik.com/free-photo/woman-relaxing-spa_144627-16223.jpg",
    featured: false
  });
  
  console.log("After adding services, services for Salon 4:", await storage.debugServices(4));
}