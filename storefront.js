// Storefront View Controller for HandMade Crochet
import { store } from './store.js';
import { CouponEngine } from './coupons.js';

// Bilingual Dictionary for EN / AR translations
const DICTIONARY = {
  store_name: { en: "HandMade Crochet", ar: "كروشيه يدوي" },
  home: { en: "Home", ar: "الرئيسية" },
  shop: { en: "Shop Collection", ar: "المتجر" },
  about: { en: "Our Story", ar: "قصتنا" },
  custom: { en: "Custom Orders", ar: "طلبات خاصة" },
  gallery: { en: "Gallery", ar: "المعرض" },
  blog: { en: "Artisan Blog", ar: "المدونة" },
  contact: { en: "Contact Us", ar: "اتصل بنا" },
  cart: { en: "Cart", ar: "السلة" },
  search_placeholder: { en: "Search cozy crochet...", ar: "ابحث عن كروشيه دافئ..." },
  add_to_cart: { en: "Add to Cart", ar: "أضف إلى السلة" },
  buy_now: { en: "Buy Now", ar: "اشترِ الآن" },
  best_sellers: { en: "Best Sellers", ar: "الأكثر مبيعاً" },
  new_collection: { en: "New Collection", ar: "المجموعة الجديدة" },
  reviews: { en: "What Our Customers Say", ar: "آراء عملائنا" },
  about_brand: { en: "About the Brand", ar: "عن العلامة التجارية" },
  newsletter_title: { en: "Join the Cozy Circle", ar: "انضم إلى مجتمعنا الدافئ" },
  newsletter_desc: { en: "Subscribe to receive custom collection releases and care tips.", ar: "اشترك لتصلك إصدارات المجموعات الجديدة ونصائح العناية." },
  subscribe: { en: "Subscribe", ar: "اشترك" },
  categories: { en: "Categories", ar: "الفئات" },
  sort_by: { en: "Sort By", ar: "ترتيب حسب" },
  price_filter: { en: "Price Range", ar: "نطاق السعر" },
  wishlist: { en: "Wishlist", ar: "قائمة الأمنيات" },
  quick_view: { en: "Quick View", ar: "معاينة سريعة" },
  materials: { en: "Materials Used", ar: "المواد المستخدمة" },
  knit_process: { en: "Artisan Stitching Process", ar: "خطوات العمل اليدوي" },
  colors: { en: "Available Colors", ar: "الألوان المتاحة" },
  sizes: { en: "Sizes", ar: "المقاسات" },
  qty: { en: "Quantity", ar: "الكمية" },
  related_products: { en: "You May Also Love", ar: "قد يعجبك أيضاً" },
  custom_title: { en: "Request a Custom Piece", ar: "طلب قطعة مصممة خصيصاً لك" },
  custom_desc: { en: "Describe your dream crochet item. Our local artisans will knit it to your exact specifications.", ar: "صف قطعة الكروشيه التي تحلم بها. وسيقوم الحرفيون لدينا بحياكتها بمقاساتك وألوانك المفضلة." },
  name: { en: "Your Name", ar: "الاسم" },
  email: { en: "Email Address", ar: "البريد الإلكتروني" },
  description: { en: "Details / Specifications", ar: "التفاصيل / المواصفات" },
  upload_image: { en: "Upload Reference Image", ar: "رفع صورة توضيحية" },
  budget: { en: "Target Budget ($)", ar: "الميزانية المقترحة ($)" },
  date: { en: "Target Delivery Date", ar: "تاريخ التسليم المقترح" },
  submit_request: { en: "Submit Custom Request", ar: "إرسال الطلب الخاص" },
  gift_wrap: { en: "Gift Wrapping (+ $5.00)", ar: "تغليف كهدية (+ $5.00)" },
  authenticity: { en: "Handmade Authenticity Certificate (Free)", ar: "شهادة أصالة الصناعة اليدوية (مجاناً)" },
  loyalty_points: { en: "Earn Loyalty Reward Points", ar: "كسب نقاط المكافأة والولاء" }
};

export class Storefront {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.priceLimit = 300;
    this.sortOrder = 'default'; // default, low-high, high-low
    this.appliedCouponCode = localStorage.getItem('applied_coupon') || '';
    
    // Auth and Session mock
    this.customerEmail = localStorage.getItem('customer_email') || '';
    this.customerName = localStorage.getItem('customer_name') || '';
    this.giftWrappingActive = JSON.parse(localStorage.getItem('gift_wrapping') || 'false');
    this.includeCertificate = JSON.parse(localStorage.getItem('include_cert') || 'true');
    this.userLoggedIn = localStorage.getItem('user_session_email') !== null;
    this.userEmail = localStorage.getItem('user_session_email') || '';

    // Hero dots
    this.currentSlideIndex = 0;
    this.sliderInterval = null;
    this.toastContainer = null;
    
    // Subscribe to store updates
    this.unsubscribe = store.subscribe((key, val) => {
      if (key === 'active_language' || key === 'active_currency' || key === 'products' || key === 'siteSettings' || key === 'banners') {
        this.render();
        this.updateTheme();
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

  // Get active language / currency
  lang() {
    return localStorage.getItem('active_language') || 'en';
  }

  currency() {
    return localStorage.getItem('active_currency') || 'USD';
  }

  t(key) {
    return DICTIONARY[key] ? (DICTIONARY[key][this.lang()] || key) : key;
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
    
    // Set RTL attribute on body dynamically
    if (this.lang() === 'ar') {
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.body.removeAttribute('dir');
    }
  }

  // State synchronization methods
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
    this.updateWishlistCount();
  }

  toggleWishlist(productId) {
    const idx = this.wishlist.indexOf(productId);
    if (idx !== -1) {
      this.wishlist.splice(idx, 1);
      this.showToast(this.lang() === 'ar' ? 'تمت إزالة القطعة من قائمة الأمنيات' : 'Removed from wishlist.', 'info');
    } else {
      this.wishlist.push(productId);
      this.showToast(this.lang() === 'ar' ? 'تمت إضافة القطعة لقائمة الأمنيات' : 'Added to wishlist!', 'success');
    }
    this.saveWishlist();
    this.render(); // Redraw grid icons
  }

  addToCart(productId, quantity = 1, selectedSize = "M", selectedColor = "Original") {
    const products = store.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.inventory <= 0) {
      this.showToast(this.lang() === 'ar' ? 'عذراً، نفذت كمية هذا المنتج' : 'This product is out of stock.', 'error');
      return;
    }

    const cartKey = `${productId}-${selectedSize}-${selectedColor}`;
    const existingIndex = this.cart.findIndex(item => `${item.productId}-${item.size}-${item.color}` === cartKey);
    
    if (existingIndex !== -1) {
      const newQty = this.cart[existingIndex].quantity + quantity;
      if (newQty > product.inventory) {
        this.cart[existingIndex].quantity = product.inventory;
        this.showToast(this.lang() === 'ar' ? 'تم الوصول للحد الأقصى للمخزون المتوفر' : 'Limited to available stock.', 'warning');
      } else {
        this.cart[existingIndex].quantity = newQty;
        this.showToast(this.lang() === 'ar' ? 'تمت إضافة الكمية للسلة' : 'Cart quantity updated.', 'success');
      }
    } else {
      this.cart.push({
        productId,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: Math.min(quantity, product.inventory),
        size: selectedSize,
        color: selectedColor
      });
      this.showToast(this.lang() === 'ar' ? 'تمت إضافة القطعة إلى السلة' : 'Added to cart!', 'success');
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
    toast.innerHTML = `<span>🔔</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  // Hero carousel
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

  // Renders the SPA skeleton
  render() {
    if (!this.container) return;
    const settings = store.getSettings();
    const isAr = this.lang() === 'ar';

    this.container.innerHTML = `
      <!-- Top Promotion countdown clock -->
      ${this.renderSaleCountdown(settings.saleBanner)}

      <!-- Artisan Header Navbar -->
      <nav class="sticky-navbar glass-panel">
        <div class="logo-artisan" id="logo-home-btn" style="cursor:pointer;">
          <span style="color:var(--primary-color);">🧶</span> ${isAr ? 'كروشيه يدوي' : 'HandMade'}
        </div>

        <div class="nav-links" id="desktop-menu-links">
          <a href="#home" class="nav-item ${this.getRoute() === 'home' ? 'active' : ''}">${this.t('home')}</a>
          <a href="#shop" class="nav-item ${this.getRoute() === 'shop' ? 'active' : ''}">${this.t('shop')}</a>
          <a href="#custom" class="nav-item ${this.getRoute() === 'custom' ? 'active' : ''}">${this.t('custom')}</a>
          <a href="#gallery" class="nav-item ${this.getRoute() === 'gallery' ? 'active' : ''}">${this.t('gallery')}</a>
          <a href="#blog" class="nav-item ${this.getRoute() === 'blog' ? 'active' : ''}">${this.t('blog')}</a>
          <a href="#about" class="nav-item ${this.getRoute() === 'about' ? 'active' : ''}">${this.t('about')}</a>
          <a href="#contact" class="nav-item ${this.getRoute() === 'contact' ? 'active' : ''}">${this.t('contact')}</a>
        </div>

        <div class="nav-controls">
          <!-- Bilingual Switch -->
          <button class="control-btn" id="lang-switch-btn" title="Toggle Language">
            🌐 <span class="lang-badge">${isAr ? 'EN' : 'عربي'}</span>
          </button>
          
          <!-- User Profile Icon / Dashboard -->
          <button class="control-btn" id="user-portal-btn" title="User Dashboard">
            👤
          </button>

          <!-- Cart button with badge -->
          <button class="control-btn" id="open-cart-btn" style="position:relative;">
            🛒 <span class="cart-badge" id="cart-badge-val" style="position:absolute; top:-5px; right:-5px; background:var(--primary-color); color:#fff; font-size:0.7rem; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; display:none;">0</span>
          </button>
          
          <!-- Admin Dashboard Switch -->
          ${store.isAdminLoggedIn() ? `
            <a href="#admin" class="btn-luxury" style="padding:0.4rem 1rem; font-size:0.8rem; border-radius:10px;">${isAr ? 'لوحة المسؤول' : 'Admin Panel'}</a>
          ` : `
            <a href="#admin" style="font-size:0.8rem; opacity:0.5; margin-left:0.5rem;">Admin</a>
          `}
        </div>
      </nav>

      <!-- View Slot Mount -->
      <div id="store-view-slot" style="min-height: calc(100vh - var(--header-height) - 100px);">
        ${this.renderViewContent()}
      </div>

      <!-- Cozy Footer -->
      <footer style="background:#1c1917; color:#f5efe6; padding:4rem 4%; border-top:1px solid var(--border-color); font-size:0.9rem;">
        <div style="max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:3rem;">
          <div>
            <h3 style="font-family:var(--font-heading); font-size:1.8rem; color:#fff; margin-bottom:1rem;">🧶 ${settings.name}</h3>
            <p style="opacity:0.8; line-height:1.8;">${isAr ? 'قطع كروشيه وحرف يدوية فاخرة تُحاك يدوياً بحب وعناية فائقة، باستخدام أجود أنواع خيوط القطن والصوف العضوي المستدام.' : 'Premium luxury handmade crochet designs stitched stitch-by-stitch with sustainable materials.'}</p>
          </div>
          <div>
            <h3 style="font-family:var(--font-heading); font-size:1.3rem; color:#fff; margin-bottom:1.25rem;">${this.t('contact')}</h3>
            <p style="opacity:0.8; margin-bottom:0.5rem;">📍 ${settings.contactAddress}</p>
            <p style="opacity:0.8; margin-bottom:0.5rem;">📞 ${settings.contactPhone}</p>
            <p style="opacity:0.8;">✉️ ${settings.contactEmail}</p>
          </div>
          <div>
            <h3 style="font-family:var(--font-heading); font-size:1.3rem; color:#fff; margin-bottom:1.25rem;">Follow Artisan</h3>
            <div style="display:flex; gap:1.25rem; font-size:1.3rem;">
              <a href="${settings.socialLinks.instagram}" target="_blank">📷</a>
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
          <button id="close-cart-btn" style="font-size:1.5rem;">✕</button>
        </div>
        <div class="cart-items-list" id="cart-items-list-container" style="flex:1; overflow-y:auto; padding:1.5rem; display:flex; flex-direction:column; gap:1.25rem;">
          <!-- Inject items -->
        </div>
        
        <!-- Gift wrapping & certificates -->
        <div style="padding:1rem 1.5rem; border-top:1px solid var(--border-color); background:rgba(120,53,15,0.02); font-size:0.85rem; display:flex; flex-direction:column; gap:0.6rem;">
          <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
            <input type="checkbox" id="cart-gift-wrap-check" ${this.giftWrappingActive ? 'checked' : ''}>
            <span>🎁 ${this.t('gift_wrap')}</span>
          </label>
          <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
            <input type="checkbox" id="cart-certificate-check" ${this.includeCertificate ? 'checked' : ''}>
            <span>📜 ${this.t('authenticity')}</span>
          </label>
        </div>

        <div class="cart-coupon-section" style="padding:1rem 1.5rem; border-top:1px solid var(--border-color);">
          <div class="coupon-input-group">
            <input type="text" id="coupon-code-input" placeholder="Coupon Code" value="${this.appliedCouponCode}">
            <button class="coupon-apply-btn" id="coupon-apply-btn">${isAr ? 'تطبيق' : 'Apply'}</button>
          </div>
          <div id="coupon-status-box"></div>
        </div>
        <div class="cart-summary" id="cart-summary-container" style="padding:1.5rem; border-top:1px solid var(--border-color); background:rgba(0,0,0,0.02);">
          <!-- Summary breakdown -->
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

      <!-- Floating Widgets -->
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

  // Views Router
  renderViewContent() {
    const route = this.getRoute();
    
    switch (route) {
      case 'home':
        return this.renderHomeView();
      case 'shop':
        return this.renderShopView();
      case 'details':
        return this.renderDetailsView();
      case 'custom':
        return this.renderCustomOrdersView();
      case 'gallery':
        return this.renderGalleryView();
      case 'blog':
        return this.renderBlogView();
      case 'about':
        return this.renderAboutView();
      case 'contact':
        return this.renderContactView();
      default:
        return this.renderHomeView();
    }
  }

  // Countdown timer banner
  renderSaleCountdown(banner) {
    if (!banner || !banner.enabled) return '';
    return `
      <div class="flash-sale-banner" id="flash-sale-container" style="padding:0.4rem 2rem; font-size:0.85rem; font-weight:500;">
        <span>⚡ ${banner.text}</span>
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
        timerSpan.innerText = "Sale ended!";
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
    const banners = store.getBanners();
    const products = store.getProducts();
    const isAr = this.lang() === 'ar';

    return `
      <!-- Hero Slider Section -->
      <section class="cozy-hero">
        ${banners.map((b, index) => `
          <div class="hero-slide ${index === this.currentSlideIndex ? 'active' : ''}" style="background-image: url('${b.image}');">
            <div class="hero-content">
              <h1>${b.title}</h1>
              <p>${b.subtitle}</p>
              <a href="${b.linkTarget || '#shop'}" class="btn-luxury">${b.linkText || 'Discover Now'} →</a>
            </div>
          </div>
        `).join('')}
        
        <div class="slider-dots" style="position:absolute; bottom:2rem; left:50%; transform:translateX(-50%); display:flex; gap:0.75rem; z-index:5;">
          ${banners.map((_, index) => `
            <div class="dot ${index === this.currentSlideIndex ? 'active' : ''}" data-index="${index}" style="width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.4); cursor:pointer;"></div>
          `).join('')}
        </div>
      </section>

      <!-- Brand Story Section -->
      <section style="padding:5rem 8%; text-align:center; max-width:900px; margin:0 auto;">
        <span style="font-size:0.8rem; text-transform:uppercase; color:var(--primary-color); font-weight:700; letter-spacing:0.1em; display:block; margin-bottom:1rem;">Artisanal Heritage</span>
        <h2 style="font-size:2.8rem; font-family:var(--font-heading); margin-bottom:1.5rem;">${isAr ? 'حياكة يدوية تحكي الدفء والأناقة' : 'Stitched with Warmth, Designed for Luxury'}</h2>
        <p style="font-size:1.1rem; opacity:0.8; line-height:1.8; margin-bottom:2rem;">
          ${isAr ? 'نؤمن في كروشيه يدوي بأن كل غرزة تمثل شغفاً ووقتاً. تُحاك كل قطعة ببطء وصبر باستخدام صوف ميرينو وخيوط قطنية عضوية صديقة للبيئة لنوفر لك إرثاً أصيلاً يعيش طويلاً.' : 'At HandMade Crochet, we believe in slow fashion. Every cardigan and accessory is knitted stitch-by-stitch by local women artisans, blending traditional techniques with modern aesthetic comfort.'}
        </p>
        <a href="#about" class="btn-luxury-outline">${this.t('about')}</a>
      </section>

      <!-- Best Sellers -->
      <section style="padding:4rem 6%; border-top:1px solid var(--border-color); background:rgba(120,53,15,0.02);">
        <h2 class="shop-section-title">${this.t('best_sellers')}</h2>
        <p class="shop-section-subtitle">${isAr ? 'القطع اليدوية الأكثر طلباً لهذا الموسم' : 'Our most wanted hand-stitched pieces this season.'}</p>
        
        <div class="crochet-grid">
          ${products.slice(0, 3).map(p => this.renderProductCard(p)).join('')}
        </div>
      </section>

      <!-- AI Recommended Section (Simulated) -->
      <section style="padding:5rem 6%; border-top:1px solid var(--border-color); text-align:center;">
        <div class="glass-panel" style="padding:3rem; border-radius:var(--border-radius-lg); max-width:800px; margin:0 auto;">
          <span style="font-size:0.8rem; text-transform:uppercase; color:var(--primary-color); font-weight:700;">✨ AI Style Matcher</span>
          <h2 style="margin-bottom:1rem; margin-top:0.5rem;">${isAr ? 'اقتراح ذكي مخصص لك' : 'AI-Powered Recommendations'}</h2>
          <p style="opacity:0.8; margin-bottom:2rem;">${isAr ? 'بناءً على ذوقك الراقي ومشترياتك السابقة، نقترح لك إضافة قطعة الخريف المميزة' : 'Based on the earthy terracotta tone of cardigans, we recommend matching them with:'}</p>
          <div style="display:flex; justify-content:center; align-items:center; gap:1.5rem; flex-wrap:wrap;">
            <div style="background:var(--card-bg-color); padding:1rem; border-radius:12px; display:flex; align-items:center; gap:1rem; text-align:left;">
              <span style="font-size:2rem;">👜</span>
              <div>
                <strong>Cream Shell Stitch Tote</strong><br>
                <span style="font-size:0.8rem; color:var(--primary-color); font-weight:700;">Artisan Choice</span>
              </div>
            </div>
            <div style="background:var(--card-bg-color); padding:1rem; border-radius:12px; display:flex; align-items:center; gap:1rem; text-align:left;">
              <span style="font-size:2rem;">🌿</span>
              <div>
                <strong>Sage Leaf Headband</strong><br>
                <span style="font-size:0.8rem; color:var(--primary-color); font-weight:700;">Boho Match</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Instagram Grid -->
      <section style="padding:4rem 6%; border-top:1px solid var(--border-color); background:var(--card-bg-color);">
        <h2 class="shop-section-title">#HandMadeCrochet</h2>
        <p class="shop-section-subtitle">${isAr ? 'شاركونا لحظاتكم الدافئة على إنستغرام' : 'Artisanal styling moments from our warm community.'}</p>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:1rem;">
          ${[1,2,3,4,5,6].map(i => `
            <div class="glass-panel" style="padding-top:100%; border-radius:12px; position:relative; overflow:hidden;">
              <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.05); font-size:1.5rem; font-weight:700; color:var(--primary-color);">📸</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Customer Reviews -->
      <section style="padding:5rem 6%; text-align:center; border-top:1px solid var(--border-color);">
        <h2 class="shop-section-title">${this.t('reviews')}</h2>
        <p class="shop-section-subtitle">${isAr ? 'ماذا يقول عشاق الكروشيه عن جودة منتجاتنا' : 'What yarn-lovers say about our stitched heirloom quality.'}</p>
        <div style="max-width:600px; margin:0 auto; padding:2rem; background:var(--card-bg-color); border-radius:var(--border-radius-md); border:1px solid var(--border-color);">
          <div style="color:gold; font-size:1.3rem; margin-bottom:1rem;">★★★★★</div>
          <p style="font-style:italic; font-size:1.1rem; opacity:0.9; margin-bottom:1.5rem;">"${isAr ? 'السترة صوفية ناعمة للغاية ودافئة بشكل لا يصدق! التفاصيل اليدوية والزخارف المنسوجة تمنحني إحساساً بالفخامة والتميز. سأطلب بالتأكيد قطعة أخرى.' : 'The terracotta cardigan is absolutely stunning! Soft, heavy, and fits like a dream. You can feel the hours of hand-stitching in every row.'}"</p>
          <strong>- Tala K., Byblos</strong>
        </div>
      </section>

      <!-- Newsletter -->
      <section style="padding:6rem 6%; border-top:1px solid var(--border-color); background:linear-gradient(135deg, var(--card-bg-color) 0%, var(--bg-color) 100%); text-align:center;">
        <h2 style="font-size:2.5rem; margin-bottom:1rem;">${this.t('newsletter_title')}</h2>
        <p style="opacity:0.8; max-width:600px; margin:0 auto 2.5rem;">${this.t('newsletter_desc')}</p>
        <form style="display:flex; justify-content:center; gap:0.5rem; max-width:500px; margin:0 auto; flex-wrap:wrap;">
          <input type="email" placeholder="${this.t('email')}" required style="flex:1; padding:0.8rem 1.5rem; border-radius:30px; border:1px solid var(--border-color); background:rgba(255,255,255,0.7); min-width:250px;">
          <button type="submit" class="btn-luxury">${this.t('subscribe')}</button>
        </form>
      </section>
    `;
  }

  // Shop Catalog View
  renderShopView() {
    const products = store.getProducts();
    const categories = store.getCategories();
    const isAr = this.lang() === 'ar';

    // Filters logic
    let filtered = products;

    if (this.activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }
    
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    filtered = filtered.filter(p => p.price <= this.priceLimit);

    if (this.sortOrder === 'low-high') {
      filtered.sort((a,b) => a.price - b.price);
    } else if (this.sortOrder === 'high-low') {
      filtered.sort((a,b) => b.price - a.price);
    }

    return `
      <div class="shop-catalog-layout">
        <!-- Sidebar Filters -->
        <aside class="shop-sidebar">
          
          <!-- Search -->
          <div class="sidebar-widget glass-panel">
            <h3 class="widget-title">${isAr ? 'بحث' : 'Search'}</h3>
            <input type="text" id="shop-search-field" placeholder="${this.t('search_placeholder')}" value="${this.searchQuery}" style="width:100%; padding:0.6rem 1rem; border-radius:8px; border:1px solid var(--border-color); background:rgba(255,255,255,0.5);">
          </div>

          <!-- Categories -->
          <div class="sidebar-widget glass-panel">
            <h3 class="widget-title">${this.t('categories')}</h3>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <button class="shop-cat-filter-btn ${this.activeCategory === 'All' ? 'active' : ''}" data-cat="All" style="text-align:start; padding:0.3rem 0.5rem; font-weight:${this.activeCategory === 'All' ? '700' : 'normal'}; color:${this.activeCategory === 'All' ? 'var(--primary-color)' : 'inherit'};">${isAr ? 'جميع المعروضات' : 'All Collection'}</button>
              ${categories.map(cat => `
                <button class="shop-cat-filter-btn ${this.activeCategory === cat ? 'active' : ''}" data-cat="${cat}" style="text-align:start; padding:0.3rem 0.5rem; font-weight:${this.activeCategory === cat ? '700' : 'normal'}; color:${this.activeCategory === cat ? 'var(--primary-color)' : 'inherit'};">${cat}</button>
              `).join('')}
            </div>
          </div>

          <!-- Price filter -->
          <div class="sidebar-widget glass-panel">
            <h3 class="widget-title">${this.t('price_filter')}</h3>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.5rem;">
              <span>$0</span>
              <span style="font-weight:700; color:var(--primary-color);">$${this.priceLimit}</span>
            </div>
            <input type="range" id="shop-price-slider" min="10" max="300" step="5" value="${this.priceLimit}" style="width:100%; accent-color:var(--primary-color);">
          </div>

          <!-- Sort -->
          <div class="sidebar-widget glass-panel">
            <h3 class="widget-title">${this.t('sort_by')}</h3>
            <select id="shop-sort-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid var(--border-color); background:rgba(255,255,255,0.5);">
              <option value="default" ${this.sortOrder === 'default' ? 'selected' : ''}>Default</option>
              <option value="low-high" ${this.sortOrder === 'low-high' ? 'selected' : ''}>Price: Low to High</option>
              <option value="high-low" ${this.sortOrder === 'high-low' ? 'selected' : ''}>Price: High to Low</option>
            </select>
          </div>

        </aside>

        <!-- Product Grid view -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; font-size:0.9rem;">
            <span>${filtered.length} ${isAr ? 'منتج متوفر' : 'items found'}</span>
          </div>

          <div class="crochet-grid">
            ${filtered.map(p => this.renderProductCard(p)).join('')}
            ${filtered.length === 0 ? `
              <div style="grid-column: 1 / -1; padding: 5rem; text-align:center; color:var(--neutral-gray);">
                <span style="font-size:3rem;">🧶</span>
                <p style="margin-top:1rem;">No items match the chosen filters.</p>
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

    return `
      <div class="crochet-card" data-product-id="${p.id}">
        <div class="card-image-panel">
          <img class="card-image open-details-trigger" src="${p.image}" alt="${p.name}">
          <div class="card-badge" style="display:${isOutOfStock ? 'block' : 'none'}; background:red;">Out of Stock</div>
          <div class="card-action-overlay">
            <button class="overlay-action-btn wish-toggle-btn" data-product-id="${p.id}" title="Wishlist">${isWished ? '❤️' : '🤍'}</button>
            <button class="overlay-action-btn quick-view-btn" data-product-id="${p.id}" title="Quick View">👁️</button>
          </div>
        </div>
        <div class="card-info">
          <span class="card-category">${p.category}</span>
          <h3 class="card-title open-details-trigger" style="cursor:pointer;">${p.name}</h3>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
            <span class="card-price">$${p.price.toFixed(2)}</span>
            <button class="btn-luxury quick-buy-btn" data-product-id="${p.id}" ${isOutOfStock ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} style="padding:0.5rem 1rem; font-size:0.8rem;">
              ＋ ${this.t('add_to_cart')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Detailed Product View
  renderDetailsView() {
    const hash = window.location.hash || '#details-1';
    const prodId = hash.split('-')[1] || '1';
    const products = store.getProducts();
    const p = products.find(prod => prod.id === prodId);
    const isAr = this.lang() === 'ar';

    if (!p) {
      return `<div style="padding:5rem; text-align:center;">Product not found.</div>`;
    }

    return `
      <div class="details-page-layout">
        <!-- Image Gallery with Simulated Zoom -->
        <div class="zoom-image-container" id="zoom-container">
          <img id="details-zoom-img" src="${p.image}" alt="${p.name}">
        </div>

        <!-- Specifications Panel -->
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          <span style="font-size:0.85rem; text-transform:uppercase; color:var(--primary-color); font-weight:700;">${p.category}</span>
          <h1 style="font-size:2.8rem; font-family:var(--font-heading); line-height:1.2;">${p.name}</h1>
          <div style="font-size:1.8rem; font-weight:800; color:var(--primary-color);">$${p.price.toFixed(2)}</div>
          
          <p style="opacity:0.8; line-height:1.7;">${p.description}</p>

          <div style="border-top:1px solid var(--border-color); padding-top:1.5rem;">
            <strong>📋 ${this.t('materials')}</strong>
            <p style="opacity:0.8; font-size:0.9rem; margin-top:0.3rem;">${p.materials || '100% Organic Eco-Cotton Yarn'}</p>
          </div>

          <div>
            <strong>⏳ ${this.t('knit_process')}</strong>
            <p style="opacity:0.8; font-size:0.9rem; margin-top:0.3rem;">${p.process || 'Hand-knitted with love over 10-15 hours of delicate stitching.'}</p>
          </div>

          <!-- Color Options -->
          <div>
            <strong>🎨 ${this.t('colors')}</strong>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              ${(p.colors || ["Cream", "Terracotta"]).map((col, idx) => `
                <div class="color-dot-selector ${idx === 0 ? 'selected' : ''}" data-color="${col}" title="${col}" style="background-color: ${col === 'Terracotta' ? '#c2410c' : (col === 'Cream' ? '#f5efe6' : (col === 'Mustard' ? '#d97706' : '#64748b'))};"></div>
              `).join('')}
            </div>
          </div>

          <!-- Sizes Options -->
          <div>
            <strong>📏 ${this.t('sizes')}</strong>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              ${(p.sizes || ["S", "M", "L"]).map((sz, idx) => `
                <button class="btn-luxury-outline size-select-btn ${idx === 0 ? 'active' : ''}" data-size="${sz}" style="padding:0.4rem 1rem; font-size:0.85rem; min-width:40px;">${sz}</button>
              `).join('')}
            </div>
          </div>

          <!-- Action buttons -->
          <div style="display:flex; gap:1rem; align-items:center; margin-top:1rem; flex-wrap:wrap;">
            <div class="quantity-selector">
              <button class="qty-btn" id="details-dec-qty">-</button>
              <span class="qty-val" id="details-qty-val">1</span>
              <button class="qty-btn" id="details-inc-qty">+</button>
            </div>

            <button class="btn-luxury" id="details-add-to-cart-btn" style="flex:1;">🛍️ ${this.t('add_to_cart')}</button>
            <button class="btn-luxury-outline" id="details-buy-now-btn" style="flex:1;">⚡ ${this.t('buy_now')}</button>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <section style="padding:4rem 4%; border-top:1px solid var(--border-color); background:rgba(120,53,15,0.01);">
        <h2 style="font-size:2rem; font-family:var(--font-heading); margin-bottom:2rem; text-align:center;">${this.t('related_products')}</h2>
        <div class="crochet-grid">
          ${products.filter(prod => prod.id !== p.id).slice(0, 3).map(prod => this.renderProductCard(prod)).join('')}
        </div>
      </section>
    `;
  }

  // Custom Orders Form View
  renderCustomOrdersView() {
    const isAr = this.lang() === 'ar';
    return `
      <div class="custom-order-layout">
        <!-- Form Panel -->
        <div class="glass-panel" style="padding:2.5rem; border-radius:var(--border-radius-lg);">
          <span style="font-size:0.8rem; text-transform:uppercase; color:var(--primary-color); font-weight:700;">Artisan Customizer</span>
          <h1 style="font-size:2.5rem; font-family:var(--font-heading); margin-bottom:1rem; margin-top:0.5rem;">${this.t('custom_title')}</h1>
          <p style="opacity:0.8; margin-bottom:2rem;">${this.t('custom_desc')}</p>

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
              <label>${this.t('description')} (Stitch type, cardigan length, details)</label>
              <textarea id="cust-spec" rows="4" placeholder="${isAr ? 'مثال: سترة بأكمام منفوخة وزخارف زهور برية صفراء، مقاس متوسط...' : 'e.g. A chunky cropped knit cardigan with sunflower grid squares on the sleeves...'}" required></textarea>
            </div>

            <div class="checkout-form-grid">
              <div class="form-group">
                <label>${this.t('sizes')}</label>
                <select id="cust-size" style="background:var(--card-bg-color); border:1px solid var(--border-color); padding:0.6rem; border-radius:8px; color:var(--text-color);">
                  <option value="S">Small (S)</option>
                  <option value="M" selected>Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">Extra Large (XL)</option>
                </select>
              </div>
              <div class="form-group">
                <label>${this.t('budget')}</label>
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
                <input type="file" id="cust-file" accept="image/*" style="background:rgba(0,0,0,0.02); padding:0.4rem; border-radius:8px;">
              </div>
            </div>

            <button type="submit" class="btn-luxury mt-4">${this.t('submit_request')}</button>
          </form>
        </div>

        <!-- Info Showcase Sidebar -->
        <div style="display:flex; flex-direction:column; gap:2rem;">
          <div class="glass-panel" style="padding:2rem; border-radius:var(--border-radius-md);">
            <h3>🧶 Handcrafted Process</h3>
            <ul style="margin-top:1rem; display:flex; flex-direction:column; gap:0.8rem; padding-inline-start:1.2rem; opacity:0.8;">
              <li>Review: Our head artisan reviews color combinations and yarn compatibility.</li>
              <li>Sourcing: We source local, plant-dyed organic yarns.</li>
              <li>Stitching: The piece is hand-stitched over 10-25 dedicated hours.</li>
              <li>Delivery: Shipped worldwide with a signed certificate of handcraft authenticity.</li>
            </ul>
          </div>
          
          <div class="glass-panel" style="padding:2rem; border-radius:var(--border-radius-md); text-align:center;">
            <span style="font-size:3rem;">🎨</span>
            <h4 style="margin-top:0.5rem; margin-bottom:0.5rem;">Need Color Advice?</h4>
            <p style="opacity:0.8; font-size:0.9rem; margin-bottom:1.5rem;">Chat directly with our head knitter on WhatsApp for suggestions.</p>
            <a href="https://wa.me/${store.getSettings().whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi,%20I'm%20planning%20a%20custom%20crochet%20order%20and%20need%20color%20suggestions." target="_blank" class="btn-luxury-outline">WhatsApp Consultation</a>
          </div>
        </div>
      </div>
    `;
  }

  // Gallery view
  renderGalleryView() {
    const isAr = this.lang() === 'ar';
    return `
      <div style="padding:4rem 6%;">
        <h1 class="shop-section-title">${this.t('gallery')}</h1>
        <p class="shop-section-subtitle">${isAr ? 'ألبوم صور من ورش العمل وقطع الكروشيه المكتملة' : 'A visual look inside our warm workshops and completed pieces.'}</p>
        
        <div class="masonry-grid">
          ${[1,2,3,4,5,6,7,8].map(i => `
            <div class="masonry-item glass-panel">
              <div style="padding-top:${i % 2 === 0 ? '120%' : '80%'}; position:relative; background:rgba(0,0,0,0.02);">
                <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem;">
                  <span style="font-size:2.5rem;">🧶</span>
                  <span style="font-size:0.8rem; opacity:0.6;">Stitching Piece #${i}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Blog view
  renderBlogView() {
    const isAr = this.lang() === 'ar';
    return `
      <div style="padding:4rem 6%; max-width:1000px; margin:0 auto;">
        <h1 class="shop-section-title">${this.t('blog')}</h1>
        <p class="shop-section-subtitle">${isAr ? 'نصائح العناية بالكروشيه وخطوات الحياكة اليدوية' : 'Crochet tips, caring guides, and wool secrets.'}</p>
        
        <div style="display:flex; flex-direction:column; gap:3rem;">
          
          <article class="glass-panel" style="padding:2.5rem; border-radius:var(--border-radius-lg); display:grid; grid-template-columns:1fr; gap:2rem;">
            <div>
              <span style="font-size:0.8rem; color:var(--primary-color); font-weight:700; text-transform:uppercase;">Care Instructions</span>
              <h2 style="font-family:var(--font-heading); font-size:2rem; margin-top:0.5rem; margin-bottom:1rem;">How to wash and preserve handmade crochet cardigans</h2>
              <p style="opacity:0.8; margin-bottom:1.5rem;">Hand-knit wool and cotton pieces require delicate washing to prevent stretching or felting. Discover our step-by-step hand-wash recipe using natural olive oil soaps...</p>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; opacity:0.6;">
                <span>Reading Time: 4 mins</span>
                <span>By Artisan Hoda</span>
              </div>
            </div>
          </article>

          <article class="glass-panel" style="padding:2.5rem; border-radius:var(--border-radius-lg);">
            <span style="font-size:0.8rem; color:var(--primary-color); font-weight:700; text-transform:uppercase;">Artisan Secrets</span>
            <h2 style="font-family:var(--font-heading); font-size:2rem; margin-top:0.5rem; margin-bottom:1rem;">The art of organic plant dyeing for soft wool yarns</h2>
            <p style="opacity:0.8; margin-bottom:1.5rem;">We explain how we boil pomegranate skins, walnut shells, and wild madder roots to dye our signature cream, beige, and terracotta cotton yarns...</p>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; opacity:0.6;">
              <span>Reading Time: 6 mins</span>
              <span>By Artisan Hoda</span>
            </div>
          </article>

        </div>
      </div>
    `;
  }

  // About View
  renderAboutView() {
    const isAr = this.lang() === 'ar';
    return `
      <div style="max-width:1000px; margin:0 auto; padding:4rem 6%; display:flex; flex-direction:column; gap:4rem;">
        
        <!-- Concept -->
        <div style="display:grid; grid-template-columns:1fr; gap:3rem; align-items:center;">
          <div>
            <span style="font-size:0.8rem; text-transform:uppercase; color:var(--primary-color); font-weight:700;">Our Mission</span>
            <h1 style="font-size:2.8rem; font-family:var(--font-heading); margin-top:0.5rem; margin-bottom:1.5rem;">Sustaining the Craft, Honoring the Stitch</h1>
            <p style="opacity:0.8; line-height:1.8; margin-bottom:1.25rem;">
              ${isAr ? 'بدأت قصتنا في قلب مدينة جبيل التاريخية، برؤية تهدف إلى إحياء فن الحياكة اليدوية اللبنانية وتمكين النساء الحرفيات في المناطق الريفية. كل قطعة كروشيه تطلبها توفر عملاً كريماً ومستداماً لهؤلاء السيدات.' : 'Our journey began in Byblos, Lebanon, with a vision to sustain the heritage craft of hand-knitting. We provide local women knitters with flexible, fair-wage livelihoods, allowing them to practice their passion while supporting their families.'}
            </p>
          </div>
        </div>

        <!-- Meet Knitter -->
        <div class="glass-panel" style="padding:3rem; border-radius:var(--border-radius-lg); display:grid; grid-template-columns:1fr; gap:3rem;">
          <div>
            <span style="font-size:0.85rem; color:var(--primary-color); font-weight:700;">MEET THE ARTISAN</span>
            <h2 style="font-family:var(--font-heading); font-size:2rem; margin-top:0.5rem; margin-bottom:1rem;">Artisan Hoda, Head Knitter</h2>
            <p style="opacity:0.8; line-height:1.7; margin-bottom:1.5rem;">"Crochet is a language of knots. I have been knitting since I was 9 years old, taught by my grandmother. Stitching custom cardigans is my way of writing stories into yarn."</p>
            <div style="background:var(--bg-color); padding:1rem; border-radius:8px; display:inline-block; font-size:0.9rem; font-weight:600;">📜 Authentic Handmade Heritage Approved</div>
          </div>
        </div>
      </div>
    `;
  }

  // Contact Page View
  renderContactView() {
    const isAr = this.lang() === 'ar';
    const settings = store.getSettings();

    return `
      <div style="max-width:1200px; margin:0 auto; padding:4rem 6%; display:grid; grid-template-columns:1fr; gap:4rem;">
        <div style="display:grid; grid-template-columns:1fr; gap:3rem;">
          <!-- Left info -->
          <div>
            <h1 style="font-size:2.8rem; font-family:var(--font-heading); margin-bottom:1rem;">Get in Touch</h1>
            <p style="opacity:0.8; margin-bottom:2rem;">Have a question about sizing or custom orders? Reach out directly.</p>
            
            <div style="display:flex; flex-direction:column; gap:1.25rem; margin-bottom:2rem;">
              <div>📍 <strong>Address:</strong> ${settings.contactAddress}</div>
              <div>✉️ <strong>Email:</strong> ${settings.contactEmail}</div>
              <div>📞 <strong>Phone:</strong> ${settings.contactPhone}</div>
              <div>💬 <strong>WhatsApp:</strong> ${settings.whatsappNumber}</div>
            </div>

            <!-- Contact form -->
            <form id="storefront-contact-form" style="display:flex; flex-direction:column; gap:1rem; max-width:500px;">
              <div class="form-group">
                <label>${this.t('name')}</label>
                <input type="text" required style="background:var(--card-bg-color); border:1px solid var(--border-color); padding:0.6rem; border-radius:8px; color:var(--text-color);">
              </div>
              <div class="form-group">
                <label>${this.t('email')}</label>
                <input type="email" required style="background:var(--card-bg-color); border:1px solid var(--border-color); padding:0.6rem; border-radius:8px; color:var(--text-color);">
              </div>
              <div class="form-group">
                <label>${isAr ? 'الرسالة' : 'Message'}</label>
                <textarea rows="4" required style="background:var(--card-bg-color); border:1px solid var(--border-color); padding:0.6rem; border-radius:8px; color:var(--text-color);"></textarea>
              </div>
              <button type="submit" class="btn-luxury">${isAr ? 'إرسال' : 'Send Message'}</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  // Cart renderers
  renderCartItems() {
    const container = document.getElementById('cart-items-list-container');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:3rem; color:var(--neutral-gray);">
          <span style="font-size:3rem;">🧶</span>
          <p style="margin-top:1rem;">Your cart is empty.</p>
        </div>
      `;
      return;
    }

    const products = store.getProducts();
    const isAr = this.lang() === 'ar';

    container.innerHTML = this.cart.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const img = prod ? prod.image : '';
      const stock = prod ? prod.inventory : 100;

      return `
        <div style="display:flex; gap:1rem; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1rem;">
          <img src="${img}" style="width:65px; height:65px; object-fit:cover; border-radius:8px;" alt="">
          <div style="flex:1;">
            <h4 style="font-size:0.95rem; font-weight:600;">${item.name}</h4>
            <div style="font-size:0.8rem; opacity:0.6;">Size: ${item.size} / Color: ${item.color}</div>
            <div style="font-weight:700; color:var(--primary-color); font-size:0.9rem; margin-top:0.2rem;">$${item.price.toFixed(2)}</div>
            <div class="quantity-selector mt-4" style="padding:0.2rem; width:fit-content; margin-top:0.4rem;">
              <button class="qty-btn cart-dec-qty" data-id="${item.productId}" data-size="${item.size}" data-color="${item.color}">-</button>
              <span class="qty-val" style="width:25px;">${item.quantity}</span>
              <button class="qty-btn cart-inc-qty" data-id="${item.productId}" data-size="${item.size}" data-color="${item.color}" ${item.quantity >= stock ? 'disabled style="opacity:0.3;"' : ''}>+</button>
            </div>
          </div>
          <button class="cart-remove-item" data-id="${item.productId}" data-size="${item.size}" data-color="${item.color}" style="color:red; font-size:1.1rem; padding:0.5rem;">🗑️</button>
        </div>
      `;
    }).join('');
  }

  // Cart summary breaks
  renderCartSummary() {
    const summaryContainer = document.getElementById('cart-summary-container');
    if (!summaryContainer) return;

    if (this.cart.length === 0) {
      summaryContainer.innerHTML = '';
      return;
    }

    const products = store.getProducts();
    let subtotal = 0;
    this.cart.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const price = prod ? prod.price : item.price;
      subtotal += price * item.quantity;
    });

    // 1. Gift wrapping addition
    let giftWrapFee = this.giftWrappingActive ? 5.00 : 0.00;

    // 2. Auto discounts
    const auto = CouponEngine.getAutomaticDiscounts(subtotal, this.customerEmail);
    let autoDisc = 0;
    auto.forEach(ad => autoDisc += ad.discountAmount);

    const subAfterAuto = Math.max(0, subtotal - autoDisc);

    // 3. Coupon discounts
    let couponDisc = 0;
    let isFreeShippingCoupon = false;

    if (this.appliedCouponCode) {
      const res = CouponEngine.validateAndApply(this.appliedCouponCode, this.cart, this.customerEmail);
      const statusBox = document.getElementById('coupon-status-box');
      if (res.isValid) {
        couponDisc = res.discountAmount;
        if (res.type === 'free_shipping') isFreeShippingCoupon = true;
        
        if (statusBox) statusBox.innerHTML = `
          <div style="background:rgba(16,185,129,0.1); color:green; padding:0.4rem; border-radius:8px; font-size:0.8rem; display:flex; justify-content:space-between; margin-top:0.5rem;">
            <span>🎟️ <strong>${res.code}</strong> applied (-$${couponDisc.toFixed(2)}${isFreeShippingCoupon ? ' + Free Ship' : ''})</span>
            <button id="cart-remove-coupon-btn" style="color:red;">✕</button>
          </div>
        `;
      } else {
        if (statusBox) statusBox.innerHTML = `<div style="color:red; font-size:0.8rem; margin-top:0.5rem;">❌ ${res.error}</div>`;
        this.appliedCouponCode = '';
      }
    } else {
      const statusBox = document.getElementById('coupon-status-box');
      if (statusBox) statusBox.innerHTML = '';
    }

    const subAfterCoupon = Math.max(0, subAfterAuto - couponDisc);
    const shipping = CouponEngine.calculateShipping(subAfterCoupon, isFreeShippingCoupon);
    const total = subAfterCoupon + shipping + giftWrapFee;

    // Loyalty Points (10% of total)
    const earnedPoints = Math.floor(total * 0.1);

    const isAr = this.lang() === 'ar';

    summaryContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; opacity:0.8;">
        <span>Subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      ${giftWrapFee > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; opacity:0.8;">
          <span>Gift Wrapping</span>
          <span>+$${giftWrapFee.toFixed(2)}</span>
        </div>
      ` : ''}
      ${auto.map(ad => `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:green;">
          <span>🎁 ${ad.text}</span>
          <span>-$${ad.discountAmount.toFixed(2)}</span>
        </div>
      `).join('')}
      ${couponDisc > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:green;">
          <span>🎟️ Coupon (${this.appliedCouponCode})</span>
          <span>-$${couponDisc.toFixed(2)}</span>
        </div>
      ` : ''}
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; opacity:0.8;">
        <span>Shipping</span>
        <span>${shipping === 0 ? '<span style="color:green; font-weight:700;">FREE</span>' : `$${shipping.toFixed(2)}`}</span>
      </div>
      <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-color); padding-top:0.75rem; margin-top:0.75rem; font-size:1.25rem; font-weight:800;">
        <span>Total</span>
        <span>$${total.toFixed(2)}</span>
      </div>
      <div style="font-size:0.75rem; opacity:0.7; text-align:center; margin-top:0.5rem; color:var(--primary-color);">
        ✨ Earns ${earnedPoints} loyalty reward points!
      </div>
      <button class="btn-luxury" id="cart-checkout-btn" style="width:100%; margin-top:1rem; justify-content:center;">Place Order (Checkout)</button>
    `;
  }

  updateCartBadge() {
    const badge = document.getElementById('cart-badge-val');
    if (!badge) return;
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = count;
    badge.style.display = count === 0 ? 'none' : 'flex';
  }

  updateWishlistCount() {
    // Optional wishlist counter
  }

  // Visual Quick View modal popup
  showQuickView(productId) {
    const products = store.getProducts();
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    const overlay = document.getElementById('quick-view-overlay');
    const container = document.getElementById('quick-view-container');
    if (!overlay || !container) return;

    let isOutOfStock = p.inventory <= 0;

    container.innerHTML = `
      <button class="modal-close" id="close-quick-view-btn" style="position:absolute; top:1rem; right:1rem; font-size:1.3rem;">✕</button>
      <div class="product-details-layout" style="gap:2rem;">
        <div>
          <img src="${p.image}" style="width:100%; height:320px; object-fit:cover; border-radius:12px;" alt="">
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem; text-align:start;">
          <span style="font-size:0.8rem; color:var(--primary-color); text-transform:uppercase; font-weight:700;">${p.category}</span>
          <h2 style="font-family:var(--font-heading); font-size:2rem; margin:0;">${p.name}</h2>
          <div style="font-size:1.5rem; font-weight:800; color:var(--primary-color);">$${p.price.toFixed(2)}</div>
          <p style="opacity:0.8; font-size:0.9rem; line-height:1.6;">${p.description}</p>
          
          <div style="display:flex; gap:1rem; margin-top:1rem;">
            <a href="#details-${p.id}" class="btn-luxury-outline" style="flex:1; justify-content:center; font-size:0.85rem;" id="quick-view-full-details-btn">View Specs</a>
            <button class="btn-luxury" id="quick-view-add-cart-btn" ${isOutOfStock ? 'disabled' : ''} style="flex:1; justify-content:center; font-size:0.85rem;">＋ Add to Cart</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#close-quick-view-btn').addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    container.querySelector('#quick-view-full-details-btn').addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    const addBtn = container.querySelector('#quick-view-add-cart-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.addToCart(p.id, 1);
        overlay.classList.remove('active');
      });
    }

    overlay.classList.add('active');
  }

  // Checkout form sheet
  showCheckoutModal() {
    const overlay = document.getElementById('checkout-overlay');
    const container = document.getElementById('checkout-container');
    if (!overlay || !container) return;

    const settings = store.getSettings();
    const isAr = this.lang() === 'ar';

    container.innerHTML = `
      <button class="modal-close" id="close-checkout-btn" style="position:absolute; top:1rem; right:1rem;">✕</button>
      <h2 style="font-family:var(--font-heading); margin-bottom:1.5rem;">Stripe Luxury Checkout</h2>
      
      <!-- Simulated Stripe card sheet -->
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
          <label>Shipping Delivery Address</label>
          <textarea id="chk-address" rows="2" placeholder="e.g. Byblos, Main Street, Bldg 12" required style="background:var(--card-bg-color); border:1px solid var(--border-color); border-radius:8px; padding:0.6rem; color:var(--text-color);"></textarea>
        </div>

        <div style="background:rgba(120,53,15,0.02); border:1px solid var(--border-color); padding:1rem; border-radius:8px; display:flex; flex-direction:column; gap:0.8rem;">
          <div style="font-size:0.85rem; font-weight:700; color:var(--primary-color);">🔒 Stripe Secured Card Information</div>
          <div class="form-group">
            <input type="text" placeholder="Card Number (4242 4242 4242 4242)" required style="background:#fff; border:1px solid var(--border-color); padding:0.6rem; border-radius:6px; color:#000;">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
            <input type="text" placeholder="MM/YY" required style="background:#fff; border:1px solid var(--border-color); padding:0.6rem; border-radius:6px; color:#000;">
            <input type="text" placeholder="CVC" required style="background:#fff; border:1px solid var(--border-color); padding:0.6rem; border-radius:6px; color:#000;">
          </div>
        </div>

        <button type="submit" class="btn-luxury mt-4" style="justify-content:center; padding:1rem;">Complete Payment & Place Order</button>
      </form>
    `;

    container.querySelector('#close-checkout-btn').addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    const form = container.querySelector('#stripe-checkout-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.completeOrder(form);
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

    const giftWrapFee = this.giftWrappingActive ? 5.00 : 0.00;
    const auto = CouponEngine.getAutomaticDiscounts(subtotal, this.customerEmail);
    let autoDisc = 0;
    auto.forEach(ad => autoDisc += ad.discountAmount);

    const subAfterAuto = Math.max(0, subtotal - autoDisc);

    let couponDisc = 0;
    let isFreeShippingCoupon = false;
    if (this.appliedCouponCode) {
      const res = CouponEngine.validateAndApply(this.appliedCouponCode, this.cart, this.customerEmail);
      if (res.isValid) {
        couponDisc = res.discountAmount;
        if (res.type === 'free_shipping') isFreeShippingCoupon = true;
      }
    }

    const subAfterCoupon = Math.max(0, subAfterAuto - couponDisc);
    const shipping = CouponEngine.calculateShipping(subAfterCoupon, isFreeShippingCoupon);
    const finalTotal = parseFloat((subAfterCoupon + shipping + giftWrapFee).toFixed(2));

    const name = formElement.querySelector('#chk-name').value.trim();
    const email = formElement.querySelector('#chk-email').value.trim();
    const address = formElement.querySelector('#chk-address').value.trim();

    // Deduct stock
    const updatedProducts = products.map(p => {
      const cartItem = this.cart.find(c => c.productId === p.id);
      if (cartItem) {
        return { ...p, inventory: Math.max(0, p.inventory - cartItem.quantity) };
      }
      return p;
    });
    store.saveProducts(updatedProducts);

    // Save Order
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
      total: finalTotal,
      date: new Date().toISOString()
    };
    
    const saved = store.addOrder(orderObj);

    // Render Success Page
    const container = document.getElementById('checkout-container');
    container.innerHTML = `
      <div style="text-align:center; padding:2rem 1rem;">
        <span style="font-size:4rem; display:block; margin-bottom:1rem;">🧶</span>
        <h2 style="font-family:var(--font-heading); margin-bottom:1rem;">Artisanal Stitching Initiated!</h2>
        <p style="opacity:0.8; margin-bottom:2rem;">Thank you, ${name}. Your card has been processed and our knitters are preparing your package.</p>
        
        <div class="glass-panel" style="padding:1.5rem; border-radius:12px; text-align:start; margin-bottom:2rem;">
          <div><strong>Order ID:</strong> <span style="font-weight:700; color:var(--primary-color);">${saved.id}</span></div>
          <div><strong>Total Paid:</strong> $${finalTotal.toFixed(2)}</div>
          <div><strong>Delivery Address:</strong> ${address}</div>
        </div>

        <button class="btn-luxury" id="checkout-success-btn" style="width:100%; justify-content:center;">Return to Collection</button>
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
    // Basic Confetti effect
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

  // User Auth Portal modal display
  showUserPortal() {
    const overlay = document.getElementById('user-auth-overlay');
    const container = document.getElementById('user-auth-container');
    if (!overlay || !container) return;

    if (this.userLoggedIn) {
      // Render Dashboard
      const orders = store.getOrders().filter(o => o.email.toLowerCase() === this.userEmail.toLowerCase());
      const points = 150 + orders.reduce((sum, o) => sum + Math.floor(o.total * 0.1), 0);
      const isAr = this.lang() === 'ar';

      container.innerHTML = `
        <button class="modal-close" id="close-user-portal-btn" style="position:absolute; top:1rem; right:1rem;">✕</button>
        <h2 style="font-family:var(--font-heading); margin-bottom:1.5rem;">Artisan Dashboard</h2>
        
        <div style="display:flex; flex-direction:column; gap:1.25rem; text-align:start;">
          <div style="display:flex; justify-content:space-between; background:var(--card-bg-color); padding:1rem; border-radius:8px;">
            <span>Loyalty Reward Points:</span>
            <strong style="color:var(--primary-color);">${points} Points</strong>
          </div>
          
          <h3>My Orders Tracking</h3>
          <div style="max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:0.8rem;">
            ${orders.map(o => `
              <div class="glass-panel" style="padding:0.75rem; border-radius:8px; font-size:0.85rem;">
                <div style="display:flex; justify-content:space-between; font-weight:700;">
                  <span>${o.id}</span>
                  <span style="color:var(--primary-color);">${o.status}</span>
                </div>
                <div style="font-size:0.75rem; opacity:0.7; margin-top:0.2rem;">Total: $${o.total.toFixed(2)} - Date: ${new Date(o.date).toLocaleDateString()}</div>
              </div>
            `).join('')}
            ${orders.length === 0 ? '<p style="opacity:0.6; font-size:0.9rem;">No orders registered under this account.</p>' : ''}
          </div>

          <button class="btn-danger" id="user-logout-btn" style="margin-top:1rem; padding:0.6rem; border-radius:8px;">Logout</button>
        </div>
      `;

      container.querySelector('#user-logout-btn').addEventListener('click', () => {
        localStorage.removeItem('user_session_email');
        this.userLoggedIn = false;
        this.userEmail = '';
        overlay.classList.remove('active');
        this.showToast("Logged out successfully.", "info");
      });

    } else {
      // Render Login/Register form
      container.innerHTML = `
        <button class="modal-close" id="close-user-portal-btn" style="position:absolute; top:1rem; right:1rem;">✕</button>
        <h2 style="font-family:var(--font-heading); margin-bottom:1.5rem;">Join the Craft Circle</h2>
        
        <form id="user-login-form" style="display:flex; flex-direction:column; gap:1.25rem; text-align:start;">
          <div class="form-group">
            <label>${this.t('email')}</label>
            <input type="email" id="u-email" required placeholder="name@email.com" style="background:var(--card-bg-color); border:1px solid var(--border-color); border-radius:8px; padding:0.6rem; color:var(--text-color);">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="u-pass" required placeholder="••••••••" style="background:var(--card-bg-color); border:1px solid var(--border-color); border-radius:8px; padding:0.6rem; color:var(--text-color);">
          </div>
          
          <button type="submit" class="btn-luxury" style="justify-content:center; padding:0.8rem; font-weight:700;">Login / Create Account</button>
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
        this.showToast("Account authorized successfully!", "success");
      });
    }

    container.querySelector('#close-user-portal-btn').addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    overlay.classList.add('active');
  }

  bindGlobalEvents() {
    // Menu item clicks
    const items = this.container.querySelectorAll('.nav-item');
    items.forEach(it => {
      it.addEventListener('click', () => {
        // Redraw content immediately on link trigger
      });
    });

    // Logo click resets to home
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
        store.notify('active_language', nextLang);
      });
    }

    // User profile click
    const userBtn = document.getElementById('user-portal-btn');
    if (userBtn) {
      userBtn.addEventListener('click', () => {
        this.showUserPortal();
      });
    }

    // Cart toggler
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

    // Floating scroll to top button
    const topBtn = document.getElementById('scroll-top-btn');
    if (topBtn) {
      topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Quick Buy trigger in grid
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

      // Coupon tags remove
      if (e.target && e.target.id === 'cart-remove-coupon-btn') {
        this.appliedCouponCode = '';
        const input = document.getElementById('coupon-code-input');
        if (input) input.value = '';
        this.saveCart();
      }
    });

    // Checkbox toggles in cart
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

    // Coupon Apply Click in cart
    const applyBtn = document.getElementById('coupon-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const input = document.getElementById('coupon-code-input');
        if (input) {
          this.appliedCouponCode = input.value.trim();
          this.saveCart();
        }
      });
    }

    // Checkout Modal opener
    const checkoutOpener = document.getElementById('cart-checkout-btn');
    if (checkoutOpener) {
      checkoutOpener.addEventListener('click', () => {
        this.showCheckoutModal();
      });
    }

    // Bind specific subpage handlers
    this.bindSubpageEvents();
  }

  bindSubpageEvents() {
    const route = this.getRoute();

    if (route === 'shop') {
      // Search field
      const search = document.getElementById('shop-search-field');
      if (search) {
        search.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
          this.renderFilteredShopGrid();
        });
      }

      // Category filters
      this.container.querySelectorAll('.shop-cat-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.container.querySelectorAll('.shop-cat-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeCategory = btn.getAttribute('data-cat');
          this.renderFilteredShopGrid();
        });
      });

      // Price slider
      const slider = document.getElementById('shop-price-slider');
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.priceLimit = parseInt(e.target.value);
          // Update visual range value
          const val = slider.previousElementSibling.querySelector('span:nth-child(2)');
          if (val) val.innerText = `$${this.priceLimit}`;
          this.renderFilteredShopGrid();
        });
      }

      // Sort
      const sort = document.getElementById('shop-sort-select');
      if (sort) {
        sort.addEventListener('change', (e) => {
          this.sortOrder = e.target.value;
          this.renderFilteredShopGrid();
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

      // Details Qty selectors
      let qty = 1;
      const val = document.getElementById('details-qty-val');
      const dec = document.getElementById('details-dec-qty');
      const inc = document.getElementById('details-inc-qty');

      if (dec && inc && val) {
        dec.addEventListener('click', () => {
          if (qty > 1) {
            qty--;
            val.innerText = qty;
          }
        });
        inc.addEventListener('click', () => {
          qty++;
          val.innerText = qty;
        });
      }

      // Color/Size Select selectors
      const dots = this.container.querySelectorAll('.color-dot-selector');
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          dots.forEach(d => d.classList.remove('selected'));
          dot.classList.add('selected');
        });
      });

      const sizes = this.container.querySelectorAll('.size-select-btn');
      sizes.forEach(s => {
        s.addEventListener('click', () => {
          sizes.forEach(sz => sz.classList.remove('active'));
          s.classList.add('active');
        });
      });

      // Cart buttons
      const addCart = document.getElementById('details-add-to-cart-btn');
      const buyNow = document.getElementById('details-buy-now-btn');
      const hash = window.location.hash || '#details-1';
      const prodId = hash.split('-')[1] || '1';

      if (addCart) {
        addCart.addEventListener('click', () => {
          const size = this.container.querySelector('.size-select-btn.active')?.getAttribute('data-size') || "M";
          const color = this.container.querySelector('.color-dot-selector.selected')?.getAttribute('data-color') || "Original";
          this.addToCart(prodId, qty, size, color);
        });
      }
      if (buyNow) {
        buyNow.addEventListener('click', () => {
          const size = this.container.querySelector('.size-select-btn.active')?.getAttribute('data-size') || "M";
          const color = this.container.querySelector('.color-dot-selector.selected')?.getAttribute('data-color') || "Original";
          this.addToCart(prodId, qty, size, color);
          document.getElementById('cart-drawer').classList.add('active');
          document.getElementById('cart-drawer-overlay').classList.add('active');
        });
      }

    } else if (route === 'custom') {
      // Custom Order submits
      const form = document.getElementById('custom-knit-request-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          
          const name = form.querySelector('#cust-name').value.trim();
          const email = form.querySelector('#cust-email').value.trim();
          const details = form.querySelector('#cust-spec').value.trim();
          const size = form.querySelector('#cust-size').value;
          const budget = parseFloat(form.querySelector('#cust-budget').value || '0');
          const deliveryDate = form.querySelector('#cust-date').value;

          const submitOrder = (imageFile = '') => {
            const orderData = { name, email, details, size, budget, deliveryDate, image: imageFile };
            store.addCustomOrder(orderData);
            this.showToast(this.lang() === 'ar' ? 'تم إرسال طلبك بنجاح! سنقوم بمراجعته قريباً.' : 'Custom order request submitted successfully!', 'success');
            form.reset();
          };

          const file = form.querySelector('#cust-file');
          if (file && file.files && file.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => submitOrder(event.target.result);
            reader.readAsDataURL(file.files[0]);
          } else {
            submitOrder();
          }
        });
      }
    }

    // Grid image details navigation clicks
    this.container.querySelectorAll('.open-details-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const card = trigger.closest('.crochet-card');
        const id = card.getAttribute('data-product-id');
        window.location.hash = `#details-${id}`;
      });
    });

    // Home Dots
    const dots = this.container.querySelectorAll('.dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        this.currentSlideIndex = parseInt(dot.getAttribute('data-index'));
        this.updateSliderUI();
        this.startSlider();
      });
    });
  }

  renderFilteredShopGrid() {
    const grid = this.container.querySelector('.crochet-grid');
    if (!grid) return;

    const products = store.getProducts();
    let filtered = products;

    if (this.activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
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
        <div style="grid-column: 1 / -1; padding: 5rem; text-align:center; color:var(--neutral-gray);">
          <span style="font-size:3rem;">🧶</span>
          <p style="margin-top:1rem;">No items match the chosen filters.</p>
        </div>
      `;
    }

    // Rebind triggers
    this.container.querySelectorAll('.open-details-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const card = trigger.closest('.crochet-card');
        const id = card.getAttribute('data-product-id');
        window.location.hash = `#details-${id}`;
      });
    });
  }
}
export const storefront = Storefront;
