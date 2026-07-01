// State Store for HandMade Crochet

// Dynamic SVG Generator for Crochet Products
function getCrochetSvg(type, title) {
  const width = type === 'banner' ? 1200 : 400;
  const height = type === 'banner' ? 450 : 400;
  
  // Luxury Cozy Color Gradients (Cream, Sand, Terracotta, Ochre)
  let grad = '';
  if (type === 'banner') {
    grad = `<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fdf6e2" />
              <stop offset="50%" stop-color="#f5efe6" />
              <stop offset="100%" stop-color="#eddcd2" />
            </linearGradient>`;
  } else {
    grad = `<radialGradient id="g" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stop-color="#fafaf9" />
              <stop offset="60%" stop-color="#f5efe6" />
              <stop offset="100%" stop-color="#e7e5e4" />
            </radialGradient>`;
  }
  
  // Cozy crochet knit pattern paths
  let icon = '';
  if (title.includes('Cardigan')) {
    icon = `<path d="M120,120 L160,80 L240,80 L280,120 L280,260 L240,260 L240,160 L220,160 L220,290 L180,290 L180,160 L160,160 L160,260 L120,260 Z" fill="#c2410c" opacity="0.85" stroke="#78350f" stroke-width="4" stroke-linejoin="round" />
            <!-- Wood Buttons -->
            <circle cx="200" cy="120" r="6" fill="#78350f" />
            <circle cx="200" cy="150" r="6" fill="#78350f" />
            <circle cx="200" cy="180" r="6" fill="#78350f" />
            <!-- Knit Lines -->
            <path d="M160,80 L160,160 M240,80 L240,160 M140,120 L140,260 M260,120 L260,260" stroke="#fdf6e2" stroke-width="2" stroke-dasharray="4 6" opacity="0.4" />`;
  } else if (title.includes('Bag') || title.includes('Tote')) {
    icon = `<path d="M150,160 C150,110 250,110 250,160" fill="none" stroke="#78350f" stroke-width="12" stroke-linecap="round" />
            <path d="M130,160 L270,160 L260,280 L140,280 Z" fill="#b45309" stroke="#78350f" stroke-width="4" stroke-linejoin="round" />
            <!-- Woven Grid stitches -->
            <path d="M150,170 H250 M150,195 H250 M150,220 H250 M150,245 H250 M150,270 H250" stroke="#fdf6e2" stroke-width="3" stroke-dasharray="2 3" opacity="0.3" />
            <path d="M160,160 V280 M185,160 V280 M210,160 V280 M235,160 V280 M260,160 V280" stroke="#fdf6e2" stroke-width="3" stroke-dasharray="2 3" opacity="0.3" />`;
  } else if (title.includes('Throw') || title.includes('Blanket')) {
    icon = `<rect x="130" y="130" width="140" height="140" fill="#f5efe6" stroke="#78350f" stroke-width="4" />
            <!-- Granny squares grid -->
            <rect x="140" y="140" width="55" height="55" fill="#ea580c" rx="4" />
            <rect x="205" y="140" width="55" height="55" fill="#b45309" rx="4" />
            <rect x="140" y="205" width="55" height="55" fill="#d97706" rx="4" />
            <rect x="205" y="205" width="55" height="55" fill="#c2410c" rx="4" />
            <!-- Flower center knit -->
            <circle cx="167" cy="167" r="10" fill="#fdf6e2" />
            <circle cx="232" cy="167" r="10" fill="#fdf6e2" />
            <circle cx="167" cy="232" r="10" fill="#fdf6e2" />
            <circle cx="232" cy="232" r="10" fill="#fdf6e2" />`;
  } else if (title.includes('Headband')) {
    icon = `<ellipse cx="200" cy="200" rx="80" ry="25" fill="none" stroke="#78350f" stroke-width="12" />
            <ellipse cx="200" cy="200" rx="80" ry="25" fill="none" stroke="#ea580c" stroke-width="6" stroke-dasharray="8 6" />
            <path d="M130,200 C150,190 170,210 190,200 C210,190 230,210 250,200 C270,190 290,210 300,200" fill="none" stroke="#fff" stroke-width="2" opacity="0.8"/>`;
  } else if (title.includes('Coasters')) {
    icon = `<circle cx="200" cy="200" r="70" fill="none" stroke="#78350f" stroke-width="4" />
            <circle cx="200" cy="200" r="60" fill="none" stroke="#b45309" stroke-width="6" stroke-dasharray="10 8" />
            <circle cx="200" cy="200" r="40" fill="none" stroke="#ea580c" stroke-width="4" />
            <!-- Lace petalled edges -->
            <path d="M200,120 C205,120 210,125 210,130 M210,130 C215,130 220,135 220,140" stroke="#78350f" stroke-width="3" fill="none" opacity="0.6"/>
            <circle cx="200" cy="200" r="10" fill="#78350f" />`;
  } else if (title.includes('Top') || title.includes('Bustier')) {
    icon = `<path d="M140,240 L160,150 L200,120 L240,150 L260,240 Z" fill="#ea580c" stroke="#78350f" stroke-width="4" stroke-linejoin="round" />
            <path d="M200,120 L200,80" stroke="#78350f" stroke-width="4" stroke-linecap="round" />
            <path d="M140,240 L110,260 M260,240 L290,260" stroke="#78350f" stroke-width="4" stroke-linecap="round" />
            <circle cx="175" cy="180" r="20" fill="none" stroke="#78350f" stroke-width="3"/>
            <circle cx="225" cy="180" r="20" fill="none" stroke="#78350f" stroke-width="3"/>`;
  } else if (type === 'banner') {
    icon = `<rect x="80" y="80" width="1040" height="290" fill="none" stroke="rgba(120,53,15,0.08)" stroke-width="8" stroke-dasharray="20 15" rx="20"/>
            <path d="M900,100 C980,180 820,300 950,350" fill="none" stroke="#c2410c" stroke-width="40" opacity="0.08" stroke-linecap="round"/>
            <text x="120" y="270" fill="rgba(120,53,15,0.04)" font-size="160" font-family="Georgia, serif" font-weight="900">ARTISAN</text>`;
  } else {
    icon = `<circle cx="200" cy="200" r="60" fill="none" stroke="#78350f" stroke-width="6"/>
            <line x1="140" y1="200" x2="260" y2="200" stroke="#78350f" stroke-width="6"/>`;
  }

  let textOverlay = '';
  if (type !== 'banner') {
    textOverlay = `<text x="50%" y="350" fill="#78350f" font-size="15" font-family="Playfair Display, sans-serif" font-weight="700" text-anchor="middle">${title}</text>`;
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
  name: "HandMade Crochet",
  logo: "HandMade",
  logoType: "text",
  whatsappNumber: "+96170123456",
  contactEmail: "artisan@handmadecrochet.com",
  contactPhone: "+961 70 123 456",
  contactAddress: "Byblos, Lebanon",
  socialLinks: {
    facebook: "https://facebook.com/handmadecrochet",
    instagram: "https://instagram.com/handmadecrochet",
    twitter: "https://twitter.com/handmade"
  },
  shippingSettings: {
    baseRate: 7,
    freeShippingThreshold: 100,
    enabled: true
  },
  paymentMethods: {
    cod: { name: "Cash on Delivery", enabled: true },
    bank: { name: "Bank Transfer / WHISH", enabled: true }
  },
  theme: {
    primaryColor: "#c2410c", // Terracotta
    accentColor: "#ea580c",  // Warm Orange
    bgColor: "#fdf6e2",      // Cozy Cream/Beige
    textColor: "#451a03",    // Deep Earthy Brown
    cardBgColor: "#f5efe6",  // Sand Beige
    fontFamily: "'Playfair Display', 'Poppins', system-ui, sans-serif"
  },
  saleBanner: {
    enabled: true,
    text: "🧶 Craft Week Sale! Use code WOOL50 for 50% off all Heirloom Cardigans! 🧶",
    expiry: "2026-07-31T23:59:59"
  },
  autoDiscounts: {
    cartThreshold: {
      enabled: true,
      threshold: 200,
      discountPercent: 10,
      text: "10% off automatically on orders over $200"
    },
    firstTime: {
      enabled: true,
      discountPercent: 15,
      text: "15% off for first-time customers"
    }
  }
};

const DEFAULT_CATEGORIES = ["Cardigans", "Accessories", "Home Decor"];

const DEFAULT_PRODUCTS = [
  { id: "1", name: "Terracotta Autumn Cardigan", price: 185.00, description: "A beautifully thick, hand-stitched chunky cardigan using premium organic cotton yarn. Features a cozy collar and wood buttons.", image: getCrochetSvg('product', 'Terracotta Autumn Cardigan'), category: "Cardigans", inventory: 8, sizes: ["S", "M", "L"], colors: ["Terracotta", "Cream", "Mustard"], materials: "80% Organic Cotton, 20% Merino Wool", process: "Hand-knit over 15 hours by local artisans in Byblos." },
  { id: "2", name: "Granny Square Duster Blanket Coat", price: 260.00, description: "An iconic statement piece containing 42 hand-knit retro granny squares. Keeps you warm while showcasing vintage artisanal style.", image: getCrochetSvg('product', 'Granny Square Duster Blanket'), category: "Cardigans", inventory: 3, sizes: ["M", "L"], colors: ["Multi-Earth", "Boho-Pastel"], materials: "100% Organic Wool", process: "Stitched with 12 different yarn batches to achieve color symmetry." },
  { id: "3", name: "Cream Shell Stitch Tote Bag", price: 75.00, description: "A lightweight, flexible tote bag hand-crocheted in a classic fan-shell pattern. Fully lined with linen and fitted with sturdy straps.", image: getCrochetSvg('product', 'Cream Shell Stitch Tote'), category: "Accessories", inventory: 15, sizes: ["O/S"], colors: ["Cream", "Natural Sand"], materials: "100% Organic Cotton Yarn, Linen Lining", process: "Includes internal pocket lining and double reinforced base stitches." },
  { id: "4", name: "Sage Leaf Crochet Headband", price: 28.00, description: "Keep your hair styled with this soft, elasticized bohemian band in a beautifully textured green leaf stitch pattern.", image: getCrochetSvg('product', 'Sage Leaf Crochet Headband'), category: "Accessories", inventory: 25, sizes: ["O/S"], colors: ["Sage Green", "Oatmeal"], materials: "100% Bamboo Cotton Yarn", process: "Hypoallergenic bamboo fibers provide soft contact with hair and skin." },
  { id: "5", name: "Cozy Earth Lace Coasters (Set of 6)", price: 32.00, description: "Artisanal circular coasters with delicate scalloped lace details. Adds a warm, cozy boho touch to any dining table.", image: getCrochetSvg('product', 'Cozy Earth Lace Coasters'), category: "Home Decor", inventory: 12, sizes: ["O/S"], colors: ["Mixed Earthy", "Cream White"], materials: "100% Mercersized Cotton Yarn", process: "Stiffened slightly with natural starch to sit flat on tables." },
  { id: "6", name: "Sunset Halter Crop Top", price: 65.00, description: "Vibrant orange halter top featuring textured stitch patterns and adjustable ties at the neck and cross-back.", image: getCrochetSvg('product', 'Sunset Halter Crop Top'), category: "Accessories", inventory: 10, sizes: ["S", "M", "L"], colors: ["Sunset Orange", "Teal Blend"], materials: "10% Silk, 90% Cotton Yarn", process: "Comfortably flexible weave ensures a premium contour fit." }
];

const DEFAULT_COUPONS = [
  {
    code: "WOOL50",
    type: "percentage",
    value: 50,
    minPurchase: 0,
    maxDiscount: 150,
    startDate: "2026-06-01",
    expirationDate: "2026-08-31",
    usageLimit: 50,
    usageCount: 12,
    revenueGenerated: 1110.00,
    oneTimePerCustomer: false,
    enabled: true,
    restrictProducts: ["1", "2"], // Restricted to cardigans
    restrictCategories: [],
    restrictCustomers: []
  },
  {
    code: "FREEBOHO",
    type: "free_shipping",
    value: 0,
    minPurchase: 50,
    maxDiscount: 0,
    startDate: "2026-06-01",
    expirationDate: "2026-10-31",
    usageLimit: 200,
    usageCount: 15,
    revenueGenerated: 1425.00,
    oneTimePerCustomer: false,
    enabled: true,
    restrictProducts: [],
    restrictCategories: [],
    restrictCustomers: []
  }
];

const DEFAULT_ORDERS = [
  { id: "ORD-9421", customerName: "Nour Al-Huda", email: "nour@outlook.com", items: [{ productId: "1", name: "Terracotta Autumn Cardigan", price: 185.00, quantity: 1 }], total: 99.50, discountApplied: 92.50, couponCode: "WOOL50", status: "delivered", date: "2026-06-20T10:22:00Z" },
  { id: "ORD-9422", customerName: "Yasmine Mansour", email: "yasmine@gmail.com", items: [{ productId: "3", name: "Cream Shell Stitch Tote Bag", price: 75.00, quantity: 1 }, { productId: "4", name: "Sage Leaf Crochet Headband", price: 28.00, quantity: 1 }], total: 103.00, discountApplied: 0, couponCode: "", status: "processing", date: "2026-06-29T16:15:00Z" }
];

const DEFAULT_CUSTOMERS = [
  { email: "nour@outlook.com", name: "Nour Al-Huda", ordersCount: 1, totalSpent: 99.50 },
  { email: "yasmine@gmail.com", name: "Yasmine Mansour", ordersCount: 1, totalSpent: 103.00 }
];

const DEFAULT_BANNERS = [
  { id: "b1", image: getCrochetSvg('banner', 'Woven Warmth for Everyday'), title: "Stitched with Love, Designed for Luxury", subtitle: "Explore our collection of authentic, hand-stitched premium cardigans, bags, and boho wearables.", linkText: "Discover Collection", linkTarget: "#shop" },
  { id: "b2", image: getCrochetSvg('banner', 'Retro Granny Squares Restitched'), title: "Vintage Knit Heritage", subtitle: "Check out our famous Granny Square blankets and blanket dusters handcrafted by local Lebanese artisans.", linkText: "Explore Cardigans", linkTarget: "#shop" }
];

const DEFAULT_CUSTOM_ORDERS = [
  { id: "CUST-309", name: "Hoda R.", email: "hoda@gmail.com", details: "Cardigan with sunflower motifs instead of traditional circles, size L", colors: "Yellow, Sage Green, Dark Brown", size: "L", budget: 200, deliveryDate: "2026-07-20", date: "2026-07-01T12:00:00Z", status: "review" }
];

class Store {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    if (!localStorage.getItem("admin_username")) {
      localStorage.setItem("admin_username", "soha_work");
      localStorage.setItem("admin_password", "123456789");
    }

    this.loadOrSetDefault("siteSettings", DEFAULT_SETTINGS);
    this.loadOrSetDefault("categories", DEFAULT_CATEGORIES);
    this.loadOrSetDefault("products", DEFAULT_PRODUCTS);
    this.loadOrSetDefault("coupons", DEFAULT_COUPONS);
    this.loadOrSetDefault("orders", DEFAULT_ORDERS);
    this.loadOrSetDefault("customers", DEFAULT_CUSTOMERS);
    this.loadOrSetDefault("banners", DEFAULT_BANNERS);
    this.loadOrSetDefault("customOrders", DEFAULT_CUSTOM_ORDERS);
    this.loadOrSetDefault("active_language", "en"); // en / ar
    this.loadOrSetDefault("active_currency", "USD"); // USD / LBP / EUR
  }

  loadOrSetDefault(key, defaultValue) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  }

  getData(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    this.notify(key, value);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify(key, value) {
    this.listeners.forEach(callback => callback(key, value));
  }

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
    const sess = sessionStorage.getItem("admin_session");
    return sess !== null;
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
    if (!product.image) {
      product.image = getCrochetSvg('product', product.name);
    }
    products.push(product);
    this.saveProducts(products);
    return product;
  }

  updateProduct(id, updatedProduct) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      if (!updatedProduct.image) {
        updatedProduct.image = getCrochetSvg('product', updatedProduct.name || products[index].name);
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

  deleteCategory(categoryName) {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c !== categoryName);
    this.setData("categories", filtered);
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

  // Settings
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

  // Custom Orders requests
  getCustomOrders() {
    return this.getData("customOrders") || [];
  }

  addCustomOrder(order) {
    const orders = this.getCustomOrders();
    order.id = "CUST-" + Math.floor(100 + Math.random() * 900);
    order.date = new Date().toISOString();
    order.status = "review"; // review, accepted, in-progress, shipped
    orders.unshift(order);
    this.setData("customOrders", orders);
    return order;
  }

  updateCustomOrderStatus(id, status) {
    const orders = this.getCustomOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      this.setData("customOrders", orders);
      return true;
    }
    return false;
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
    orders.unshift(order);
    this.setData("orders", orders);

    this.trackCustomerOrder(order.email, order.customerName, order.total);

    if (order.couponCode) {
      this.incrementCouponMetrics(order.couponCode, order.total, order.discountApplied);
    }
    return order;
  }

  getCustomers() {
    return this.getData("customers");
  }

  trackCustomerOrder(email, name, totalAmount) {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      customers[index].ordersCount += 1;
      customers[index].totalSpent = parseFloat((customers[index].totalSpent + totalAmount).toFixed(2));
      customers[index].name = name;
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
window.appStore = store;
