// State Store for HandMade Crochet - Bilingual & Currency Supported
function getCrochetSvg(type, title) {
  // Returns robust inline visual SVG mockups for crochet crafts
  const colors = {
    cardigan: { main: '#c2410c', secondary: '#f5efe6', accent: '#ea580c' },
    handbag: { main: '#f5efe6', secondary: '#78350f', accent: '#b45309' },
    blanket: { main: '#d97706', secondary: '#fef3c7', accent: '#78350f' },
    top: { main: '#047857', secondary: '#f5efe6', accent: '#10b981' }
  };
  const design = colors[type] || colors.cardigan;
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" fill="%23fdf6e2" rx="20"/>
    <pattern id="crochetPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 0 10 Q 5 0, 10 10 T 20 10" fill="none" stroke="%2378350f" stroke-width="0.5" opacity="0.12"/>
      <path d="M 0 20 Q 5 10, 10 20 T 20 20" fill="none" stroke="%2378350f" stroke-width="0.5" opacity="0.12"/>
    </pattern>
    <rect width="400" height="400" fill="url(%23crochetPattern)"/>
    <!-- Artwork representation -->
    ${type === 'cardigan' ? `
      <path d="M 120 100 L 280 100 L 320 220 L 290 230 L 270 160 L 270 300 L 130 300 L 130 160 L 110 230 L 80 220 Z" fill="${design.main}" stroke="%2378350f" stroke-width="3"/>
      <path d="M 200 100 L 200 300" stroke="${design.secondary}" stroke-width="4" stroke-dasharray="8,6"/>
      <circle cx="200" cy="140" r="6" fill="${design.accent}"/>
      <circle cx="200" cy="180" r="6" fill="${design.accent}"/>
      <circle cx="200" cy="220" r="6" fill="${design.accent}"/>
    ` : ''}
    ${type === 'handbag' ? `
      <path d="M 140 160 L 260 160 L 280 280 L 120 280 Z" fill="${design.main}" stroke="%2378350f" stroke-width="3"/>
      <path d="M 160 160 C 160 100, 240 100, 240 160" fill="none" stroke="${design.secondary}" stroke-width="6"/>
      <path d="M 140 160 L 260 160" stroke="${design.accent}" stroke-width="6" stroke-dasharray="10,5"/>
    ` : ''}
    ${type === 'blanket' ? `
      <rect x="100" y="100" width="200" height="200" fill="${design.main}" rx="10" stroke="%2378350f" stroke-width="3"/>
      <!-- Sunflowers -->
      <circle cx="150" cy="150" r="14" fill="${design.accent}"/>
      <circle cx="150" cy="150" r="7" fill="${design.secondary}"/>
      <circle cx="250" cy="150" r="14" fill="${design.accent}"/>
      <circle cx="250" cy="150" r="7" fill="${design.secondary}"/>
      <circle cx="150" cy="250" r="14" fill="${design.accent}"/>
      <circle cx="150" cy="250" r="7" fill="${design.secondary}"/>
      <circle cx="250" cy="250" r="14" fill="${design.accent}"/>
      <circle cx="250" cy="250" r="7" fill="${design.secondary}"/>
    ` : ''}
    ${type === 'top' ? `
      <path d="M 200 110 L 290 260 L 110 260 Z" fill="${design.main}" stroke="%2378350f" stroke-width="3"/>
      <path d="M 200 110 C 200 70, 180 70, 180 70" fill="none" stroke="${design.secondary}" stroke-width="3"/>
      <path d="M 200 110 C 200 70, 220 70, 220 70" fill="none" stroke="${design.secondary}" stroke-width="3"/>
      <path d="M 110 260 L 80 280" stroke="${design.secondary}" stroke-width="3"/>
      <path d="M 290 260 L 320 280" stroke="${design.secondary}" stroke-width="3"/>
    ` : ''}
    <!-- Label -->
    <text x="200" y="360" font-family="'Playfair Display', serif" font-weight="bold" font-size="20" fill="%23431407" text-anchor="middle">${title}</text>
  </svg>`;
}

const DEFAULT_SETTINGS = {
  name: "HandMade Crochet",
  logo: "🧶 كروشيه يدوي",
  whatsappNumber: "+96170123456",
  contactAddress: "Byblos, Old Souks, Lebanon",
  contactEmail: "hello@handmadecrochet.com",
  contactPhone: "+961 09 543 210",
  exchangeRates: {
    USD: 1.0,
    EGP: 48.5,
    SAR: 3.75
  },
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    twitter: "https://twitter.com"
  },
  shippingSettings: {
    enabled: true,
    baseRate: 15.0, // base $15 shipping
    freeShippingThreshold: 150.0 // free shipping for orders over $150
  },
  autoDiscounts: {
    cartThreshold: {
      enabled: true,
      threshold: 200.0,
      discountPercent: 10,
      text: "Spend $200 get 10% off",
      textAr: "أنفق $200 واحصل على خصم 10%!"
    },
    firstTime: {
      enabled: true,
      discountPercent: 15,
      text: "15% off for first-time customers",
      textAr: "خصم 15% للعملاء الجدد!"
    }
  },
  theme: {
    primaryColor: "#c2410c", // Terracotta
    accentColor: "#ea580c", // Warm Orange
    bgColor: "#fdf6e2", // Cream/Beige
    textColor: "#431407", // Deep Mahogany
    cardBgColor: "#f5efe6" // Sand Card
  },
  saleBanner: {
    enabled: true,
    text: "🎉 Winter Cozy Sale! Use code BOHO20 for 20% off!",
    textAr: "🎉 خصومات الشتاء الدافئة! استخدم الكود BOHO20 للحصول على خصم 20%!",
    expiry: "2026-12-31T23:59:59Z"
  },
  sectionsOrder: ["hero", "about", "products", "custom", "reviews", "instagram"]
};

const DEFAULT_BANNERS = [
  {
    title: "Chunky Earthy Cardigans",
    titleAr: "سترات خريفية بألوان الأرض",
    subtitle: "Hand-stitched over 15 hours of slow fashion warmth.",
    subtitleAr: "محاكة يدوياً على مدار 15 ساعة من الدفء والأناقة الفاخرة.",
    image: getCrochetSvg('cardigan', 'Chunky Knits'),
    linkText: "Shop Cardigans",
    linkTextAr: "تسوق السترات",
    linkTarget: "#shop"
  },
  {
    title: "Boho Shell Stitch Bags",
    titleAr: "حقائب بوهيمية فاخرة",
    subtitle: "Organic cotton totes designed for seaside strolls.",
    subtitleAr: "حقائب قطنية عضوية مصممة للرحلات والنزاهات البحرية.",
    image: getCrochetSvg('handbag', 'Artisan Totes'),
    linkText: "Discover Bags",
    linkTextAr: "اكتشف الحقائب",
    linkTarget: "#shop"
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: "1",
    nameEn: "Terracotta Autumn Cardigan",
    nameAr: "سترة الخريف بلون الطين المحروق",
    price: 185.00,
    category: "Cardigans",
    categoryAr: "سترات صوفية",
    descriptionEn: "A beautifully thick, hand-stitched chunky cardigan using premium organic cotton yarn. Features a cozy collar and wood buttons.",
    descriptionAr: "سترة خريفية سميكة محاكة يدوياً بدقة فائقة باستخدام خيوط القطن العضوي الفاخر، تتميز بياقة مريحة وأزرار خشبية طبيعية.",
    image: getCrochetSvg('cardigan', 'Terracotta Cardigan'),
    inventory: 8,
    sizes: ["S", "M", "L"],
    colors: ["Terracotta", "Cream", "Mustard"],
    materialsEn: "80% Organic Cotton, 20% Merino Wool",
    materialsAr: "80% قطن عضوي، 20% صوف ميرينو فاخر",
    processEn: "Hand-knit over 15 hours by local artisans in Byblos.",
    processAr: "محاك يدوياً على مدار 15 ساعة بواسطة حرفيات محليات في مدينة جبيل التاريخية."
  },
  {
    id: "2",
    nameEn: "Cream Shell Stitch Handbag",
    nameAr: "حقيبة يد بغرزة الصدفة العاجية",
    price: 95.00,
    category: "Bags",
    categoryAr: "حقائب",
    descriptionEn: "Elegant, bohemian-inspired handbag decorated with handmade wood tassels and fabric lining.",
    descriptionAr: "حقيبة يد أنيقة ومستوحاة من الطراز البوهيمي، مزينة بشراشيب خشبية يدوية وبطانة قماشية متينة لحفظ أغراضك.",
    image: getCrochetSvg('handbag', 'Shell Stitch Bag'),
    inventory: 4,
    sizes: ["One Size"],
    colors: ["Cream", "Beige"],
    materialsEn: "100% Biodegradable Palm Yarn & Cotton Cord",
    materialsAr: "100% خيوط قطنية عضوية قابلة للتحلل الحيوي",
    processEn: "Delicately crocheted stitch-by-stitch with wood accessories.",
    processAr: "محاكة غرزة بغرزة مع إكسسوارات خشبية مصنعة محلياً."
  },
  {
    id: "3",
    nameEn: "Mustard Sunflower Blanket",
    nameAr: "غطاء سرير دوار الشمس بلون الخردل",
    price: 240.00,
    category: "Home Decor",
    categoryAr: "مستلزمات منزلية",
    descriptionEn: "Cozy warm throw blanket detailed with intricate crochet sunflowers. Perfect for beds and couches.",
    descriptionAr: "غطاء مريح ودافئ للأرائك والأسرة مزين بورود دوار الشمس ثلاثية الأبعاد المحاكة يدوياً بدقة فائقة.",
    image: getCrochetSvg('blanket', 'Sunflower Blanket'),
    inventory: 2,
    sizes: ["Standard"],
    colors: ["Mustard", "Deep Mahogany"],
    materialsEn: "100% Premium Anti-Pilling Acrylic Yarn",
    materialsAr: "100% خيوط أكريليك فاخرة مقاومة للتوبير والاهتراء",
    processEn: "Knitted with 64 individual flower squares merged together.",
    processAr: "تتكون من 64 مربعاً من الزهور المحاكة منفردة ثم جُمعت معاً بصبر وعناية."
  },
  {
    id: "4",
    nameEn: "Emerald Crochet Halter Top",
    nameAr: "قميص كروشيه مكشوف الظهر زمردي",
    price: 65.00,
    category: "Tops",
    categoryAr: "بلوزات صيفية",
    descriptionEn: "Chic summer top with adjustable tie straps. Perfect for sunny days and beach getaways.",
    descriptionAr: "قميص صيفي أنيق ومميز بظهر مكشوف وأربطة قابلة للتعديل حسب المقاس. مثالي للأيام المشمسة والرحلات الشاطئية.",
    image: getCrochetSvg('top', 'Emerald Top'),
    inventory: 6,
    sizes: ["S", "M", "L"],
    colors: ["Emerald", "Sage"],
    materialsEn: "100% Combed Mercerized Cotton",
    materialsAr: "100% قطن مُمشط ومُعالج للمعان ونعومة فائقة",
    processEn: "Tight stitch structure ensuring zero transparency.",
    processAr: "بنية غرز متماسكة تضمن عدم الشفافية لتوفير الراحة التامة."
  }
];

const DEFAULT_COUPONS = [
  { code: "WELCOME10", type: "percentage", value: 10, minPurchase: 0, maxDiscount: 20, usageLimit: 100, usageCount: 0, enabled: true },
  { code: "BOHO20", type: "percentage", value: 20, minPurchase: 50, maxDiscount: 50, usageLimit: 50, usageCount: 0, enabled: true },
  { code: "FREESHIP", type: "free_shipping", value: 0, minPurchase: 100, maxDiscount: 0, usageLimit: 200, usageCount: 0, enabled: true }
];

export class StateStore {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    // Auth seeds
    if (!localStorage.getItem('admin_logged_in')) {
      localStorage.setItem('admin_logged_in', 'false');
    }

    // Settings Draft vs Live
    if (!localStorage.getItem('siteSettings')) {
      localStorage.setItem('siteSettings', JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem('siteSettings_draft')) {
      localStorage.setItem('siteSettings_draft', JSON.stringify(DEFAULT_SETTINGS));
    }

    // Banners Draft vs Live
    if (!localStorage.getItem('banners')) {
      localStorage.setItem('banners', JSON.stringify(DEFAULT_BANNERS));
    }
    if (!localStorage.getItem('banners_draft')) {
      localStorage.setItem('banners_draft', JSON.stringify(DEFAULT_BANNERS));
    }

    // Core arrays
    this.loadOrSetDefault('products', DEFAULT_PRODUCTS);
    this.loadOrSetDefault('categories', ["Cardigans", "Bags", "Home Decor", "Tops"]);
    this.loadOrSetDefault('coupons', DEFAULT_COUPONS);
    this.loadOrSetDefault('customOrders', []);
    this.loadOrSetDefault('orders', []);
    this.loadOrSetDefault('active_language', 'en');
    this.loadOrSetDefault('active_currency', 'USD');

    // Undo/Redo Stacks in RAM
    this.undoStack = [];
    this.redoStack = [];
  }

  loadOrSetDefault(key, defaultVal) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
    }
  }

  // Pub/Sub
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify(key, value) {
    this.listeners.forEach(l => l(key, value));
  }

  getData(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    this.notify(key, value);
  }

  // Get active settings (storefront reads LIVE; visual customizer reads DRAFT)
  getSettings(isDraft = false) {
    const key = isDraft ? 'siteSettings_draft' : 'siteSettings';
    return JSON.parse(localStorage.getItem(key));
  }

  getBanners(isDraft = false) {
    const key = isDraft ? 'banners_draft' : 'banners';
    return JSON.parse(localStorage.getItem(key));
  }

  // Visual Customizer CMS Flow
  pushToHistory() {
    const draftSettings = localStorage.getItem('siteSettings_draft');
    const draftBanners = localStorage.getItem('banners_draft');
    
    // Save state snapshot
    this.undoStack.push({
      settings: draftSettings,
      banners: draftBanners
    });
    
    // Cap undo stack at 50
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
    
    this.redoStack = []; // Clear redo stack on new action
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    
    const currentSettings = localStorage.getItem('siteSettings_draft');
    const currentBanners = localStorage.getItem('banners_draft');
    
    // Save current to redo stack
    this.redoStack.push({
      settings: currentSettings,
      banners: currentBanners
    });

    const previous = this.undoStack.pop();
    localStorage.setItem('siteSettings_draft', previous.settings);
    localStorage.setItem('banners_draft', previous.banners);
    
    this.notify('siteSettings_draft', JSON.parse(previous.settings));
    this.notify('banners_draft', JSON.parse(previous.banners));
    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;
    
    const currentSettings = localStorage.getItem('siteSettings_draft');
    const currentBanners = localStorage.getItem('banners_draft');
    
    // Save current back to undo
    this.undoStack.push({
      settings: currentSettings,
      banners: currentBanners
    });

    const next = this.redoStack.pop();
    localStorage.setItem('siteSettings_draft', next.settings);
    localStorage.setItem('banners_draft', next.banners);
    
    this.notify('siteSettings_draft', JSON.parse(next.settings));
    this.notify('banners_draft', JSON.parse(next.banners));
    return true;
  }

  publishChanges() {
    const draftSettings = localStorage.getItem('siteSettings_draft');
    const draftBanners = localStorage.getItem('banners_draft');
    
    localStorage.setItem('siteSettings', draftSettings);
    localStorage.setItem('banners', draftBanners);
    
    this.notify('siteSettings', JSON.parse(draftSettings));
    this.notify('banners', JSON.parse(draftBanners));
  }

  updateSettingsField(path, value, isDraft = true) {
    if (isDraft) this.pushToHistory();

    const key = isDraft ? 'siteSettings_draft' : 'siteSettings';
    const settings = JSON.parse(localStorage.getItem(key));
    
    // Update nested property (e.g. 'theme.primaryColor')
    const parts = path.split('.');
    let current = settings;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    
    localStorage.setItem(key, JSON.stringify(settings));
    this.notify(key, settings);
  }

  saveBanners(bannersArray, isDraft = true) {
    if (isDraft) this.pushToHistory();
    const key = isDraft ? 'banners_draft' : 'banners';
    localStorage.setItem(key, JSON.stringify(bannersArray));
    this.notify(key, bannersArray);
  }

  // Products
  getProducts() { return this.getData('products'); }
  saveProducts(prods) { this.setData('products', prods); }
  
  addProduct(p) {
    const prods = this.getProducts();
    p.id = (prods.length > 0 ? Math.max(...prods.map(pr => parseInt(pr.id))) + 1 : 1).toString();
    prods.push(p);
    this.saveProducts(prods);
  }

  updateProduct(id, updatedData) {
    const prods = this.getProducts();
    const idx = prods.findIndex(p => p.id === id);
    if (idx !== -1) {
      prods[idx] = { ...prods[idx], ...updatedData };
      this.saveProducts(prods);
    }
  }

  deleteProduct(id) {
    const prods = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(prods);
  }

  // Categories
  getCategories() { return this.getData('categories'); }
  addCategory(cat) {
    const cats = this.getCategories();
    if (!cats.includes(cat)) {
      cats.push(cat);
      this.setData('categories', cats);
    }
  }
  deleteCategory(cat) {
    const cats = this.getCategories().filter(c => c !== cat);
    this.setData('categories', cats);
  }

  // Coupons
  getCoupons() { return this.getData('coupons'); }
  saveCoupons(coups) { this.setData('coupons', coups); }
  addCoupon(c) {
    const coups = this.getCoupons();
    coups.push(c);
    this.saveCoupons(coups);
  }
  updateCoupon(code, updated) {
    const coups = this.getCoupons();
    const idx = coups.findIndex(c => c.code.toLowerCase() === code.toLowerCase());
    if (idx !== -1) {
      coups[idx] = { ...coups[idx], ...updated };
      this.saveCoupons(coups);
    }
  }
  deleteCoupon(code) {
    const coups = this.getCoupons().filter(c => c.code.toLowerCase() !== code.toLowerCase());
    this.saveCoupons(coups);
  }

  // Custom requests
  getCustomOrders() { return this.getData('customOrders'); }
  addCustomOrder(order) {
    const orders = this.getCustomOrders();
    order.id = 'CST-' + Math.floor(Math.random() * 9000 + 1000);
    order.status = 'review'; // review, accepted, in-progress, shipped
    order.colors = order.colors || 'Cream';
    orders.push(order);
    this.setData('customOrders', orders);
  }
  updateCustomOrderStatus(id, status) {
    const orders = this.getCustomOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      this.setData('customOrders', orders);
    }
  }

  // Checkout Orders
  getOrders() { return this.getData('orders'); }
  addOrder(order) {
    const orders = this.getOrders();
    order.id = 'HM-' + Math.floor(Math.random() * 90000 + 10000);
    order.status = 'processing'; // processing, shipped, delivered
    orders.push(order);
    this.setData('orders', orders);
    
    // Auto register or update customer spent totals
    this.updateCustomerMetric(order.customerName, order.email, order.total);
    return order;
  }

  getCustomers() {
    const orders = this.getOrders();
    const map = {};
    orders.forEach(o => {
      const email = o.email.toLowerCase();
      if (!map[email]) {
        map[email] = { name: o.customerName, email: o.email, ordersCount: 0, totalSpent: 0 };
      }
      map[email].ordersCount += 1;
      map[email].totalSpent += o.total;
    });
    return Object.values(map);
  }

  updateCustomerMetric(name, email, spent) {
    // Dynamic lists derived from orders
  }

  // Admin Auth credentials
  loginAdmin(user, pass) {
    if (user === 'soha_work' && pass === '123456789') {
      localStorage.setItem('admin_logged_in', 'true');
      return true;
    }
    return false;
  }

  logoutAdmin() {
    localStorage.setItem('admin_logged_in', 'false');
  }

  isAdminLoggedIn() {
    return localStorage.getItem('admin_logged_in') === 'true';
  }
}

export const store = new StateStore();
