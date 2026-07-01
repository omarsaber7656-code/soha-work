// Storefront Controller for HandMade Crochet - Bilingual & Multi-Currency
import { store } from './store.js';
import { CouponEngine } from './coupons.js';

// Comprehensive translation dictionary for public facing elements
const DICTIONARY = {
  store_name: { en: "HandMade Crochet", ar: "كروشيه يدوّي" },
  home: { en: "Home", ar: "الرئيسية" },
  shop: { en: "Shop Collection", ar: "المتجر" },
  about: { en: "Our Story", ar: "قصتنا" },
  custom: { en: "Custom Orders", ar: "طلبات خاصة" },
  gallery: { en: "Artisan Gallery", ar: "معرض الحِرف" },
  blog: { en: "Blog & Care Tips", ar: "المدونة والنصائح" },
  contact: { en: "Contact Us", ar: "اتصل بنا" },
  cart: { en: "Shopping Cart", ar: "سلة المشتريات" },
  search_placeholder: { en: "Search cozy designs...", ar: "ابحث عن تصاميم كروشيه دافئة..." },
  add_to_cart: { en: "Add to Cart", ar: "أضف إلى السلة" },
  buy_now: { en: "Buy Now", ar: "شراء الآن" },
  best_sellers: { en: "Best Sellers", ar: "الأكثر مبيعاً" },
  new_collection: { en: "New Collection", ar: "المجموعة الجديدة" },
  reviews: { en: "Reviews", ar: "آراء عملائنا" },
  newsletter_title: { en: "Join the Cozy Circle", ar: "انضم إلى مجتمعنا الدافئ" },
  newsletter_desc: { en: "Subscribe for new crochet collection drops and organic care tips.", ar: "اشترك لتصلك إصدارات المجموعات الجديدة ونصائح العناية بالصوف الطبيعي." },
  subscribe: { en: "Subscribe", ar: "اشتراك" },
  categories: { en: "Categories", ar: "الفئات" },
  sort_by: { en: "Sort By", ar: "ترتيب حسب" },
  price_filter: { en: "Price Range", ar: "نطاق السعر" },
  wishlist: { en: "Wishlist", ar: "قائمة الأمنيات" },
  quick_view: { en: "Quick View", ar: "معاينة سريعة" },
  materials: { en: "Materials Used", ar: "المواد المستخدمة" },
  knit_process: { en: "Handcraft Stitching Process", ar: "خطوات الحياكة اليدوية" },
  colors: { en: "Available Colors", ar: "الألوان المتاحة" },
  sizes: { en: "Sizes", ar: "المقاسات" },
  qty: { en: "Quantity", ar: "الكمية" },
  related_products: { en: "You May Also Love", ar: "قد يعجبك أيضاً" },
  custom_title: { en: "Request a Custom Crochet Piece", ar: "طلب قطعة كروشيه مصممة خصيصاً لك" },
  custom_desc: { en: "Describe your dream crochet item. Our master artisans will knit it step-by-step to your exact specifications.", ar: "صف قطعة الكروشيه التي تحلم بها. وسيقوم الحرفيون لدينا بحياكتها غرزة بغرزة بمقاساتك وألوانك المفضلة." },
  name: { en: "Your Name", ar: "الاسم الكريم" },
  email: { en: "Email Address", ar: "البريد الإلكتروني" },
  description: { en: "Details / Specifications", ar: "التفاصيل / المواصفات المطلوبة" },
  upload_image: { en: "Upload Reference Image", ar: "رفع صورة توضيحية للموديل" },
  budget: { en: "Target Budget", ar: "الميزانية المقترحة" },
  date: { en: "Target Delivery Date", ar: "تاريخ التسليم المقترح" },
  submit_request: { en: "Submit Custom Request", ar: "إرسال طلب الحياكة الخاصة" },
  gift_wrap: { en: "Luxury Gift Wrapping", ar: "تغليف هدايا فاخر" },
  authenticity: { en: "Handmade Authenticity Certificate (Free)", ar: "شهادة أصالة الصناعة اليدوية (مجاناً)" },
  loyalty_points: { en: "Earn Loyalty Reward Points", ar: "كسب نقاط مكافأة الولاء" },
  empty_cart: { en: "Your cart is empty.", ar: "سلة المشتريات فارغة حالياً." },
  subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  shipping: { en: "Shipping Fee", ar: "رسوم الشحن" },
  total: { en: "Total Amount", ar: "المبلغ الإجمالي" },
  checkout: { en: "Place Order (Checkout)", ar: "إتمام الطلب والدفع" },
  all_products: { en: "All Products", ar: "جميع المنتجات" }
};

export class Storefront {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Core states
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.priceLimit = 300;
    this.sortOrder = 'default';
    this.appliedCouponCode = localStorage.getItem('applied_coupon') || '';

    // Gift and cert details
    this.giftWrappingActive = JSON.parse(localStorage.getItem('gift_wrapping') || 'false');
    this.includeCertificate = JSON.parse(localStorage.getItem('include_cert') || 'true');
    this.userLoggedIn = localStorage.getItem('user_session_email') !== null;
    this.userEmail = localStorage.getItem('user_session_email') || '';

    this.currentSlideIndex = 0;
    this.sliderInterval = null;
    this.toastContainer = null;

    // Subscribe to state updates
    this.unsubscribe = store.subscribe((key, val) => {
      if (key === 'active_language' || key === 'active_currency' || key === 'products' || key === 'siteSettings' || key === 'banners') {
        this.updateTheme();
        this.render();
      }
    });

    this.init();
  }

  init() {
    this.updateTheme();
    this.render();
    this.startSlider();
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.sliderInterval) clearInterval(this.sliderInterval);
  }

  lang() { return localStorage.getItem('active_language') || 'en'; }
  currency() { return localStorage.getItem('active_currency') || 'USD'; }
  isRtl() { return this.lang() === 'ar'; }

  t(key) {
    return DICTIONARY[key] ? (DICTIONARY[key][this.lang()] || key) : key;
  }

  // Calculate Exchange Rate Conversion
  formatPrice(usdAmount) {
    const settings = store.getSettings();
    const curr = this.currency();
    const rate = settings.exchangeRates[curr] || 1.0;
    const converted = usdAmount * rate;

    const symbols = {
      USD: `$${converted.toFixed(2)}`,
      EGP: `${converted.toFixed(0)} ج.م`,
      SAR: `${converted.toFixed(2)} ر.س`
    };

    return symbols[curr] || `$${usdAmount.toFixed(2)}`;
  }

  updateTheme() {
    const settings = store.getSettings();
    if (!settings || !settings.theme) return;
    const theme = settings.theme;
    const root = document.documentElement;

    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--bg-color', theme.bgColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--card-bg-color', theme.cardBgColor);

    if (this.isRtl()) {
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.body.removeAttribute('dir');
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    localStorage.setItem('gift_wrapping', JSON.stringify(this.giftWrappingActive));
    localStorage.setItem('include_cert', JSON.stringify(this.includeCertificate));
    if (this.appliedCouponCode) {
      localStorage.setItem('applied_coupon', this.appliedCouponCode);
    } else {
      localStorage.removeItem('applied_coupon');
    }
    this.renderCartItems();
    this.renderCartSummary();
    this.updateCartBadge();
  }

  saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
  }

  toggleWishlist(productId) {
    const idx = this.wishlist.indexOf(productId);
    if (idx !== -1) {
      this.wishlist.splice(idx, 1);
      this.showToast(this.isRtl() ? 'تمت إزالة القطعة من قائمة الأمنيات' : 'Removed from wishlist.', 'info');
    } else {
      this.wishlist.push(productId);
      this.showToast(this.isRtl() ? 'تمت إضافة القطعة إلى قائمة الأمنيات!' : 'Added to wishlist!', 'success');
    }
    this.saveWishlist();
    this.render();
  }

  addToCart(productId, quantity = 1, selectedSize = "M", selectedColor = "Original") {
    const products = store.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.inventory <= 0) {
      this.showToast(this.isRtl() ? 'عذراً، نفذت كمية هذا المنتج من المخزن.' : 'Product is out of stock.', 'error');
      return;
    }

    const cartKey = `${productId}-${selectedSize}-${selectedColor}`;
    const existingIndex = this.cart.findIndex(item => `${item.productId}-${item.size}-${item.color}` === cartKey);

    if (existingIndex !== -1) {
      const newQty = this.cart[existingIndex].quantity + quantity;
      if (newQty > product.inventory) {
        this.cart[existingIndex].quantity = product.inventory;
        this.showToast(this.isRtl() ? 'تم الوصول للحد الأقصى للمخزون المتوفر' : 'Limited to available stock.', 'warning');
      } else {
        this.cart[existingIndex].quantity = newQty;
        this.showToast(this.isRtl() ? 'تم تحديث الكمية داخل السلة' : 'Cart quantity updated.', 'success');
      }
    } else {
      this.cart.push({
        productId,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        price: product.price,
        category: product.category,
        categoryAr: product.categoryAr,
        quantity: Math.min(quantity, product.inventory),
        size: selectedSize,
        color: selectedColor
      });
      this.showToast(this.isRtl() ? 'تمت إضافة القطعة إلى سلة المشتريات!' : 'Added to cart!', 'success');
    }
    this.saveCart();
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }
    const toast = document.createElement('div');
    toast.className = `toast glass-panel ${type}`;
    toast.innerHTML = `<span>🧶</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  startSlider() {
    if (this.sliderInterval) clearInterval(this.sliderInterval);
    const banners = store.getBanners();
    if (banners && banners.length > 1) {
      this.sliderInterval = setInterval(() => {
        this.currentSlideIndex = (this.currentSlideIndex + 1) % banners.length;
        this.updateSliderUI();
      }, 7000);
    }
  }

  updateSliderUI() {
    const slides = this.container.querySelectorAll('.hero-slide');
    const dots = this.container.querySelectorAll('.dot');
    slides.forEach((slide, idx) => {
      if (idx === this.currentSlideIndex) slide.classList.add('active');
      else slide.classList.remove('active');
    });
    dots.forEach((dot, idx) => {
      if (idx === this.currentSlideIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  }

  render() {
    if (!this.container) return;
    const settings = store.getSettings();
    const isAr = this.isRtl();

    this.container.innerHTML = `
      <!-- Top Promo countdown banner -->
      ${this.renderSaleCountdown(settings.saleBanner)}

      <!-- Sticky Header -->
      <nav class="sticky-navbar glass-panel">
        <div class="logo-artisan" id="logo-home-btn" style="cursor:pointer;">
          <span style="color:var(--primary-color);">🧶</span> ${isAr ? settings.logo.split(' ').slice(1).join(' ') || 'كروشيه يدوي' : 'HandMade'}
        </div>

        <div class="nav-links">
          <a href="#home" class="nav-item ${this.getRoute() === 'home' ? 'active' : ''}">${this.t('home')}</a>
          <a href="#shop" class="nav-item ${this.getRoute() === 'shop' ? 'active' : ''}">${this.t('shop')}</a>
          <a href="#custom" class="nav-item ${this.getRoute() === 'custom' ? 'active' : ''}">${this.t('custom')}</a>
          <a href="#gallery" class="nav-item ${this.getRoute() === 'gallery' ? 'active' : ''}">${this.t('gallery')}</a>
          <a href="#blog" class="nav-item ${this.getRoute() === 'blog' ? 'active' : ''}">${this.t('blog')}</a>
          <a href="#about" class="nav-item ${this.getRoute() === 'about' ? 'active' : ''}">${this.t('about')}</a>
          <a href="#contact" class="nav-item ${this.getRoute() === 'contact' ? 'active' : ''}">${this.t('contact')}</a>
        </div>

        <div class="nav-controls">
          <!-- Currency switcher -->
          <select id="currency-switch-select" style="background:none; border:none; color:var(--text-color); font-weight:700; font-family:inherit; cursor:pointer;">
            <option value="USD" ${this.currency() === 'USD' ? 'selected' : ''}>USD ($)</option>
            <option value="EGP" ${this.currency() === 'EGP' ? 'selected' : ''}>EGP (ج.م)</option>
            <option value="SAR" ${this.currency() === 'SAR' ? 'selected' : ''}>SAR (ر.س)</option>
          </select>

          <!-- Language switch -->
          <button class="control-btn" id="lang-switch-btn" title="Toggle Language">
            🌐 <span class="lang-badge">${isAr ? 'EN' : 'عربي'}</span>
          </button>

          <!-- User Dashboard portal -->
          <button class="control-btn" id="user-portal-btn" title="User Dashboard">
            👤
          </button>

          <!-- Cart with badge -->
          <button class="control-btn" id="open-cart-btn" style="position:relative;">
            🛒 <span class="cart-badge" id="cart-badge-val" style="position:absolute; top:-5px; right:-5px; background:var(--primary-color); color:#fff; font-size:0.7rem; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; display:none;">0</span>
          </button>

          <!-- Admin dashboard entry -->
          <a href="#admin" class="btn-luxury" style="padding:0.4rem 1rem; font-size:0.8rem; border-radius:10px;">${isAr ? 'لوحة التحكم' : 'Console'}</a>
        </div>
      </nav>

      <!-- View Slot Mount -->
      <div id="store-view-slot" style="min-height: calc(100vh - var(--header-height) - 100px);">
        ${this.renderViewContent()}
      </div>

      <!-- Footer -->
      <footer style="background:#1c1917; color:#f5efe6; padding:4rem 6%; border-top:1px solid var(--border-color); font-size:0.9rem;">
        <div style="max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:3rem; text-align:start;">
          <div>
            <h3 style="font-family:var(--font-heading); font-size:1.8rem; color:#fff; margin-bottom:1rem;">🧶 ${isAr ? 'كروشيه يدوّي' : settings.name}</h3>
            <p style="opacity:0.8; line-height:1.8;">
              ${isAr ? 'تصاميم كروشيه وحرف يدوية فاخرة تُحاك يدوياً غرزة بغرزة بحب وعناية فائقة، باستخدام أجود أنواع خيوط القطن والصوف العضوي المستدام.' : 'Premium luxury handmade crochet designs stitched stitch-by-stitch with sustainable materials.'}
            </p>
          </div>
          <div>
            <h3 style="font-family:var(--font-heading); font-size:1.3rem; color:#fff; margin-bottom:1.25rem;">${this.t('contact')}</h3>
            <p style="opacity:0.8; margin-bottom:0.5rem;">📍 ${settings.contactAddress}</p>
            <p style="opacity:0.8; margin-bottom:0.5rem;">📞 ${settings.contactPhone}</p>
            <p style="opacity:0.8;">✉️ ${settings.contactEmail}</p>
          </div>
          <div>
            <h3 style="font-family:var(--font-heading); font-size:1.3rem; color:#fff; margin-bottom:1.25rem;">${isAr ? 'تابعنا على منصات التواصل' : 'Follow Artisan'}</h3>
            <div style="display:flex; gap:1.25rem; font-size:1.3rem;">
              <a href="${settings.socialLinks.instagram}" target="_blank">📸</a>
              <a href="${settings.socialLinks.facebook}" target="_blank">📘</a>
              <a href="${settings.socialLinks.twitter}" target="_blank">🐦</a>
            </div>
          </div>
        </div>
        <div style="max-width:1200px; margin: 3rem auto 0; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); text-align:center; opacity:0.5;">
          &copy; 2026 ${settings.name}. All Rights Reserved. Built with Luxury.
        </div>
      </footer>

      <!-- Shopping Drawer Cart -->
      <div class="cart-drawer-overlay" id="cart-drawer-overlay"></div>
      <div class="cart-slider-panel glass-panel" id="cart-drawer">
        <div class="cart-header" style="padding:1.5rem; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
          <h2>${this.t('cart')}</h2>
          <button id="close-cart-btn" style="font-size:1.5rem; background:none; border:none; cursor:pointer;">✕</button>
        </div>
        
        <div class="cart-items-list" id="cart-items-list-container" style="flex:1; overflow-y:auto; padding:1.5rem; display:flex; flex-direction:column; gap:1.25rem; text-align:start;">
          <!-- Items inject -->
        </div>
        
        <!-- Options -->
        <div style="padding:1rem 1.5rem; border-top:1px solid var(--border-color); background:rgba(120,53,15,0.02); font-size:0.85rem; display:flex; flex-direction:column; gap:0.6rem; text-align:start;">
          <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
            <input type="checkbox" id="cart-gift-wrap-check" ${this.giftWrappingActive ? 'checked' : ''}>
            <span>🎁 ${this.t('gift_wrap')} (+ ${this.formatPrice(5.00)})</span>
          </label>
          <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
            <input type="checkbox" id="cart-certificate-check" ${this.includeCertificate ? 'checked' : ''}>
            <span>📜 ${this.t('authenticity')}</span>
          </label>
        </div>

        <!-- Coupon validation -->
        <div class="cart-coupon-section" style="padding:1rem 1.5rem; border-top:1px solid var(--border-color); text-align:start;">
          <div class="coupon-input-group">
            <input type="text" id="coupon-code-input" placeholder="${isAr ? 'كود الخصم' : 'Coupon Code'}" value="${this.appliedCouponCode}">
            <button class="coupon-apply-btn" id="coupon-apply-btn">${isAr ? 'تطبيق' : 'Apply'}</button>
          </div>
          <div id="coupon-status-box"></div>
        </div>

        <div class="cart-summary" id="cart-summary-container" style="padding:1.5rem; border-top:1px solid var(--border-color); background:rgba(0,0,0,0.02); text-align:start;">
          <!-- Totals -->
        </div>
      </div>

      <!-- Quick View details modal -->
      <div class="modal-overlay" id="quick-view-overlay">
        <div class="modal-container glass-panel" id="quick-view-container" style="max-width:800px; width:100%;"></div>
      </div>

      <!-- User Auth Portal modal -->
      <div class="modal-overlay" id="user-auth-overlay">
        <div class="modal-container glass-panel" id="user-auth-container" style="max-width:440px; width:100%; padding:2.5rem;"></div>
      </div>

      <!-- Checkout modal -->
      <div class="modal-overlay" id="checkout-overlay">
        <div class="modal-container glass-panel" id="checkout-container" style="max-width:600px; width:100%; padding:2.5rem;"></div>
      </div>

      <!-- Widgets -->
      <div class="floating-widget-box ${isAr ? 'right' : 'left'}">
        <a href="https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello!%20I'm%20interested%20in%20your%20crochet%20handicrafts." target="_blank" class="float-btn whatsapp" title="Chat on WhatsApp">💬</a>
      </div>
      <div class="floating-widget-box ${isAr ? 'left' : 'right'}">
        <button class="float-btn back-to-top" id="scroll-top-btn" title="Back to Top">▲</button>
      </div>
    `;

    this.bindGlobalEvents();
    this.updateCartBadge();
    this.renderCartItems();
    this.renderCartSummary();
    this.initCountdownTimer();
  }

  getRoute() {
    const hash = window.location.hash || '#home';
    return hash.split('-')[0].replace('#', '');
  }

  renderViewContent() {
    const route = this.getRoute();
    switch (route) {
      case 'home': return this.renderHomeView();
      case 'shop': return this.renderShopView();
      case 'details': return this.renderDetailsView();
      case 'custom': return this.renderCustomOrdersView();
      case 'gallery': return this.renderGalleryView();
      case 'blog': return this.renderBlogView();
      case 'about': return this.renderAboutView();
      case 'contact': return this.renderContactView();
      default: return this.renderHomeView();
    }
  }

  renderSaleCountdown(banner) {
    if (!banner || !banner.enabled) return '';
    const text = this.isRtl() ? (banner.textAr || banner.text) : banner.text;
    return `
      <div class="flash-sale-banner" id="flash-sale-container" style="padding:0.4rem 2rem; font-size:0.85rem; font-weight:500;">
        <span>⚡ ${text}</span>
        <div class="flash-timer" style="margin-inline-start: 1rem;">
          <span id="countdown-timer-value">00d : 00h : 00m : 00s</span>
        </div>
      </div>
    `;
  }

  initCountdownTimer() {
    const timerSpan = document.getElementById('countdown-timer-value');
    if (!timerSpan) return;

    const settings = store.getSettings();
    const expiry = new Date(settings.saleBanner.expiry).getTime();

    const update = () => {
      const now = new Date().getTime();
      const distance = expiry - now;

      if (distance < 0) {
        timerSpan.innerText = this.isRtl() ? "انتهى الخصم!" : "Sale ended!";
        const banner = document.getElementById('flash-sale-container');
        if (banner) banner.style.display = 'none';
        return;
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      timerSpan.innerHTML = `${d}d : ${h.toString().padStart(2,'0')}h : ${m.toString().padStart(2,'0')}m : ${s.toString().padStart(2,'0')}s`;
    };

    update();
    if (window.crochetTimerInterval) clearInterval(window.crochetTimerInterval);
    window.crochetTimerInterval = setInterval(update, 1000);
  }

  // Home Page View
  renderHomeView() {
    const settings = store.getSettings();
    const banners = store.getBanners();
    const products = store.getProducts();
    const isAr = this.isRtl();

    // Render enabled sections based on settings layout ordering
    const sectionsHtml = settings.sectionsOrder.map(sec => {
      if (sec === 'hero') {
        return `
          <!-- Hero Section -->
          <section class="cozy-hero">
            ${banners.map((b, index) => `
              <div class="hero-slide ${index === this.currentSlideIndex ? 'active' : ''}" style="background-image: url('${b.image}');">
                <div class="hero-content">
                  <h1>${isAr ? b.titleAr : b.title}</h1>
                  <p>${isAr ? b.subtitleAr : b.subtitle}</p>
                  <a href="${b.linkTarget || '#shop'}" class="btn-luxury" style="width:fit-content;">${isAr ? b.linkTextAr : b.linkText} →</a>
                </div>
              </div>
            `).join('')}
            <div class="slider-dots" style="position:absolute; bottom:2rem; left:50%; transform:translateX(-50%); display:flex; gap:0.75rem; z-index:5;">
              ${banners.map((_, index) => `
                <div class="dot ${index === this.currentSlideIndex ? 'active' : ''}" data-index="${index}" style="width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.4); cursor:pointer;"></div>
              `).join('')}
            </div>
          </section>
        `;
      }
      if (sec === 'about') {
        return `
          <!-- About brand statement -->
          <section style="padding:6rem 8%; text-align:center; max-width:900px; margin:0 auto;">
            <span style="font-size:0.8rem; text-transform:uppercase; color:var(--primary-color); font-weight:700; letter-spacing:0.1em; display:block; margin-bottom:1rem;">${isAr ? 'الإرث والتميّز الحرفي' : 'Artisanal Heritage'}</span>
            <h2 style="font-size:2.8rem; margin-bottom:1.5rem;">${isAr ? 'حياكة يدوية تروي دفء الحكاية والأناقة' : 'Stitched with Warmth, Designed for Luxury'}</h2>
            <p style="font-size:1.1rem; opacity:0.85; line-height:1.8; margin-bottom:2rem;">
              ${isAr ? 'نؤمن في كروشيه يدوي بأن كل غرزة تمثل وقتاً وصبراً وشغفاً. تُحاك كل قطعة ببطء وتفانٍ باستخدام صوف ميرينو الفاخر وخيوط القطن العضوية الصديقة للبيئة لنوفر لك إرثاً أصيلاً يعيش طويلاً.' : 'At HandMade Crochet, we believe in slow fashion. Every cardigan and accessory is knitted stitch-by-stitch by local women artisans, blending traditional techniques with modern aesthetic comfort.'}
            </p>
            <a href="#about" class="btn-luxury-outline">${this.t('about')}</a>
          </section>
        `;
      }
      if (sec === 'products') {
        return `
          <!-- Best Sellers -->
          <section style="padding:4rem 6%; border-top:1px solid var(--border-color); background:rgba(120,53,15,0.015);">
            <h2 style="text-align:center; font-size:2.2rem; margin-bottom:0.5rem;">${this.t('best_sellers')}</h2>
            <p style="text-align:center; opacity:0.7; margin-bottom:2.5rem;">${isAr ? 'القطع الأكثر طلباً وحياكة لهذا الموسم' : 'Our most wanted hand-stitched pieces this season.'}</p>
            <div class="crochet-grid">
              ${products.slice(0, 3).map(p => this.renderProductCard(p)).join('')}
            </div>
          </section>
        `;
      }
      if (sec === 'custom') {
        return `
          <!-- AI Recommendations section / Call to Custom -->
          <section style="padding:5rem 6%; border-top:1px solid var(--border-color); text-align:center;">
            <div class="glass-panel" style="padding:3.5rem; border-radius:var(--border-radius-lg); max-width:800px; margin:0 auto; display:flex; flex-direction:column; align-items:center;">
              <span style="font-size:0.8rem; text-transform:uppercase; color:var(--primary-color); font-weight:700;">✨ ${isAr ? 'طلب تفصيل خاص' : 'Artisan Customizer'}</span>
              <h2 style="margin-bottom:1rem; margin-top:0.5rem;">${isAr ? 'هل تحلم بتصميم كروشيه مخصص؟' : 'Looking for a custom size or style?'}</h2>
              <p style="opacity:0.8; margin-bottom:2rem; max-width:600px;">
                ${isAr ? 'يمكننا حياكة سترتك المفضلة بأبعادك الدقيقة وتنسيقات الألوان التي تختارها بنفسك. تواصل مع حياكاتنا المحترفات الآن.' : 'We can craft our cardigans to your custom sizing and color preferences with our local knitters.'}
              </p>
              <a href="#custom" class="btn-luxury">${isAr ? 'ابدأ طلبك الخاص الآن' : 'Request Custom Order'}</a>
            </div>
          </section>
        `;
      }
      if (sec === 'reviews') {
        return `
          <!-- Testimonials -->
          <section style="padding:5rem 6%; text-align:center; border-top:1px solid var(--border-color); background:var(--card-bg-color);">
            <h2 style="font-size:2rem; margin-bottom:0.5rem;">${this.t('reviews')}</h2>
            <p style="opacity:0.7; margin-bottom:2.5rem;">${isAr ? 'ماذا يقول عشاق الكروشيه عن جودة حياكتنا الفاخرة' : 'What yarn-lovers say about our heirloom quality.'}</p>
            <div style="max-width:600px; margin:0 auto; padding:2.5rem; background:var(--bg-color); border-radius:var(--border-radius-md); border:1px solid var(--border-color); display:flex; flex-direction:column; align-items:center; gap:1rem;">
              <div style="color:gold; font-size:1.3rem;">★★★★★</div>
              <p style="font-style:italic; font-size:1.1rem; opacity:0.95;">
                "${isAr ? 'السترة صوفية مذهلة وناعمة للغاية! التفاصيل اليدوية وغرز الألوان دافئة بشكل رائع، وتغليف الهدية مميز جداً. سأطلب قطعة أخرى بالتأكيد!' : 'The cardigan is absolutely gorgeous! Thick, warm, and fits like a dream. You can tell it was knitted with extreme precision.'}"
              </p>
              <strong>- ${isAr ? 'تالا ك.، جبيل' : 'Tala K., Byblos'}</strong>
            </div>
          </section>
        `;
      }
      if (sec === 'instagram') {
        return `
          <!-- Instagram gallery showcase -->
          <section style="padding:5rem 6%; border-top:1px solid var(--border-color); text-align:center;">
            <h2 style="font-size:2rem; margin-bottom:0.5rem;">#HandMadeCrochet</h2>
            <p style="opacity:0.7; margin-bottom:2.5rem;">${isAr ? 'لقطات وتنسيقات كروشيه ملهمة من مجتمعنا الدافئ' : 'Artisanal styling moments from our warm community.'}</p>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:1.25rem;">
              ${[1,2,3,4,5,6].map(i => `
                <div class="glass-panel" style="padding-top:100%; border-radius:12px; position:relative; overflow:hidden;">
                  <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(120,53,15,0.02); font-size:1.5rem; font-weight:700; color:var(--primary-color);">
                    📷 <span style="font-size:0.75rem; opacity:0.5; margin-top:0.25rem;">@handstitched</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        `;
      }
      return '';
    }).join('');

    return `
      ${sectionsHtml}
      
      <!-- Newsletter Signup -->
      <section style="padding:6rem 6%; border-top:1px solid var(--border-color); background:linear-gradient(135deg, var(--card-bg-color) 0%, var(--bg-color) 100%); text-align:center;">
        <h2 style="font-size:2.5rem; margin-bottom:1rem;">${this.t('newsletter_title')}</h2>
        <p style="opacity:0.8; max-width:600px; margin:0 auto 2.5rem;">${this.t('newsletter_desc')}</p>
        <form style="display:flex; justify-content:center; gap:0.5rem; max-width:500px; margin:0 auto; flex-wrap:wrap;" id="home-newsletter-form">
          <input type="email" placeholder="${this.t('email')}" required style="flex:1; padding:0.8rem 1.5rem; border-radius:30px; border:1px solid var(--border-color); background:rgba(255,255,255,0.7); min-width:250px;">
          <button type="submit" class="btn-luxury">${this.t('subscribe')}</button>
        </form>
      </section>
    `;
  }

  // Shop View
  renderShopView() {
    const products = store.getProducts();
    const categories = store.getCategories();
    const isAr = this.isRtl();

    let filtered = products;

    if (this.activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.nameEn.toLowerCase().includes(q) || 
        p.nameAr.includes(q) ||
        p.descriptionEn.toLowerCase().includes(q) ||
        p.descriptionAr.includes(q)
      );
    }

    filtered = filtered.filter(p => p.price <= this.priceLimit);

    if (this.sortOrder === 'low-high') {
      filtered.sort((a,b) => a.price - b.price);
    } else if (this.sortOrder === 'high-low') {
      filtered.sort((a,b) => b.price - a.price);
    }

    return `
      <div class="shop-catalog-layout">
        <!-- Filter sidebar -->
        <aside class="shop-sidebar">
          <!-- Search Widget -->
          <div class="sidebar-widget glass-panel">
            <h3 class="widget-title">${isAr ? 'البحث في المعرض' : 'Search Store'}</h3>
            <input type="text" id="shop-search-field" placeholder="${this.t('search_placeholder')}" value="${this.searchQuery}" style="width:100%; padding:0.6rem 1rem; border-radius:8px; border:1px solid var(--border-color); background:rgba(255,255,255,0.5);">
          </div>

          <!-- Category widget -->
          <div class="sidebar-widget glass-panel">
            <h3 class="widget-title">${this.t('categories')}</h3>
            <div style="display:flex; flex-direction:column; gap:0.6rem;">
              <button class="shop-cat-filter-btn ${this.activeCategory === 'All' ? 'active' : ''}" data-cat="All" style="text-align:start; background:none; border:none; cursor:pointer; font-weight:${this.activeCategory === 'All' ? '700' : 'normal'}; color:${this.activeCategory === 'All' ? 'var(--primary-color)' : 'inherit'}; font-size:0.95rem;">
                👉 ${this.t('all_products')}
              </button>
              ${categories.map(cat => {
                // Find category translation name
                const prodWithCat = products.find(pr => pr.category === cat);
                const nameShow = (isAr && prodWithCat) ? prodWithCat.categoryAr : cat;
                return `
                  <button class="shop-cat-filter-btn ${this.activeCategory === cat ? 'active' : ''}" data-cat="${cat}" style="text-align:start; background:none; border:none; cursor:pointer; font-weight:${this.activeCategory === cat ? '700' : 'normal'}; color:${this.activeCategory === cat ? 'var(--primary-color)' : 'inherit'}; font-size:0.95rem;">
                    👉 ${nameShow}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Price filter -->
          <div class="sidebar-widget glass-panel">
            <h3 class="widget-title">${this.t('price_filter')}</h3>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.5rem; font-weight:700;">
              <span>$10</span>
              <span style="color:var(--primary-color); font-size:1rem;">$${this.priceLimit}</span>
            </div>
            <input type="range" id="shop-price-slider" min="10" max="300" step="5" value="${this.priceLimit}" style="width:100%; accent-color:var(--primary-color); cursor:pointer;">
          </div>

          <!-- Price sorting widget -->
          <div class="sidebar-widget glass-panel">
            <h3 class="widget-title">${this.t('sort_by')}</h3>
            <select id="shop-sort-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid var(--border-color); background:rgba(255,255,255,0.5); font-family:inherit;">
              <option value="default" ${this.sortOrder === 'default' ? 'selected' : ''}>Default</option>
              <option value="low-high" ${this.sortOrder === 'low-high' ? 'selected' : ''}>Price: Low to High</option>
              <option value="high-low" ${this.sortOrder === 'high-low' ? 'selected' : ''}>Price: High to Low</option>
            </select>
          </div>
        </aside>

        <!-- Product grid content -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; font-size:0.95rem; font-weight:600;">
            <span>${filtered.length} ${isAr ? 'منتجات عُثر عليها' : 'crochet items found'}</span>
          </div>

          <div class="crochet-grid" id="shop-products-grid">
            ${filtered.map(p => this.renderProductCard(p)).join('')}
            ${filtered.length === 0 ? `
              <div style="grid-column: 1 / -1; padding: 6rem; text-align:center; color:var(--text-color); opacity:0.6;">
                <span style="font-size:3.5rem; display:block;">🧶</span>
                <p style="margin-top:1.5rem; font-size:1.1rem; font-weight:700;">${isAr ? 'عذراً، لم يعثر على أي منتجات مطابقة للبحث' : 'No items match your selected filters.'}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  renderProductCard(p) {
    const isWished = this.wishlist.includes(p.id);
    const isOutOfStock = p.inventory <= 0;
    const isAr = this.isRtl();
    const name = isAr ? p.nameAr : p.nameEn;
    const cat = isAr ? p.categoryAr : p.category;

    return `
      <div class="crochet-card" data-product-id="${p.id}">
        <div class="card-image-panel">
          <img class="card-image open-details-trigger" src="${p.image}" alt="${name}" style="cursor:pointer;">
          ${isOutOfStock ? `<div class="card-badge" style="background:#ef4444;">${isAr ? 'نفذت الكمية' : 'Out of Stock'}</div>` : ''}
          <div class="card-action-overlay">
            <button class="overlay-action-btn wish-toggle-btn" data-product-id="${p.id}" title="Wishlist">${isWished ? '❤️' : '🤍'}</button>
            <button class="overlay-action-btn quick-view-btn" data-product-id="${p.id}" title="Quick View">👁️</button>
          </div>
        </div>
        
        <div class="card-info">
          <span class="card-category">${cat}</span>
          <h3 class="card-title open-details-trigger" style="cursor:pointer; font-size:1rem; line-height:1.4;">${name}</h3>
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:0.75rem; border-top:1px solid rgba(120,53,15,0.05);">
            <span class="card-price" style="font-size:1.1rem; font-weight:800;">${this.formatPrice(p.price)}</span>
            <button class="btn-luxury quick-buy-btn" data-product-id="${p.id}" ${isOutOfStock ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} style="padding:0.4rem 0.8rem; font-size:0.75rem; border-radius:15px;">
              ＋ ${isAr ? 'أضف' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Product Details page zoom view
  renderDetailsView() {
    const hash = window.location.hash || '#details-1';
    const prodId = hash.split('-')[1] || '1';
    const products = store.getProducts();
    const p = products.find(prod => prod.id === prodId);
    const isAr = this.isRtl();

    if (!p) {
      return `<div style="padding:5rem; text-align:center; font-weight:700;">Product not found.</div>`;
    }

    const name = isAr ? p.nameAr : p.nameEn;
    const cat = isAr ? p.categoryAr : p.category;
    const desc = isAr ? p.descriptionAr : p.descriptionEn;
    const materials = isAr ? p.materialsAr : p.materialsEn;
    const process = isAr ? p.processAr : p.processEn;

    return `
      <div class="details-page-layout">
        <!-- Zoom Image Container -->
        <div class="zoom-image-container" id="zoom-container">
          <img id="details-zoom-img" src="${p.image}" alt="${name}">
        </div>

        <!-- Description panel -->
        <div style="display:flex; flex-direction:column; gap:1.5rem; text-align:start;">
          <span style="font-size:0.85rem; text-transform:uppercase; color:var(--primary-color); font-weight:700;">${cat}</span>
          <h1 style="font-size:2.8rem; font-family:var(--font-heading); line-height:1.2; font-weight:700; color:var(--text-color);">${name}</h1>
          <div style="font-size:2rem; font-weight:900; color:var(--primary-color);">${this.formatPrice(p.price)}</div>

          <p style="opacity:0.85; line-height:1.7; font-size:1rem;">${desc}</p>

          <div style="border-top:1px solid var(--border-color); padding-top:1.25rem;">
            <strong>🧶 ${this.t('materials')}</strong>
            <p style="opacity:0.8; font-size:0.9rem; margin-top:0.25rem;">${materials}</p>
          </div>

          <div>
            <strong>⏳ ${this.t('knit_process')}</strong>
            <p style="opacity:0.8; font-size:0.9rem; margin-top:0.25rem;">${process}</p>
          </div>

          <!-- Color option circles -->
          <div>
            <strong>🎨 ${this.t('colors')}</strong>
            <div style="display:flex; gap:0.6rem; margin-top:0.5rem;">
              ${(p.colors || ["Cream", "Terracotta"]).map((col, idx) => {
                const colorCode = col === 'Terracotta' ? '#c2410c' : (col === 'Cream' ? '#f5efe6' : (col === 'Mustard' ? '#d97706' : (col === 'Emerald' ? '#047857' : '#64748b')));
                return `
                  <div class="color-dot-selector ${idx === 0 ? 'selected' : ''}" data-color="${col}" title="${col}" style="background-color: ${colorCode}; border:1px solid rgba(0,0,0,0.15);"></div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Size buttons selector -->
          <div>
            <strong>📏 ${this.t('sizes')}</strong>
            <div style="display:flex; gap:0.6rem; margin-top:0.5rem;">
              ${(p.sizes || ["S", "M", "L"]).map((sz, idx) => `
                <button class="btn-luxury-outline size-select-btn ${idx === 0 ? 'active' : ''}" data-size="${sz}" style="padding:0.4rem 1.2rem; font-size:0.85rem; border-radius:15px; min-width:48px;">
                  ${sz}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Cart integrations -->
          <div style="display:flex; gap:1.25rem; align-items:center; margin-top:1.5rem; flex-wrap:wrap;">
            <div class="quantity-selector">
              <button class="qty-btn" id="details-dec-qty">-</button>
              <span class="qty-val" id="details-qty-val">1</span>
              <button class="qty-btn" id="details-inc-qty">+</button>
            </div>

            <button class="btn-luxury" id="details-add-to-cart-btn" style="flex:1; justify-content:center; font-weight:700; padding:0.9rem;">
              🛒 ${this.t('add_to_cart')}
            </button>
            <button class="btn-luxury-outline" id="details-buy-now-btn" style="flex:1; justify-content:center; font-weight:700; padding:0.9rem;">
              ⚡ ${this.t('buy_now')}
            </button>
          </div>
        </div>
      </div>

      <!-- Related designs carousel -->
      <section style="padding:4rem 6%; border-top:1px solid var(--border-color); background:rgba(120,53,15,0.015);">
        <h2 style="font-size:2rem; font-family:var(--font-heading); margin-bottom:2.5rem; text-align:center;">${this.t('related_products')}</h2>
        <div class="crochet-grid">
          ${products.filter(prod => prod.id !== p.id).slice(0, 3).map(prod => this.renderProductCard(prod)).join('')}
        </div>
      </section>
    `;
  }

  // Custom Orders View
  renderCustomOrdersView() {
    const isAr = this.isRtl();
    return `
      <div class="custom-order-layout">
        <!-- Order customizer panel -->
        <div class="glass-panel" style="padding:3rem; border-radius:var(--border-radius-lg); text-align:start;">
          <span style="font-size:0.8rem; text-transform:uppercase; color:var(--primary-color); font-weight:700; display:block; margin-bottom:0.5rem;">Artisan customizer</span>
          <h1 style="font-size:2.6rem; margin-bottom:1rem; font-weight:700; line-height:1.2;">${this.t('custom_title')}</h1>
          <p style="opacity:0.85; margin-bottom:2rem; font-size:1rem; line-height:1.7;">${this.t('custom_desc')}</p>

          <form id="custom-knit-request-form" style="display:flex; flex-direction:column; gap:1.25rem;">
            <div class="checkout-form-grid">
              <div class="form-group">
                <label>${this.t('name')}</label>
                <input type="text" id="cust-name" required value="${this.customerName}">
              </div>
              <div class="form-group">
                <label>${this.t('email')}</label>
                <input type="email" id="cust-email" required value="${this.customerEmail}">
              </div>
            </div>

            <div class="form-group">
              <label>${this.t('description')}</label>
              <textarea id="cust-spec" rows="4" placeholder="${isAr ? 'مثال: سترة كروب بأكمام واسعة وزخارف وردة دوار الشمس، مقاس متوسط...' : 'e.g. A cropped thick knit cardigan with bell sleeves and sunflower squares...'}" required></textarea>
            </div>

            <div class="checkout-form-grid">
              <div class="form-group">
                <label>${this.t('sizes')}</label>
                <select id="cust-size" style="background:#fff; border:1px solid var(--border-color); padding:0.6rem; border-radius:8px;">
                  <option value="S">Small (S)</option>
                  <option value="M" selected>Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">Extra Large (XL)</option>
                </select>
              </div>
              <div class="form-group">
                <label>${this.t('budget')} ($)</label>
                <input type="number" id="cust-budget" placeholder="e.g. 150" required>
              </div>
            </div>

            <div class="checkout-form-grid">
              <div class="form-group">
                <label>${this.t('date')}</label>
                <input type="date" id="cust-date" required>
              </div>
              <div class="form-group">
                <label>${this.t('upload_image')}</label>
                <input type="file" id="cust-file" accept="image/*" style="background:rgba(0,0,0,0.02); padding:0.45rem; border-radius:8px; border:1px dashed var(--border-color);">
              </div>
            </div>

            <button type="submit" class="btn-luxury mt-4" style="justify-content:center; padding:1rem; font-weight:700;">
              🚀 ${this.t('submit_request')}
            </button>
          </form>
        </div>

        <!-- Sidebar notes -->
        <div style="display:flex; flex-direction:column; gap:2rem; text-align:start;">
          <div class="glass-panel" style="padding:2rem; border-radius:var(--border-radius-md);">
            <h3 style="font-size:1.15rem; margin-bottom:1rem;">🧶 ${isAr ? 'مراحل العمل والإنتاج اليدوي' : 'Handcrafted Production'}</h3>
            <ul style="display:flex; flex-direction:column; gap:1rem; padding-inline-start:1.25rem; font-size:0.9rem; opacity:0.85;">
              <li>${isAr ? 'مراجعة الموديل وتأكيد الأبعاد من قبل كبير الحياكات.' : 'Our head artisan reviews design patterns and details.'}</li>
              <li>${isAr ? 'صبغ خيوط الصوف والقطن الطبيعي بالألوان والدرجات المطلوبة.' : 'Sourcing organic, non-toxic plant dyed cotton yarns.'}</li>
              <li>${isAr ? 'الحياكة اليدوية الدقيقة التي قد تستغرق من 10 إلى 25 ساعة.' : 'Precision hand-stitching over 10-25 hours.'}</li>
              <li>${isAr ? 'تغليف القطعة الفاخر وإرفاق شهادة الأصالة الموقعة.' : 'Luxury wrapping with signed certificate of authenticity.'}</li>
            </ul>
          </div>

          <div class="glass-panel" style="padding:2rem; border-radius:var(--border-radius-md); text-align:center;">
            <span style="font-size:3rem; display:block; margin-bottom:0.5rem;">🎨</span>
            <h4 style="margin-bottom:0.5rem;">${isAr ? 'استشارة تنسيق الألوان' : 'Need Color Advice?'}</h4>
            <p style="opacity:0.8; font-size:0.85rem; margin-bottom:1.5rem;">${isAr ? 'تحدث مباشرة مع خبيرة الحياكة للحصول على ترشيحات الألوان المتاحة.' : 'Chat directly with our head knitter on WhatsApp for styling suggestions.'}</p>
            <a href="https://wa.me/${store.getSettings().whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi,%20I'm%20planning%20a%20custom%20order%20and%20need%20color%20suggestions." target="_blank" class="btn-luxury-outline" style="width:100%; justify-content:center;">WhatsApp Chat</a>
          </div>
        </div>
      </div>
    `;
  }

  renderGalleryView() {
    const isAr = this.isRtl();
    return `
      <div style="padding:4rem 6%;">
        <h1 style="font-size:2.8rem; margin-bottom:0.5rem; text-align:center;">${this.t('gallery')}</h1>
        <p style="text-align:center; opacity:0.7; margin-bottom:3rem;">${isAr ? 'ألبوم صور من ورش العمل وقطع الكروشيه الفاخرة' : 'A visual look inside our warm workshops and completed designs.'}</p>

        <div class="masonry-grid">
          ${[1,2,3,4,5,6,7,8].map(i => `
            <div class="masonry-item glass-panel" style="position:relative;">
              <div style="padding-top:${i % 2 === 0 ? '120%' : '85%'}; background:rgba(0,0,0,0.02); display:flex; align-items:center; justify-content:center;">
                <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem;">
                  <span style="font-size:2rem;">🧶</span>
                  <span style="font-size:0.75rem; opacity:0.6;">Artisan Stitch Row #${i}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderBlogView() {
    const isAr = this.isRtl();
    return `
      <div style="padding:4rem 6%; max-width:900px; margin:0 auto; text-align:start;">
        <h1 style="font-size:2.8rem; margin-bottom:0.5rem; text-align:center;">${this.t('blog')}</h1>
        <p style="text-align:center; opacity:0.7; margin-bottom:3rem;">${isAr ? 'تعلم كيفية العناية والاحتفاظ بملابس الكروشيه الخاصة بك' : 'Artisan tips, crochet caring guides, and wool secrets.'}</p>

        <div style="display:flex; flex-direction:column; gap:3rem;">
          <article class="glass-panel" style="padding:2.5rem; border-radius:var(--border-radius-lg);">
            <span style="font-size:0.8rem; color:var(--primary-color); font-weight:700; text-transform:uppercase;">${isAr ? 'تعليمات العناية' : 'Care Guide'}</span>
            <h2 style="font-size:2rem; margin-top:0.5rem; margin-bottom:1rem;">How to wash and preserve handmade crochet cardigans</h2>
            <p style="opacity:0.85; margin-bottom:1.5rem;">Hand-knit cardigans require delicate washing to prevent stretching. We recommend hand-washing in cool water using light olive-oil soap and laying flat to dry...</p>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; opacity:0.6;">
              <span>Reading: 5 mins</span>
              <span>By Artisan Hoda</span>
            </div>
          </article>

          <article class="glass-panel" style="padding:2.5rem; border-radius:var(--border-radius-lg);">
            <span style="font-size:0.8rem; color:var(--primary-color); font-weight:700; text-transform:uppercase;">${isAr ? 'أسرار الحرفة' : 'Craft Secret'}</span>
            <h2 style="font-size:2rem; margin-top:0.5rem; margin-bottom:1rem;">The art of organic plant dyeing for soft wool yarns</h2>
            <p style="opacity:0.85; margin-bottom:1.5rem;">Learn how we boil onion skins, walnut shells, and pomegranate skins to dye our cotton cords beige, terracotta, and soft brown without chemicals...</p>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; opacity:0.6;">
              <span>Reading: 7 mins</span>
              <span>By Artisan Hoda</span>
            </div>
          </article>
        </div>
      </div>
    `;
  }

  renderAboutView() {
    const isAr = this.isRtl();
    return `
      <div style="max-width:1000px; margin:0 auto; padding:4rem 6%; display:flex; flex-direction:column; gap:4rem; text-align:start;">
        <div>
          <span style="font-size:0.8rem; text-transform:uppercase; color:var(--primary-color); font-weight:700;">${isAr ? 'رؤيتنا ورسالتنا' : 'Our Story'}</span>
          <h1 style="font-size:2.8rem; margin-top:0.5rem; margin-bottom:1.5rem;">Sustaining the Craft, Honoring the Stitch</h1>
          <p style="opacity:0.85; line-height:1.8; font-size:1.1rem; margin-bottom:1.5rem;">
            ${isAr ? 'بدأت قصتنا في قلب أسواق جبيل الأثرية برؤية تهدف لإحياء حرفة الكروشيه ودعم الحرفيات في المناطق الريفية. كل قطعة كروشيه تطلبها توفر عملاً كريماً ومستداماً لهؤلاء السيدات وتضمن توارث أسرار الصنعة عبر الأجيال.' : 'Our journey began in Byblos, Lebanon, with a vision to sustain the heritage craft of hand-knitting. We provide local women knitters with flexible, fair-wage livelihoods, allowing them to practice their passion while supporting their families.'}
          </p>
        </div>

        <div class="glass-panel" style="padding:3rem; border-radius:var(--border-radius-lg);">
          <span style="font-size:0.8rem; color:var(--primary-color); font-weight:700;">MEET THE ARTISAN</span>
          <h2 style="font-size:2rem; margin-top:0.5rem; margin-bottom:1rem;">Artisan Hoda, Head Knitter</h2>
          <p style="opacity:0.85; line-height:1.8; font-size:1rem; margin-bottom:1.5rem;">"Crochet is a language of knots. I have been knitting since I was 9 years old, taught by my grandmother. Stitching custom cardigans is my way of writing stories into yarn."</p>
          <div style="background:var(--bg-color); padding:1rem; border-radius:8px; display:inline-block; font-size:0.9rem; font-weight:700;">📜 Authentic Handmade Heritage Approved</div>
        </div>
      </div>
    `;
  }

  renderContactView() {
    const isAr = this.isRtl();
    const settings = store.getSettings();

    return `
      <div style="max-width:1200px; margin:0 auto; padding:4rem 6%; text-align:start;">
        <h1 style="font-size:2.8rem; margin-bottom:2rem; text-align:center;">${this.t('contact')}</h1>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:start;">
          <div>
            <h3 style="font-size:1.5rem; margin-bottom:1rem;">Send a Note</h3>
            <form id="storefront-contact-form" style="display:flex; flex-direction:column; gap:1.25rem;">
              <div class="form-group">
                <label>${this.t('name')}</label>
                <input type="text" required>
              </div>
              <div class="form-group">
                <label>${this.t('email')}</label>
                <input type="email" required>
              </div>
              <div class="form-group">
                <label>${isAr ? 'نص الرسالة' : 'Message'}</label>
                <textarea rows="4" required></textarea>
              </div>
              <button type="submit" class="btn-luxury">${isAr ? 'إرسال الرسالة' : 'Send Message'}</button>
            </form>
          </div>

          <div style="display:flex; flex-direction:column; gap:2rem;">
            <div class="glass-panel" style="padding:2.5rem; border-radius:var(--border-radius-md);">
              <h3 style="font-size:1.3rem; margin-bottom:1.25rem;">Contact Information</h3>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <div>📍 <strong>Address:</strong> ${settings.contactAddress}</div>
                <div>✉️ <strong>Email:</strong> ${settings.contactEmail}</div>
                <div>📞 <strong>Phone:</strong> ${settings.contactPhone}</div>
                <div>💬 <strong>WhatsApp:</strong> ${settings.whatsappNumber}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Cart drawer item rendering
  renderCartItems() {
    const container = document.getElementById('cart-items-list-container');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:4rem 0; color:var(--text-color); opacity:0.6;">
          <span style="font-size:3.5rem; display:block; margin-bottom:1rem;">🛒</span>
          <p style="font-weight:700;">${this.t('empty_cart')}</p>
        </div>
      `;
      return;
    }

    const isAr = this.isRtl();
    const products = store.getProducts();

    container.innerHTML = this.cart.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const img = prod ? prod.image : '';
      const stock = prod ? prod.inventory : 100;
      const name = isAr ? item.nameAr : item.nameEn;

      return `
        <div style="display:flex; gap:1rem; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1.25rem;">
          <img src="${img}" style="width:65px; height:65px; object-fit:cover; border-radius:8px; border:1px solid var(--border-color);" alt="">
          <div style="flex:1;">
            <h4 style="font-size:0.95rem; font-weight:700; line-height:1.3;">${name}</h4>
            <div style="font-size:0.75rem; opacity:0.6; margin-top:0.2rem;">Size: ${item.size} / Color: ${item.color}</div>
            <div style="font-weight:800; color:var(--primary-color); font-size:0.95rem; margin-top:0.25rem;">${this.formatPrice(item.price)}</div>
            
            <div class="quantity-selector" style="margin-top:0.5rem; width:fit-content;">
              <button class="qty-btn cart-dec-qty" data-id="${item.productId}" data-size="${item.size}" data-color="${item.color}">-</button>
              <span class="qty-val" style="font-size:0.85rem;">${item.quantity}</span>
              <button class="qty-btn cart-inc-qty" data-id="${item.productId}" data-size="${item.size}" data-color="${item.color}" ${item.quantity >= stock ? 'disabled style="opacity:0.3;"' : ''}>+</button>
            </div>
          </div>
          <button class="cart-remove-item" data-id="${item.productId}" data-size="${item.size}" data-color="${item.color}" style="color:#ef4444; font-size:1.2rem; padding:0.5rem; background:none; border:none; cursor:pointer;">🗑️</button>
        </div>
      `;
    }).join('');
  }

  // Cart summary calculations
  renderCartSummary() {
    const container = document.getElementById('cart-summary-container');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = '';
      return;
    }

    const products = store.getProducts();
    let subtotal = 0;
    this.cart.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const price = prod ? prod.price : item.price;
      subtotal += price * item.quantity;
    });

    let giftWrapFee = this.giftWrappingActive ? 5.00 : 0.00;

    // Automatic discounts
    const auto = CouponEngine.getAutomaticDiscounts(subtotal, this.customerEmail);
    let autoDisc = 0;
    auto.forEach(ad => autoDisc += ad.discountAmount);

    const subAfterAuto = Math.max(0, subtotal - autoDisc);

    // Coupon discounts
    let couponDisc = 0;
    let isFreeShipping = false;

    if (this.appliedCouponCode) {
      const res = CouponEngine.validateAndApply(this.appliedCouponCode, this.cart, this.customerEmail);
      const statusBox = document.getElementById('coupon-status-box');
      if (res.isValid) {
        couponDisc = res.discountAmount;
        if (res.type === 'free_shipping') isFreeShipping = true;

        if (statusBox) statusBox.innerHTML = `
          <div style="background:rgba(16,185,129,0.1); color:#10b981; padding:0.5rem; border-radius:6px; font-size:0.8rem; display:flex; justify-content:space-between; margin-top:0.5rem; align-items:center;">
            <span>🎟️ <strong>${res.code}</strong> applied (-${this.formatPrice(couponDisc)}${isFreeShipping ? ' + Free Ship' : ''})</span>
            <button id="cart-remove-coupon-btn" style="color:#ef4444; background:none; border:none; cursor:pointer; font-weight:700;">✕</button>
          </div>
        `;
      } else {
        if (statusBox) statusBox.innerHTML = `<div style="color:#ef4444; font-size:0.8rem; margin-top:0.5rem;">❌ ${res.error}</div>`;
        this.appliedCouponCode = '';
      }
    } else {
      const statusBox = document.getElementById('coupon-status-box');
      if (statusBox) statusBox.innerHTML = '';
    }

    const subAfterCoupon = Math.max(0, subAfterAuto - couponDisc);
    const shipping = CouponEngine.calculateShipping(subAfterCoupon, isFreeShipping);
    const total = subAfterCoupon + shipping + giftWrapFee;

    const earnedPoints = Math.floor(total * 0.1);
    const isAr = this.isRtl();

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; opacity:0.8;">
        <span>${this.t('subtotal')}</span>
        <span>${this.formatPrice(subtotal)}</span>
      </div>
      ${giftWrapFee > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; opacity:0.8;">
          <span>${isAr ? 'تغليف الهدايا' : 'Gift Wrapping'}</span>
          <span>+ ${this.formatPrice(giftWrapFee)}</span>
        </div>
      ` : ''}
      ${auto.map(ad => `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:#10b981;">
          <span>🎁 ${isAr ? (ad.textAr || ad.text) : ad.text}</span>
          <span>- ${this.formatPrice(ad.discountAmount)}</span>
        </div>
      `).join('')}
      ${couponDisc > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:#10b981;">
          <span>🎟️ ${isAr ? 'كوبون خصم' : 'Coupon'} (${this.appliedCouponCode})</span>
          <span>- ${this.formatPrice(couponDisc)}</span>
        </div>
      ` : ''}
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; opacity:0.8;">
        <span>${this.t('shipping')}</span>
        <span>${shipping === 0 ? `<span style="color:#10b981; font-weight:700;">${isAr ? 'مجانى' : 'FREE'}</span>` : `+ ${this.formatPrice(shipping)}`}</span>
      </div>
      <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-color); padding-top:0.75rem; margin-top:0.75rem; font-size:1.3rem; font-weight:800;">
        <span>${this.t('total')}</span>
        <span>${this.formatPrice(total)}</span>
      </div>
      <div style="font-size:0.75rem; opacity:0.8; text-align:center; margin-top:0.5rem; color:var(--primary-color);">
        ✨ ${isAr ? `ستكسب ${earnedPoints} نقطة ولاء ومكافأة!` : `Earns ${earnedPoints} loyalty reward points!`}
      </div>
      <button class="btn-luxury" id="cart-checkout-btn" style="width:100%; margin-top:1rem; justify-content:center; padding:0.9rem;">
        💳 ${this.t('checkout')}
      </button>
    `;
  }

  updateCartBadge() {
    const badge = document.getElementById('cart-badge-val');
    if (!badge) return;
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = count;
    badge.style.display = count === 0 ? 'none' : 'flex';
  }

  showQuickView(productId) {
    const products = store.getProducts();
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    const overlay = document.getElementById('quick-view-overlay');
    const container = document.getElementById('quick-view-container');
    if (!overlay || !container) return;

    const isAr = this.isRtl();
    const name = isAr ? p.nameAr : p.nameEn;
    const cat = isAr ? p.categoryAr : p.category;
    const desc = isAr ? p.descriptionAr : p.descriptionEn;

    container.innerHTML = `
      <button class="modal-close" id="close-quick-view-btn">✕</button>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:2.5rem; padding:1.5rem; text-align:start;">
        <div>
          <img src="${p.image}" style="width:100%; height:320px; object-fit:cover; border-radius:12px; border:1px solid var(--border-color);" alt="">
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <span style="font-size:0.8rem; color:var(--primary-color); font-weight:700; text-transform:uppercase;">${cat}</span>
          <h2 style="font-family:var(--font-heading); font-size:1.8rem; margin:0; line-height:1.2;">${name}</h2>
          <div style="font-size:1.6rem; font-weight:900; color:var(--primary-color);">${this.formatPrice(p.price)}</div>
          <p style="opacity:0.85; font-size:0.9rem; line-height:1.6;">${desc}</p>
          
          <div style="display:flex; gap:1rem; margin-top:auto; padding-top:1rem;">
            <a href="#details-${p.id}" class="btn-luxury-outline" style="flex:1; justify-content:center; font-size:0.85rem;" id="quick-view-full-details-btn">${isAr ? 'عرض التفاصيل' : 'Specs details'}</a>
            <button class="btn-luxury" id="quick-view-add-cart-btn" style="flex:1; justify-content:center; font-size:0.85rem;">＋ ${this.t('add_to_cart')}</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#close-quick-view-btn').addEventListener('click', () => overlay.classList.remove('active'));
    container.querySelector('#quick-view-full-details-btn').addEventListener('click', () => overlay.classList.remove('active'));
    
    container.querySelector('#quick-view-add-cart-btn').addEventListener('click', () => {
      this.addToCart(p.id, 1);
      overlay.classList.remove('active');
    });

    overlay.classList.add('active');
  }

  showCheckoutModal() {
    const overlay = document.getElementById('checkout-overlay');
    const container = document.getElementById('checkout-container');
    if (!overlay || !container) return;

    const isAr = this.isRtl();
    container.innerHTML = `
      <button class="modal-close" id="close-checkout-btn">✕</button>
      <h2 style="font-family:var(--font-heading); margin-bottom:1.5rem; text-align:start;">${isAr ? 'بوابة الدفع الآمنة Stripe' : 'Stripe Luxury Secured Checkout'}</h2>

      <form id="stripe-checkout-form" style="display:flex; flex-direction:column; gap:1.25rem; text-align:start;">
        <div class="checkout-form-grid">
          <div class="form-group">
            <label>${this.t('name')}</label>
            <input type="text" id="chk-name" required value="${this.customerName}">
          </div>
          <div class="form-group">
            <label>${this.t('email')}</label>
            <input type="email" id="chk-email" required value="${this.customerEmail}">
          </div>
        </div>

        <div class="form-group">
          <label>${isAr ? 'عنوان الشحن والتسليم' : 'Shipping Delivery Address'}</label>
          <textarea id="chk-address" rows="2" placeholder="e.g. Byblos, Old Souks, Lebanon" required></textarea>
        </div>

        <div style="background:rgba(120,53,15,0.02); border:1px solid var(--border-color); padding:1.25rem; border-radius:8px; display:flex; flex-direction:column; gap:0.8rem;">
          <div style="font-size:0.85rem; font-weight:700; color:var(--primary-color);">🔒 Secured Credit Card Sheet</div>
          <input type="text" placeholder="Card Number (4242 4242 4242 4242)" required style="padding:0.6rem; border-radius:6px; border:1px solid var(--border-color);">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
            <input type="text" placeholder="MM / YY" required style="padding:0.6rem; border-radius:6px; border:1px solid var(--border-color);">
            <input type="text" placeholder="CVC" required style="padding:0.6rem; border-radius:6px; border:1px solid var(--border-color);">
          </div>
        </div>

        <button type="submit" class="btn-luxury mt-4" style="justify-content:center; padding:1rem; font-weight:700;">
          💳 ${isAr ? 'تأكيد الدفع وإتمام الطلب' : 'Complete Payment'}
        </button>
      </form>
    `;

    container.querySelector('#close-checkout-btn').addEventListener('click', () => overlay.classList.remove('active'));
    container.querySelector('#stripe-checkout-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.completeOrder(e.target);
    });

    overlay.classList.add('active');
  }

  completeOrder(formElement) {
    const products = store.getProducts();
    let subtotal = 0;
    this.cart.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const price = prod ? prod.price : item.price;
      subtotal += price * item.quantity;
    });

    let giftWrapFee = this.giftWrappingActive ? 5.00 : 0.00;
    const auto = CouponEngine.getAutomaticDiscounts(subtotal, this.customerEmail);
    let autoDisc = 0;
    auto.forEach(ad => autoDisc += ad.discountAmount);

    const subAfterAuto = Math.max(0, subtotal - autoDisc);
    let couponDisc = 0;
    let isFreeShipping = false;
    if (this.appliedCouponCode) {
      const res = CouponEngine.validateAndApply(this.appliedCouponCode, this.cart, this.customerEmail);
      if (res.isValid) {
        couponDisc = res.discountAmount;
        if (res.type === 'free_shipping') isFreeShipping = true;
      }
    }

    const subAfterCoupon = Math.max(0, subAfterAuto - couponDisc);
    const shipping = CouponEngine.calculateShipping(subAfterCoupon, isFreeShipping);
    const total = parseFloat((subAfterCoupon + shipping + giftWrapFee).toFixed(2));

    const name = formElement.querySelector('#chk-name').value.trim();
    const email = formElement.querySelector('#chk-email').value.trim();
    const address = formElement.querySelector('#chk-address').value.trim();

    // Deduct inventory
    const updatedProducts = products.map(p => {
      const cartItem = this.cart.find(c => c.productId === p.id);
      if (cartItem) {
        return { ...p, inventory: Math.max(0, p.inventory - cartItem.quantity) };
      }
      return p;
    });
    store.saveProducts(updatedProducts);

    // Save order
    const orderObj = {
      customerName: name,
      email,
      shippingAddress: address,
      items: [...this.cart],
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountApplied: parseFloat((autoDisc + couponDisc).toFixed(2)),
      couponCode: this.appliedCouponCode,
      shippingCost: shipping,
      giftWrapActive: this.giftWrappingActive,
      includeCertificate: this.includeCertificate,
      total,
      date: new Date().toISOString()
    };
    const saved = store.addOrder(orderObj);

    // Render Success Modal
    const isAr = this.isRtl();
    const container = document.getElementById('checkout-container');
    container.innerHTML = `
      <div style="text-align:center; padding:2rem 1rem;">
        <span style="font-size:4.5rem; display:block; margin-bottom:1rem;">🧶</span>
        <h2 style="font-family:var(--font-heading); margin-bottom:1rem; font-weight:700;">
          ${isAr ? 'تم بدء حياكة قطعتك الخاصة!' : 'Artisanal Stitching Initiated!'}
        </h2>
        <p style="opacity:0.85; margin-bottom:2rem;">
          ${isAr ? `شكراً لك، ${name}. تمت عملية الدفع بنجاح ويقوم الحرفيون لدينا بتجهيز طلبك حالياً.` : `Thank you, ${name}. Your card has been processed and our knitters are preparing your package.`}
        </p>

        <div class="glass-panel" style="padding:1.5rem; border-radius:12px; text-align:start; margin-bottom:2rem; font-size:0.95rem;">
          <div><strong>Order ID:</strong> <span style="font-weight:700; color:var(--primary-color);">${saved.id}</span></div>
          <div><strong>Total Paid:</strong> ${this.formatPrice(total)}</div>
          <div><strong>Delivery Address:</strong> ${address}</div>
        </div>

        <button class="btn-luxury" id="checkout-success-btn" style="width:100%; justify-content:center;">
          ${isAr ? 'العودة للمتجر' : 'Return to Collection'}
        </button>
      </div>
    `;

    this.celebrateConfetti();
    this.clearCart();

    container.querySelector('#checkout-success-btn').addEventListener('click', () => {
      document.getElementById('checkout-overlay').classList.remove('active');
      document.getElementById('cart-drawer').classList.remove('active');
      document.getElementById('cart-drawer-overlay').classList.remove('active');
      window.location.hash = '#shop';
    });
  }

  clearCart() {
    this.cart = [];
    this.appliedCouponCode = '';
    this.giftWrappingActive = false;
    this.saveCart();
  }

  celebrateConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#c2410c', '#ea580c', '#f5efe6', '#d97706', '#854d0e'];
    const particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        r: Math.random() * 6 + 4,
        dy: Math.random() * 3 + 2,
        dx: Math.random() * 4 - 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const end = Date.now() + 2500;
    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.dy;
        p.x += p.dx;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      if (Date.now() < end) requestAnimationFrame(frame);
      else canvas.remove();
    };
    frame();
  }

  showUserPortal() {
    const overlay = document.getElementById('user-auth-overlay');
    const container = document.getElementById('user-auth-container');
    if (!overlay || !container) return;

    const isAr = this.isRtl();

    if (this.userLoggedIn) {
      // User Dashboard
      const orders = store.getOrders().filter(o => o.email.toLowerCase() === this.userEmail.toLowerCase());
      const points = 150 + orders.reduce((sum, o) => sum + Math.floor(o.total * 0.1), 0);

      container.innerHTML = `
        <button class="modal-close" id="close-user-portal-btn">✕</button>
        <h2 style="font-family:var(--font-heading); margin-bottom:1.5rem; text-align:start;">${isAr ? 'بوابة المكافآت والولاء' : 'Artisan Rewards Dashboard'}</h2>

        <div style="display:flex; flex-direction:column; gap:1.25rem; text-align:start;">
          <div style="display:flex; justify-content:space-between; background:var(--card-bg-color); padding:1rem; border-radius:8px;">
            <span>${isAr ? 'نقاط الولاء المكتسبة:' : 'Loyalty Reward Points:'}</span>
            <strong style="color:var(--primary-color);">${points} ${isAr ? 'نقطة' : 'Points'}</strong>
          </div>

          <h3>${isAr ? 'تتبع طلباتي المحلية' : 'My Orders Tracking'}</h3>
          <div style="max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:0.8rem;">
            ${orders.map(o => `
              <div class="glass-panel" style="padding:0.75rem; border-radius:8px; font-size:0.85rem;">
                <div style="display:flex; justify-content:space-between; font-weight:700;">
                  <span>${o.id}</span>
                  <span style="color:var(--primary-color);">${o.status}</span>
                </div>
                <div style="font-size:0.75rem; opacity:0.7; margin-top:0.25rem;">Total: ${this.formatPrice(o.total)} - Date: ${new Date(o.date).toLocaleDateString()}</div>
              </div>
            `).join('')}
            ${orders.length === 0 ? `<p style="opacity:0.6; font-size:0.9rem;">${isAr ? 'لا توجد أي طلبات مسجلة تحت هذا الحساب حالياً.' : 'No orders registered under this account.'}</p>` : ''}
          </div>

          <button class="btn-danger" id="user-logout-btn" style="margin-top:1rem; padding:0.6rem; border-radius:8px;">
            ${isAr ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      `;

      container.querySelector('#user-logout-btn').addEventListener('click', () => {
        localStorage.removeItem('user_session_email');
        this.userLoggedIn = false;
        this.userEmail = '';
        overlay.classList.remove('active');
        this.showToast(isAr ? "تم تسجيل الخروج بنجاح" : "Logged out successfully.", "info");
      });

    } else {
      // Login Register
      container.innerHTML = `
        <button class="modal-close" id="close-user-portal-btn">✕</button>
        <h2 style="font-family:var(--font-heading); margin-bottom:1.5rem; text-align:start;">${isAr ? 'تسجيل الدخول / إنشاء حساب' : 'Join the Craft Circle'}</h2>

        <form id="user-login-form" style="display:flex; flex-direction:column; gap:1.25rem; text-align:start;">
          <div class="form-group">
            <label>${this.t('email')}</label>
            <input type="email" id="u-email" required placeholder="name@email.com">
          </div>
          <div class="form-group">
            <label>${isAr ? 'كلمة المرور' : 'Password'}</label>
            <input type="password" id="u-pass" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn-luxury" style="justify-content:center; padding:0.8rem; font-weight:700;">
            ${isAr ? 'دخول / إنشاء حساب' : 'Login / Create Account'}
          </button>
        </form>
      `;

      const form = container.querySelector('#user-login-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('#u-email').value.trim();
        localStorage.setItem('user_session_email', email);
        this.userLoggedIn = true;
        this.userEmail = email;
        overlay.classList.remove('active');
        this.showToast(isAr ? "تم الدخول للحساب بنجاح!" : "Authorized successfully!", "success");
      });
    }

    container.querySelector('#close-user-portal-btn').addEventListener('click', () => overlay.classList.remove('active'));
    overlay.classList.add('active');
  }

  bindGlobalEvents() {
    const isAr = this.isRtl();

    // Reset view on logo clicks
    const logo = document.getElementById('logo-home-btn');
    if (logo) {
      logo.addEventListener('click', () => {
        window.location.hash = '#home';
      });
    }

    // Language switcher
    const langBtn = document.getElementById('lang-switch-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const nextLang = this.lang() === 'en' ? 'ar' : 'en';
        localStorage.setItem('active_language', nextLang);
        store.setData('active_language', nextLang);
      });
    }

    // Currency switcher
    const currSelect = document.getElementById('currency-switch-select');
    if (currSelect) {
      currSelect.addEventListener('change', (e) => {
        const nextCurr = e.target.value;
        localStorage.setItem('active_currency', nextCurr);
        store.setData('active_currency', nextCurr);
      });
    }

    // User dashboard
    const userBtn = document.getElementById('user-portal-btn');
    if (userBtn) {
      userBtn.addEventListener('click', () => this.showUserPortal());
    }

    // Cart toggling
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartOverlay = document.getElementById('cart-drawer-overlay');
    const cartDrawer = document.getElementById('cart-drawer');

    if (openCartBtn && closeCartBtn && cartOverlay && cartDrawer) {
      openCartBtn.addEventListener('click', () => {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
      });
      closeCartBtn.addEventListener('click', () => {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
      });
      cartOverlay.addEventListener('click', () => {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
      });
    }

    // Floating scroll button
    const topBtn = document.getElementById('scroll-top-btn');
    if (topBtn) {
      topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Delegated actions (grid product buying)
    document.addEventListener('click', (e) => {
      const quickBuy = e.target.closest('.quick-buy-btn');
      if (quickBuy) {
        const id = quickBuy.getAttribute('data-product-id');
        this.addToCart(id, 1);
      }

      const wishToggle = e.target.closest('.wish-toggle-btn');
      if (wishToggle) {
        const id = wishToggle.getAttribute('data-product-id');
        this.toggleWishlist(id);
      }

      const qvBtn = e.target.closest('.quick-view-btn');
      if (qvBtn) {
        const id = qvBtn.getAttribute('data-product-id');
        this.showQuickView(id);
      }

      if (e.target && e.target.id === 'cart-remove-coupon-btn') {
        this.appliedCouponCode = '';
        const input = document.getElementById('coupon-code-input');
        if (input) input.value = '';
        this.saveCart();
      }
    });

    // Cart details logic
    const giftCheck = document.getElementById('cart-gift-wrap-check');
    if (giftCheck) {
      giftCheck.addEventListener('change', () => {
        this.giftWrappingActive = giftCheck.checked;
        this.saveCart();
      });
    }

    const certCheck = document.getElementById('cart-certificate-check');
    if (certCheck) {
      certCheck.addEventListener('change', () => {
        this.includeCertificate = certCheck.checked;
        this.saveCart();
      });
    }

    // Cart Qty updates
    const cartList = document.getElementById('cart-items-list-container');
    if (cartList) {
      cartList.addEventListener('click', (e) => {
        const dec = e.target.closest('.cart-dec-qty');
        const inc = e.target.closest('.cart-inc-qty');
        const del = e.target.closest('.cart-remove-item');

        if (!dec && !inc && !del) return;

        const id = (dec || inc || del).getAttribute('data-id');
        const size = (dec || inc || del).getAttribute('data-size');
        const color = (dec || inc || del).getAttribute('data-color');
        const key = `${id}-${size}-${color}`;

        const idx = this.cart.findIndex(item => `${item.productId}-${item.size}-${item.color}` === key);
        if (idx === -1) return;

        if (dec) {
          if (this.cart[idx].quantity > 1) {
            this.cart[idx].quantity -= 1;
          } else {
            this.cart.splice(idx, 1);
          }
        } else if (inc) {
          const products = store.getProducts();
          const p = products.find(prod => prod.id === id);
          if (p && this.cart[idx].quantity < p.inventory) {
            this.cart[idx].quantity += 1;
          } else {
            this.showToast(isAr ? 'الكمية المتوفرة محدودة بمخزون المنتج' : 'Limited to available stock.', 'warning');
          }
        } else if (del) {
          this.cart.splice(idx, 1);
        }

        this.saveCart();
      });
    }

    // Apply Coupon code
    const applyCouponBtn = document.getElementById('coupon-apply-btn');
    if (applyCouponBtn) {
      applyCouponBtn.addEventListener('click', () => {
        const val = document.getElementById('coupon-code-input').value.trim();
        this.appliedCouponCode = val;
        this.saveCart();
      });
    }

    // Checkout modal opener
    const checkoutOpener = document.getElementById('cart-checkout-btn');
    if (checkoutOpener) {
      checkoutOpener.addEventListener('click', () => this.showCheckoutModal());
    }

    this.bindSubpageEvents();
  }

  bindSubpageEvents() {
    const route = this.getRoute();
    const isAr = this.isRtl();

    if (route === 'shop') {
      const search = document.getElementById('shop-search-field');
      if (search) {
        search.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
          this.renderFilteredGrid();
        });
      }

      this.container.querySelectorAll('.shop-cat-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeCategory = btn.getAttribute('data-cat');
          this.container.querySelectorAll('.shop-cat-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderFilteredGrid();
        });
      });

      const priceSlider = document.getElementById('shop-price-slider');
      if (priceSlider) {
        priceSlider.addEventListener('input', (e) => {
          this.priceLimit = parseInt(e.target.value);
          const valBox = priceSlider.previousElementSibling.querySelector('span:nth-child(2)');
          if (valBox) valBox.innerText = `$${this.priceLimit}`;
          this.renderFilteredGrid();
        });
      }

      const sortSel = document.getElementById('shop-sort-select');
      if (sortSel) {
        sortSel.addEventListener('change', (e) => {
          this.sortOrder = e.target.value;
          this.renderFilteredGrid();
        });
      }

    } else if (route === 'details') {
      // Zoom effect
      const zoom = document.getElementById('zoom-container');
      const img = document.getElementById('details-zoom-img');
      if (zoom && img) {
        zoom.addEventListener('mousemove', (e) => {
          const rect = zoom.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          img.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
          img.style.transform = 'scale(1.8)';
        });
        zoom.addEventListener('mouseleave', () => {
          img.style.transform = 'scale(1)';
        });
      }

      // Quantity adjustments
      let qty = 1;
      const valBox = document.getElementById('details-qty-val');
      const dec = document.getElementById('details-dec-qty');
      const inc = document.getElementById('details-inc-qty');

      if (dec && inc && valBox) {
        dec.addEventListener('click', () => {
          if (qty > 1) { qty--; valBox.innerText = qty; }
        });
        inc.addEventListener('click', () => {
          qty++; valBox.innerText = qty;
        });
      }

      // Option selectors
      const dots = this.container.querySelectorAll('.color-dot-selector');
      dots.forEach(d => {
        d.addEventListener('click', () => {
          dots.forEach(o => o.classList.remove('selected'));
          d.classList.add('selected');
        });
      });

      const sizes = this.container.querySelectorAll('.size-select-btn');
      sizes.forEach(s => {
        s.addEventListener('click', () => {
          sizes.forEach(o => o.classList.remove('active'));
          s.classList.add('active');
        });
      });

      // Actions buttons
      const addCart = document.getElementById('details-add-to-cart-btn');
      const buyNow = document.getElementById('details-buy-now-btn');
      const hash = window.location.hash || '#details-1';
      const prodId = hash.split('-')[1] || '1';

      if (addCart) {
        addCart.addEventListener('click', () => {
          const size = this.container.querySelector('.size-select-btn.active')?.getAttribute('data-size') || 'M';
          const color = this.container.querySelector('.color-dot-selector.selected')?.getAttribute('data-color') || 'Original';
          this.addToCart(prodId, qty, size, color);
        });
      }
      if (buyNow) {
        buyNow.addEventListener('click', () => {
          const size = this.container.querySelector('.size-select-btn.active')?.getAttribute('data-size') || 'M';
          const color = this.container.querySelector('.color-dot-selector.selected')?.getAttribute('data-color') || 'Original';
          this.addToCart(prodId, qty, size, color);
          document.getElementById('cart-drawer').classList.add('active');
          document.getElementById('cart-drawer-overlay').classList.add('active');
        });
      }

    } else if (route === 'custom') {
      const form = document.getElementById('custom-knit-request-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();

          const name = form.querySelector('#cust-name').value.trim();
          const email = form.querySelector('#cust-email').value.trim();
          const details = form.querySelector('#cust-spec').value.trim();
          const size = form.querySelector('#cust-size').value;
          const budget = parseFloat(form.querySelector('#cust-budget').value || '0');
          const date = form.querySelector('#cust-date').value;

          const submitOrder = (imgFile = '') => {
            const orderData = { name, email, details, size, budget, deliveryDate: date, image: imgFile, colors: 'Multi' };
            store.addCustomOrder(orderData);
            this.showToast(isAr ? 'تم إرسال طلب الحياكة الخاص بك بنجاح! سنقوم بمراجعته والتواصل معك.' : 'Custom crochet request submitted successfully!', 'success');
            form.reset();
          };

          const file = form.querySelector('#cust-file');
          if (file && file.files && file.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => submitOrder(ev.target.result);
            reader.readAsDataURL(file.files[0]);
          } else {
            submitOrder();
          }
        });
      }
    }

    // Grid detail trigger
    this.container.querySelectorAll('.open-details-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const id = trigger.closest('.crochet-card').getAttribute('data-product-id');
        window.location.hash = `#details-${id}`;
      });
    });

    // Hero Carousel Dots
    const dots = this.container.querySelectorAll('.dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        this.currentSlideIndex = parseInt(dot.getAttribute('data-index'));
        this.updateSliderUI();
        this.startSlider();
      });
    });
  }

  renderFilteredGrid() {
    const grid = document.getElementById('shop-products-grid');
    if (!grid) return;

    const products = store.getProducts();
    let filtered = products;

    if (this.activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.nameEn.toLowerCase().includes(q) || 
        p.nameAr.includes(q) ||
        p.descriptionEn.toLowerCase().includes(q) ||
        p.descriptionAr.includes(q)
      );
    }
    filtered = filtered.filter(p => p.price <= this.priceLimit);

    if (this.sortOrder === 'low-high') {
      filtered.sort((a,b) => a.price - b.price);
    } else if (this.sortOrder === 'high-low') {
      filtered.sort((a,b) => b.price - a.price);
    }

    grid.innerHTML = filtered.map(p => this.renderProductCard(p)).join('');
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 6rem; text-align:center; color:var(--text-color); opacity:0.6;">
          <span style="font-size:3.5rem; display:block;">🧶</span>
          <p style="margin-top:1.5rem; font-size:1.1rem; font-weight:700;">${this.isRtl() ? 'لم يتم العثور على منتجات مطابقة' : 'No items match your criteria.'}</p>
        </div>
      `;
    }

    // Rebind triggers
    this.container.querySelectorAll('.open-details-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const id = trigger.closest('.crochet-card').getAttribute('data-product-id');
        window.location.hash = `#details-${id}`;
      });
    });
  }
}

export default Storefront;
export { Storefront };
