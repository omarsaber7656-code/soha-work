// State Management System for SOHA Premium Store

// Helper to generate premium tech vector mockups as data URLs
function getSvgDataUrl(type, title) {
  const width = type === 'banner' ? 1200 : 400;
  const height = type === 'banner' ? 450 : 400;
  
  let grad = '';
  if (type === 'banner') {
    grad = `<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e1b4b" />
              <stop offset="50%" stop-color="#311042" />
              <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>`;
  } else {
    grad = `<radialGradient id="g" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stop-color="#1e1b4b" />
              <stop offset="60%" stop-color="#0f172a" />
              <stop offset="100%" stop-color="#020617" />
            </radialGradient>`;
  }
  
  let icon = '';
  if (title.includes('Headphones')) {
    icon = `<path d="M150,210 C150,130 250,130 250,210 M150,190 L150,230 M250,190 L250,230" stroke="#6366f1" stroke-width="20" stroke-linecap="round" fill="none" />
            <rect x="135" y="190" width="30" height="50" rx="15" fill="#a855f7" />
            <rect x="235" y="190" width="30" height="50" rx="15" fill="#a855f7" />
            <circle cx="200" cy="200" r="10" fill="#fff" opacity="0.3"/>`;
  } else if (title.includes('Speaker')) {
    icon = `<rect x="140" y="110" width="120" height="180" rx="20" fill="none" stroke="#6366f1" stroke-width="8" />
            <circle cx="200" cy="165" r="30" fill="none" stroke="#a855f7" stroke-width="6" />
            <circle cx="200" cy="235" r="40" fill="none" stroke="#a855f7" stroke-width="6" />
            <circle cx="200" cy="235" r="15" fill="#fff" opacity="0.2"/>`;
  } else if (title.includes('Light')) {
    icon = `<circle cx="200" cy="180" r="60" fill="#eab308" opacity="0.1" />
            <path d="M200,120 C165,120 155,150 170,190 L170,220 L230,220 L230,190 C245,150 235,120 200,120 Z" fill="none" stroke="#eab308" stroke-width="8" stroke-linejoin="round" />
            <rect x="185" y="220" width="30" height="15" fill="#64748b" rx="2" />
            <line x1="200" y1="120" x2="200" y2="100" stroke="#eab308" stroke-width="6" stroke-linecap="round"/>
            <line x1="130" y1="170" x2="110" y2="170" stroke="#eab308" stroke-width="6" stroke-linecap="round"/>
            <line x1="270" y1="170" x2="290" y2="170" stroke="#eab308" stroke-width="6" stroke-linecap="round"/>`;
  } else if (title.includes('Watch')) {
    icon = `<rect x="155" y="125" width="90" height="150" rx="24" fill="none" stroke="#6366f1" stroke-width="8" />
            <path d="M175,125 L175,90 L225,90 L225,125" fill="none" stroke="#334155" stroke-width="6"/>
            <path d="M175,275 L175,310 L225,310 L225,275" fill="none" stroke="#334155" stroke-width="6"/>
            <circle cx="200" cy="200" r="30" fill="none" stroke="#a855f7" stroke-width="6" />
            <polyline points="200,185 200,200 215,200" fill="none" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/>`;
  } else if (title.includes('Keyboard')) {
    icon = `<rect x="110" y="160" width="180" height="80" rx="10" fill="none" stroke="#6366f1" stroke-width="8" />
            <rect x="130" y="180" width="20" height="15" rx="3" fill="#a855f7" />
            <rect x="160" y="180" width="20" height="15" rx="3" fill="#a855f7" />
            <rect x="190" y="180" width="20" height="15" rx="3" fill="#a855f7" />
            <rect x="220" y="180" width="20" height="15" rx="3" fill="#a855f7" />
            <rect x="250" y="180" width="20" height="15" rx="3" fill="#a855f7" />
            <rect x="130" y="205" width="30" height="15" rx="3" fill="#a855f7" />
            <rect x="170" y="205" width="60" height="15" rx="3" fill="#10b981" />
            <rect x="240" y="205" width="30" height="15" rx="3" fill="#a855f7" />`;
  } else if (title.includes('Charger') || title.includes('Wireless')) {
    icon = `<ellipse cx="200" cy="220" rx="90" ry="30" fill="none" stroke="#6366f1" stroke-width="8" />
            <path d="M200,180 L190,215 L205,215 L195,245 L215,205 L200,205 Z" fill="#f59e0b" />`;
  } else if (type === 'banner') {
    // Wide layout decorations
    icon = `<circle cx="950" cy="225" r="120" fill="none" stroke="#6366f1" stroke-width="4" opacity="0.3" />
            <circle cx="950" cy="225" r="70" fill="none" stroke="#a855f7" stroke-width="4" opacity="0.3" />
            <path d="M100,320 C300,100 600,400 900,150" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="8" />
            <text x="80" y="260" fill="rgba(255,255,255,0.03)" font-size="120" font-family="sans-serif" font-weight="900">SOHA</text>`;
  } else {
    // Generic cube
    icon = `<rect x="140" y="140" width="120" height="120" rx="12" fill="none" stroke="#6366f1" stroke-width="8" />
            <line x1="140" y1="140" x2="200" y2="80" stroke="#6366f1" stroke-width="8" />
            <line x1="260" y1="140" x2="320" y2="80" stroke="#6366f1" stroke-width="8" />
            <line x1="200" y1="80" x2="320" y2="80" stroke="#6366f1" stroke-width="8" />`;
  }

  let textOverlay = '';
  if (type !== 'banner') {
    textOverlay = `<text x="50%" y="330" fill="#94a3b8" font-size="16" font-family="sans-serif" font-weight="600" text-anchor="middle">${title}</text>`;
  }

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>${grad}</defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    ${icon}
    ${textOverlay}
  </svg>`;
  
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr);
}

const DEFAULT_SETTINGS = {
  name: "SOHA Premium Tech",
  logo: "SOHA",
  logoType: "text",
  whatsappNumber: "+96170123456",
  contactEmail: "info@sohapremium.com",
  contactPhone: "+961 70 123 456",
  contactAddress: "Beirut, Lebanon",
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com"
  },
  shippingSettings: {
    baseRate: 5,
    freeShippingThreshold: 75,
    enabled: true
  },
  paymentMethods: {
    cod: { name: "Cash on Delivery", enabled: true },
    bank: { name: "Bank Transfer", enabled: true }
  },
  theme: {
    primaryColor: "#6366f1", // Indigo
    accentColor: "#a855f7",  // Purple
    bgColor: "#0f172a",      // Slate 900
    textColor: "#f8fafc",    // Slate 50
    cardBgColor: "#1e293b",  // Slate 800
    fontFamily: "'Outfit', system-ui, sans-serif"
  },
  saleBanner: {
    enabled: true,
    text: "⚡ Summer Flash Sale! Use coupon SUMMER50 for 50% off! ⚡",
    expiry: "2026-07-31T23:59:59"
  },
  autoDiscounts: {
    cartThreshold: {
      enabled: true,
      threshold: 150,
      discountPercent: 10,
      text: "10% off on orders over $150"
    },
    firstTime: {
      enabled: true,
      discountPercent: 15,
      text: "15% off for your first order"
    }
  }
};

const DEFAULT_CATEGORIES = ["Audio", "Smart Home", "Wearables", "Accessories"];

const DEFAULT_PRODUCTS = [
  { id: "1", name: "AeroBeat Pro Headphones", price: 199.99, description: "Experience high-fidelity audio with active noise cancellation and 40-hour battery life. Built with premium materials for maximum comfort during long listening sessions.", image: getSvgDataUrl('product', 'AeroBeat Pro Headphones'), category: "Audio", inventory: 25 },
  { id: "2", name: "AuraSound Portable Speaker", price: 79.99, description: "Rugged, waterproof portable speaker with rich bass and 360-degree sound. Up to 20 hours of continuous playtime to power your outdoor adventures.", image: getSvgDataUrl('product', 'AuraSound Portable Speaker'), category: "Audio", inventory: 40 },
  { id: "3", name: "NovaGlow Smart Mood Light", price: 49.99, description: "Wi-Fi enabled smart LED light with millions of colors and dynamic light scenes. Synergizes with smart home hubs and responds to music beats.", image: getSvgDataUrl('product', 'NovaGlow Smart Mood Light'), category: "Smart Home", inventory: 15 },
  { id: "4", name: "Chronos Fit Smartwatch", price: 149.99, description: "Advanced health tracking, built-in GPS, and crystal clear AMOLED screen. Track sleep, heart rate, and workouts with up to 10 days of battery life.", image: getSvgDataUrl('product', 'Chronos Fit Smartwatch'), category: "Wearables", inventory: 30 },
  { id: "5", name: "VoltCharge Wireless Pad", price: 39.99, description: "15W fast wireless charging pad for compatible smartphones and wireless earbuds. Crafted with non-slip aluminum chassis and leather top.", image: getSvgDataUrl('product', 'VoltCharge Wireless Pad'), category: "Accessories", inventory: 50 },
  { id: "6", name: "Apex Mechanical Keyboard", price: 89.99, description: "Compact 60% mechanical keyboard with tactile brown switches and full RGB backlighting. Premium double-shot PBT keycaps for durability.", image: getSvgDataUrl('product', 'Apex Mechanical Keyboard'), category: "Accessories", inventory: 12 }
];

const DEFAULT_COUPONS = [
  {
    code: "SUMMER50",
    type: "percentage",
    value: 50,
    minPurchase: 0,
    maxDiscount: 100,
    startDate: "2026-06-01",
    expirationDate: "2026-08-31",
    usageLimit: 100,
    usageCount: 15,
    revenueGenerated: 1499.92,
    oneTimePerCustomer: false,
    enabled: true,
    restrictProducts: [],
    restrictCategories: [],
    restrictCustomers: []
  },
  {
    code: "FREEGOLD",
    type: "free_shipping",
    value: 0,
    minPurchase: 40,
    maxDiscount: 0,
    startDate: "2026-06-01",
    expirationDate: "2026-08-31",
    usageLimit: 50,
    usageCount: 8,
    revenueGenerated: 649.90,
    oneTimePerCustomer: false,
    enabled: true,
    restrictProducts: [],
    restrictCategories: [],
    restrictCustomers: []
  },
  {
    code: "BOGO2026",
    type: "bogo",
    value: 0,
    buyProductId: "1",
    getProductId: "5",
    minPurchase: 0,
    maxDiscount: 0,
    startDate: "2026-06-01",
    expirationDate: "2026-08-31",
    usageLimit: 20,
    usageCount: 4,
    revenueGenerated: 799.96,
    oneTimePerCustomer: false,
    enabled: true,
    restrictProducts: [],
    restrictCategories: [],
    restrictCustomers: []
  },
  {
    code: "WELCOME15",
    type: "percentage",
    value: 15,
    minPurchase: 50,
    maxDiscount: 30,
    startDate: "2026-07-01",
    expirationDate: "2026-12-31",
    usageLimit: 500,
    usageCount: 22,
    revenueGenerated: 1845.50,
    oneTimePerCustomer: true,
    enabled: true,
    restrictProducts: [],
    restrictCategories: [],
    restrictCustomers: []
  }
];

const DEFAULT_ORDERS = [
  { id: "ORD-1001", customerName: "Sarah Jenkins", email: "sarah@gmail.com", items: [{ productId: "1", name: "AeroBeat Pro Headphones", price: 199.99, quantity: 1 }], total: 99.99, discountApplied: 100.00, couponCode: "SUMMER50", status: "delivered", date: "2026-06-25T14:32:00Z" },
  { id: "ORD-1002", customerName: "Alex Mercer", email: "alex.m@outlook.com", items: [{ productId: "4", name: "Chronos Fit Smartwatch", price: 149.99, quantity: 1 }, { productId: "5", name: "VoltCharge Wireless Pad", price: 39.99, quantity: 1 }], total: 189.98, discountApplied: 0, couponCode: "", status: "processing", date: "2026-06-28T09:15:00Z" },
  { id: "ORD-1003", customerName: "Elena Rostova", email: "elena@yandex.com", items: [{ productId: "3", name: "NovaGlow Smart Mood Light", price: 49.99, quantity: 2 }], total: 84.98, discountApplied: 15.00, couponCode: "WELCOME15", status: "shipped", date: "2026-06-30T18:40:00Z" },
  { id: "ORD-1004", customerName: "John Doe", email: "john@example.com", items: [{ productId: "1", name: "AeroBeat Pro Headphones", price: 199.99, quantity: 1 }, { productId: "5", name: "VoltCharge Wireless Pad", price: 39.99, quantity: 1 }], total: 199.99, discountApplied: 39.99, couponCode: "BOGO2026", status: "delivered", date: "2026-06-29T11:22:00Z" }
];

const DEFAULT_CUSTOMERS = [
  { email: "sarah@gmail.com", name: "Sarah Jenkins", ordersCount: 1, totalSpent: 99.99 },
  { email: "alex.m@outlook.com", name: "Alex Mercer", ordersCount: 1, totalSpent: 189.98 },
  { email: "elena@yandex.com", name: "Elena Rostova", ordersCount: 1, totalSpent: 84.98 },
  { email: "john@example.com", name: "John Doe", ordersCount: 1, totalSpent: 199.99 }
];

const DEFAULT_BANNERS = [
  { id: "b1", image: getSvgDataUrl('banner', 'Smart Living, Redefined'), title: "Smart Living, Redefined", subtitle: "Explore our curated collection of premium gadgets and tech essentials styled for the modern lifestyle.", linkText: "Shop Collection", linkTarget: "#category-Audio" },
  { id: "b2", image: getSvgDataUrl('banner', 'Immersive Sound Awaits'), title: "Immersive Sound Awaits", subtitle: "Up to 50% off on headphones and speaker setups. Premium acoustics with hybrid cancellation.", linkText: "Explore Audio", linkTarget: "#category-Audio" }
];

class Store {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    // Admin Credential check/creation
    if (!localStorage.getItem("admin_username")) {
      localStorage.setItem("admin_username", "soha_work");
      localStorage.setItem("admin_password", "123456789");
    }

    // Default tables check/creation
    this.loadOrSetDefault("siteSettings", DEFAULT_SETTINGS);
    this.loadOrSetDefault("categories", DEFAULT_CATEGORIES);
    this.loadOrSetDefault("products", DEFAULT_PRODUCTS);
    this.loadOrSetDefault("coupons", DEFAULT_COUPONS);
    this.loadOrSetDefault("orders", DEFAULT_ORDERS);
    this.loadOrSetDefault("customers", DEFAULT_CUSTOMERS);
    this.loadOrSetDefault("banners", DEFAULT_BANNERS);

    // Session status
    this.currentSession = JSON.parse(sessionStorage.getItem("admin_session") || "null");
  }

  loadOrSetDefault(key, defaultValue) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  }

  // Get data
  getData(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  // Save data & notify listeners
  setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    this.notify(key, value);
  }

  // Listener subscriptions for live update reactivity
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify(key, value) {
    this.listeners.forEach(callback => callback(key, value));
  }

  // Admin Session Methods
  loginAdmin(username, password) {
    const user = localStorage.getItem("admin_username");
    const pass = localStorage.getItem("admin_password");
    if (username === user && password === pass) {
      this.currentSession = { username, loggedInAt: new Date().toISOString() };
      sessionStorage.setItem("admin_session", JSON.stringify(this.currentSession));
      this.notify("session", this.currentSession);
      return true;
    }
    return false;
  }

  logoutAdmin() {
    this.currentSession = null;
    sessionStorage.removeItem("admin_session");
    this.notify("session", null);
  }

  isAdminLoggedIn() {
    return this.currentSession !== null;
  }

  // Products
  getProducts() {
    return this.getData("products");
  }

  saveProducts(products) {
    this.setData("products", products);
  }

  addProduct(product) {
    const products = this.getProducts();
    product.id = Date.now().toString();
    // If no image is provided, generate a mockup dynamically
    if (!product.image) {
      product.image = getSvgDataUrl('product', product.name);
    }
    products.push(product);
    this.saveProducts(products);
    return product;
  }

  updateProduct(id, updatedProduct) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      // If image changed from empty, generate dynamic mockup
      if (!updatedProduct.image) {
        updatedProduct.image = getSvgDataUrl('product', updatedProduct.name || products[index].name);
      }
      products[index] = { ...products[index], ...updatedProduct };
      this.saveProducts(products);
      return true;
    }
    return false;
  }

  deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
  }

  // Categories
  getCategories() {
    return this.getData("categories");
  }

  addCategory(category) {
    const categories = this.getCategories();
    if (!categories.includes(category)) {
      categories.push(category);
      this.setData("categories", categories);
      return true;
    }
    return false;
  }

  renameCategory(oldName, newName) {
    const categories = this.getCategories();
    const index = categories.indexOf(oldName);
    if (index !== -1 && !categories.includes(newName)) {
      categories[index] = newName;
      this.setData("categories", categories);

      // Also update products in this category
      const products = this.getProducts();
      products.forEach(p => {
        if (p.category === oldName) p.category = newName;
      });
      this.saveProducts(products);
      return true;
    }
    return false;
  }

  deleteCategory(categoryName) {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c !== categoryName);
    this.setData("categories", filtered);

    // Also update products in this category to uncategorized or delete category field
    const products = this.getProducts();
    products.forEach(p => {
      if (p.category === categoryName) p.category = "Uncategorized";
    });
    this.saveProducts(products);
  }

  // Banners
  getBanners() {
    return this.getData("banners");
  }

  saveBanners(banners) {
    this.setData("banners", banners);
  }

  // Settings & Theme
  getSettings() {
    return this.getData("siteSettings");
  }

  saveSettings(settings) {
    this.setData("siteSettings", settings);
  }

  updateSettingsField(path, value) {
    const settings = this.getSettings();
    const parts = path.split(".");
    let current = settings;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    this.saveSettings(settings);
  }

  // Coupons
  getCoupons() {
    return this.getData("coupons");
  }

  saveCoupons(coupons) {
    this.setData("coupons", coupons);
  }

  addCoupon(coupon) {
    const coupons = this.getCoupons();
    // Initialize stats
    coupon.usageCount = 0;
    coupon.revenueGenerated = 0;
    coupons.push(coupon);
    this.saveCoupons(coupons);
  }

  updateCoupon(code, updatedFields) {
    const coupons = this.getCoupons();
    const index = coupons.findIndex(c => c.code.toLowerCase() === code.toLowerCase());
    if (index !== -1) {
      coupons[index] = { ...coupons[index], ...updatedFields };
      this.saveCoupons(coupons);
      return true;
    }
    return false;
  }

  deleteCoupon(code) {
    const coupons = this.getCoupons();
    const filtered = coupons.filter(c => c.code.toLowerCase() !== code.toLowerCase());
    this.saveCoupons(filtered);
  }

  // Orders
  getOrders() {
    return this.getData("orders");
  }

  addOrder(order) {
    const orders = this.getOrders();
    order.id = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    order.date = new Date().toISOString();
    order.status = "processing";
    orders.unshift(order); // Add to beginning
    this.setData("orders", orders);

    // Update customer stats
    this.trackCustomerOrder(order.email, order.customerName, order.total);

    // Increment coupon usage statistics if applicable
    if (order.couponCode) {
      this.incrementCouponMetrics(order.couponCode, order.total, order.discountApplied);
    }
    return order;
  }

  // Customers
  getCustomers() {
    return this.getData("customers");
  }

  trackCustomerOrder(email, name, totalAmount) {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      customers[index].ordersCount += 1;
      customers[index].totalSpent = parseFloat((customers[index].totalSpent + totalAmount).toFixed(2));
      customers[index].name = name; // Update name in case it changed
    } else {
      customers.push({
        email: email,
        name: name,
        ordersCount: 1,
        totalSpent: parseFloat(totalAmount.toFixed(2))
      });
    }
    this.setData("customers", customers);
  }

  // Increments coupon usage count and generated revenue
  incrementCouponMetrics(code, orderTotal, discountAmount) {
    const coupons = this.getCoupons();
    const index = coupons.findIndex(c => c.code.toLowerCase() === code.toLowerCase());
    if (index !== -1) {
      coupons[index].usageCount = (coupons[index].usageCount || 0) + 1;
      coupons[index].revenueGenerated = parseFloat(((coupons[index].revenueGenerated || 0) + orderTotal).toFixed(2));
      this.saveCoupons(coupons);
    }
  }
}

export const store = new Store();
window.appStore = store; // Make globally accessible for debugging
