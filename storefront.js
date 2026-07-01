// Storefront View Controller
import { store } from './store.js';
import { CouponEngine } from './coupons.js';

export class Storefront {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.appliedCouponCode = localStorage.getItem('applied_coupon') || '';
    this.customerEmail = localStorage.getItem('customer_email') || '';
    this.customerName = localStorage.getItem('customer_name') || '';
    this.checkoutOpen = false;
    
    // Hero Slider index
    this.currentSlideIndex = 0;
    this.sliderInterval = null;

    // Toast manager
    this.toastContainer = null;
    
    // Subscribe to store updates for instant live rendering
    this.unsubscribe = store.subscribe((key, val) => {
      // Re-render when products, settings, banners, categories, or coupons change
      if (key !== 'orders' && key !== 'customers' && key !== 'session') {
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
    if (theme.fontFamily) {
      root.style.setProperty('--font-family', theme.fontFamily);
    }
  }

  // Cart Management
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    localStorage.setItem('customer_email', this.customerEmail);
    localStorage.setItem('customer_name', this.customerName);
    if (this.appliedCouponCode) {
      localStorage.setItem('applied_coupon', this.appliedCouponCode);
    } else {
      localStorage.removeItem('applied_coupon');
    }
    this.renderCartItems();
    this.renderCartSummary();
    this.updateCartBadge();
  }

  addToCart(productId, quantity = 1) {
    const products = store.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.inventory <= 0) {
      this.showToast("This item is out of stock.", "error");
      return;
    }

    const existingIndex = this.cart.findIndex(item => item.productId === productId);
    if (existingIndex !== -1) {
      const newQty = this.cart[existingIndex].quantity + quantity;
      if (newQty > product.inventory) {
        this.cart[existingIndex].quantity = product.inventory;
        this.showToast(`Limited to available stock (${product.inventory} items).`, "warning");
      } else {
        this.cart[existingIndex].quantity = newQty;
        this.showToast(`Added ${quantity} more ${product.name} to cart!`, "success");
      }
    } else {
      this.cart.push({
        productId,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: Math.min(quantity, product.inventory)
      });
      this.showToast(`Added ${product.name} to cart!`, "success");
    }

    this.saveCart();
  }

  updateCartQty(productId, quantity) {
    const products = store.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const index = this.cart.findIndex(item => item.productId === productId);
    if (index !== -1) {
      if (quantity <= 0) {
        this.cart.splice(index, 1);
        this.showToast("Item removed from cart.", "info");
      } else if (quantity > product.inventory) {
        this.cart[index].quantity = product.inventory;
        this.showToast(`Only ${product.inventory} items in stock.`, "warning");
      } else {
        this.cart[index].quantity = quantity;
      }
      this.saveCart();
    }
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.productId !== productId);
    this.showToast("Item removed from cart.", "info");
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.appliedCouponCode = '';
    this.saveCart();
  }

  // Toast System
  showToast(message, type = 'info') {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast glass-panel ${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    // Slide in
    setTimeout(() => toast.classList.add('show'), 10);

    // Slide out and remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Banner Carousel
  startSlider() {
    if (this.sliderInterval) clearInterval(this.sliderInterval);
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  nextSlide() {
    const banners = store.getBanners();
    if (!banners || banners.length <= 1) return;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % banners.length;
    this.updateSliderUI();
  }

  goToSlide(index) {
    this.currentSlideIndex = index;
    this.updateSliderUI();
    this.startSlider(); // reset timer
  }

  updateSliderUI() {
    const slides = this.container.querySelectorAll('.slide');
    const dots = this.container.querySelectorAll('.dot');
    
    slides.forEach((slide, idx) => {
      if (idx === this.currentSlideIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === this.currentSlideIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Render Functions
  render() {
    if (!this.container) return;
    
    const settings = store.getSettings();
    const categories = store.getCategories();
    
    // 1. Build Base layout
    this.container.innerHTML = `
      <!-- Flash Sale Countdown Banner -->
      ${this.renderFlashSaleBanner(settings.saleBanner)}

      <!-- Store Header Navbar -->
      <header class="store-header">
        <div class="logo-container">
          <div class="logo" id="store-logo-btn">
            ${settings.logoType === 'image' ? `<img src="${settings.logo}" alt="Logo">` : `<span class="gradient-text">${settings.logo}</span>`}
          </div>
        </div>

        <div class="search-bar-container">
          <span class="search-icon">🔍</span>
          <input type="text" id="store-search-input" placeholder="Search products..." value="${this.searchQuery}">
        </div>

        <div class="nav-actions">
          ${store.isAdminLoggedIn() ? `
            <a href="#admin" class="btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Admin Panel</a>
          ` : `
            <a href="#admin" class="nav-link" style="font-size: 0.9rem; opacity: 0.6;">Admin</a>
          `}
          <button class="cart-btn" id="open-cart-btn">
            🛒 <span class="cart-badge" id="cart-badge-val">0</span>
          </button>
        </div>
      </header>

      <!-- Banners Hero Slider -->
      <section class="hero-slider" id="hero-slider-section">
        ${this.renderHeroSlider()}
      </section>

      <!-- Main Catalogue -->
      <main class="main-storefront">
        <!-- Categories Scroll -->
        <div class="categories-scroll">
          <button class="category-tab ${this.activeCategory === 'All' ? 'active' : ''}" data-category="All">All Products</button>
          ${categories.map(cat => `
            <button class="category-tab ${this.activeCategory === cat ? 'active' : ''}" data-category="${cat}">${cat}</button>
          `).join('')}
        </div>

        <!-- Product Grid -->
        <div class="product-grid" id="product-grid-container">
          ${this.renderProductGrid()}
        </div>
      </main>

      <!-- Footer -->
      <footer style="padding: 3rem 2rem; border-top: 1px solid var(--glass-border); background: rgba(0,0,0,0.2); font-size: 0.9rem; color: rgba(255,255,255,0.6);">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
          <div>
            <h3 style="color:#fff; margin-bottom:1rem;">${settings.name}</h3>
            <p>Premium quality devices, curated for performance, aesthetics, and simplicity.</p>
          </div>
          <div>
            <h3 style="color:#fff; margin-bottom:1rem;">Contact Info</h3>
            <p>📍 ${settings.contactAddress}</p>
            <p>📞 ${settings.contactPhone}</p>
            <p>✉️ ${settings.contactEmail}</p>
          </div>
          <div>
            <h3 style="color:#fff; margin-bottom:1rem;">Follow Us</h3>
            <div style="display:flex; gap:1rem;">
              ${settings.socialLinks.facebook ? `<a href="${settings.socialLinks.facebook}" target="_blank" style="color:var(--text-color); font-size:1.2rem;">📘</a>` : ''}
              ${settings.socialLinks.instagram ? `<a href="${settings.socialLinks.instagram}" target="_blank" style="color:var(--text-color); font-size:1.2rem;">📷</a>` : ''}
              ${settings.socialLinks.twitter ? `<a href="${settings.socialLinks.twitter}" target="_blank" style="color:var(--text-color); font-size:1.2rem;">🐦</a>` : ''}
            </div>
          </div>
        </div>
      </footer>

      <!-- Shopping Cart Drawer Overlay -->
      <div class="cart-drawer-overlay" id="cart-drawer-overlay"></div>
      
      <!-- Shopping Cart Drawer -->
      <div class="cart-drawer" id="cart-drawer">
        <div class="cart-header">
          <h2>Your Cart</h2>
          <button class="cart-close-btn" id="close-cart-btn">✕</button>
        </div>
        <div class="cart-items-list" id="cart-items-list-container">
          <!-- Items injected here -->
        </div>
        <div class="cart-coupon-section">
          <div class="coupon-input-group">
            <input type="text" id="coupon-code-input" placeholder="Promo Code (e.g. SUMMER50)" value="${this.appliedCouponCode}">
            <button class="coupon-apply-btn" id="coupon-apply-btn">Apply</button>
          </div>
          <div id="coupon-status-box"></div>
        </div>
        <div class="cart-summary" id="cart-summary-container">
          <!-- Summary injected here -->
        </div>
      </div>

      <!-- Detail Modal -->
      <div class="modal-overlay" id="details-modal-overlay">
        <div class="modal-container glass-panel" id="details-modal-container">
          <!-- Injected Product Details -->
        </div>
      </div>

      <!-- Checkout Modal -->
      <div class="modal-overlay" id="checkout-modal-overlay">
        <div class="modal-container glass-panel" style="max-width: 600px; padding: 2rem;" id="checkout-modal-container">
          <!-- Injected Checkout Form -->
        </div>
      </div>

      <!-- Floating WhatsApp widget -->
      <div class="whatsapp-widget">
        <a href="https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello!%20I'm%20shopping%20on%20your%20website%20and%20have%20a%20question." target="_blank" class="whatsapp-btn">
          💬
        </a>
        <div class="whatsapp-tooltip">Chat with us on WhatsApp</div>
      </div>
    `;

    this.bindEvents();
    this.renderCartItems();
    this.renderCartSummary();
    this.updateCartBadge();
    this.initCountdownTimer();
  }

  // Banners Hero Builder
  renderHeroSlider() {
    const banners = store.getBanners();
    if (!banners || banners.length === 0) return `<div style="padding: 4rem; text-align: center; color: var(--neutral-gray);">No banners configured.</div>`;
    
    return `
      ${banners.map((banner, index) => `
        <div class="slide ${index === this.currentSlideIndex ? 'active' : ''}" style="background-image: url('${banner.image}');">
          <div class="slide-content">
            <h1>${banner.title}</h1>
            <p>${banner.subtitle}</p>
            <a href="${banner.linkTarget || '#'}" class="btn-primary">${banner.linkText || 'Shop Now'}</a>
          </div>
        </div>
      `).join('')}

      <div class="slider-dots">
        ${banners.map((_, index) => `
          <div class="dot ${index === this.currentSlideIndex ? 'active' : ''}" data-index="${index}"></div>
        `).join('')}
      </div>
    `;
  }

  // Flash Sale Countdown Layout
  renderFlashSaleBanner(banner) {
    if (!banner || !banner.enabled) return '';
    return `
      <div class="flash-sale-banner" id="flash-sale-container">
        <span>⚡ ${banner.text}</span>
        <div class="flash-timer">
          Ends in: <span id="countdown-timer-value">00d : 00h : 00m : 00s</span>
        </div>
      </div>
    `;
  }

  initCountdownTimer() {
    const timerSpan = document.getElementById('countdown-timer-value');
    if (!timerSpan) return;

    const settings = store.getSettings();
    const expiryDate = new Date(settings.saleBanner.expiry).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = expiryDate - now;

      if (distance < 0) {
        timerSpan.innerHTML = "Expired!";
        const container = document.getElementById('flash-sale-container');
        if (container) container.style.display = 'none';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timerSpan.innerHTML = `${days}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
    };

    updateTimer();
    // Clear old timer inside window context if running to avoid multiples
    if (window.storefrontCountdownInterval) clearInterval(window.storefrontCountdownInterval);
    window.storefrontCountdownInterval = setInterval(updateTimer, 1000);
  }

  // Product Grid Builder
  renderProductGrid() {
    const products = store.getProducts();
    let filtered = products;

    // Filter by active category
    if (this.activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      return `<div style="grid-column: 1 / -1; padding: 4rem; text-align: center; color: var(--neutral-gray);">No products found.</div>`;
    }

    return filtered.map(prod => {
      let badge = '';
      let isOutOfStock = prod.inventory <= 0;
      let isLowStock = prod.inventory > 0 && prod.inventory <= 5;

      if (isOutOfStock) {
        badge = `<span class="product-card-badge out-of-stock">Out of Stock</span>`;
      } else if (isLowStock) {
        badge = `<span class="product-card-badge low-stock">Low Stock (${prod.inventory} left)</span>`;
      }

      return `
        <div class="product-card glass-panel" data-product-id="${prod.id}">
          <div class="product-card-img-wrapper open-details-trigger">
            <img class="product-card-img" src="${prod.image}" alt="${prod.name}">
            ${badge}
          </div>
          <div class="product-card-content">
            <span class="product-card-category">${prod.category}</span>
            <h3 class="product-card-title open-details-trigger" style="cursor:pointer;">${prod.name}</h3>
            <p class="product-card-desc">${prod.description}</p>
            <div class="product-card-footer">
              <span class="product-card-price">$${prod.price.toFixed(2)}</span>
              <button class="btn-icon add-to-cart-trigger" ${isOutOfStock ? 'disabled' : ''} style="${isOutOfStock ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                ➕
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Cart Drawer rendering
  renderCartItems() {
    const listContainer = document.getElementById('cart-items-list-container');
    if (!listContainer) return;

    if (this.cart.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-cart-view">
          <div class="empty-cart-icon">🛒</div>
          <p>Your cart is empty.</p>
        </div>
      `;
      return;
    }

    const products = store.getProducts();

    listContainer.innerHTML = this.cart.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const img = prod ? prod.image : 'assets/placeholder.jpg';
      const maxInv = prod ? prod.inventory : 100;

      return `
        <div class="cart-item">
          <img class="cart-item-img" src="${img}" alt="${item.name}">
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.name}</h4>
            <span class="cart-item-price">$${item.price.toFixed(2)}</span>
            <div class="quantity-selector mt-4" style="width: fit-content;">
              <button class="qty-btn dec-cart-qty" data-product-id="${item.productId}">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn inc-cart-qty" data-product-id="${item.productId}" ${item.quantity >= maxInv ? 'disabled style="opacity:0.5;"' : ''}>+</button>
            </div>
          </div>
          <button class="cart-item-delete delete-cart-item" data-product-id="${item.productId}">🗑️</button>
        </div>
      `;
    }).join('');
  }

  // Breakdown Summary Calculator
  renderCartSummary() {
    const summaryContainer = document.getElementById('cart-summary-container');
    if (!summaryContainer) return;

    if (this.cart.length === 0) {
      summaryContainer.innerHTML = '';
      return;
    }

    // Calculations
    const products = store.getProducts();
    let subtotal = 0;
    this.cart.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const price = prod ? prod.price : item.price;
      subtotal += price * item.quantity;
    });

    // 1. Calculate Automatic Discounts
    const autoDiscounts = CouponEngine.getAutomaticDiscounts(subtotal, this.customerEmail);
    let autoDiscountTotal = 0;
    autoDiscounts.forEach(ad => {
      autoDiscountTotal += ad.discountAmount;
    });

    const subtotalAfterAuto = Math.max(0, subtotal - autoDiscountTotal);

    // 2. Validate Coupon
    let couponDiscount = 0;
    let isFreeShippingCoupon = false;
    let couponValidation = null;

    if (this.appliedCouponCode) {
      couponValidation = CouponEngine.validateAndApply(this.appliedCouponCode, this.cart, this.customerEmail);
      if (couponValidation.isValid) {
        couponDiscount = couponValidation.discountAmount;
        if (couponValidation.type === 'free_shipping') {
          isFreeShippingCoupon = true;
        }
        
        // Render success coupon tag
        this.renderCouponStatus(`
          <div class="coupon-tag mt-4">
            <span>🎟️ <strong>${couponValidation.code}</strong> applied (-$${couponDiscount.toFixed(2)}${isFreeShippingCoupon ? ' + Free Shipping' : ''})</span>
            <button id="remove-coupon-btn">✕</button>
          </div>
        `);
      } else {
        this.renderCouponStatus(`<div class="coupon-error-msg mt-4">❌ ${couponValidation.error}</div>`);
        this.appliedCouponCode = ''; // Reset invalid coupon code
      }
    } else {
      this.renderCouponStatus('');
    }

    const subtotalAfterCoupon = Math.max(0, subtotalAfterAuto - couponDiscount);

    // 3. Shipping
    const shippingCost = CouponEngine.calculateShipping(subtotalAfterCoupon, isFreeShippingCoupon);
    const finalTotal = subtotalAfterCoupon + shippingCost;

    summaryContainer.innerHTML = `
      <div class="summary-row">
        <span>Subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      
      ${autoDiscounts.map(ad => `
        <div class="summary-row discount-row">
          <span>🎁 ${ad.text}</span>
          <span>-$${ad.discountAmount.toFixed(2)}</span>
        </div>
      `).join('')}

      ${couponDiscount > 0 ? `
        <div class="summary-row discount-row">
          <span>🎟️ Coupon (${this.appliedCouponCode})</span>
          <span>-$${couponDiscount.toFixed(2)}</span>
        </div>
      ` : ''}

      <div class="summary-row">
        <span>Shipping</span>
        <span>${shippingCost === 0 ? '<span class="text-success">FREE</span>' : `$${shippingCost.toFixed(2)}`}</span>
      </div>

      <div class="summary-row total-row">
        <span>Total</span>
        <span>$${finalTotal.toFixed(2)}</span>
      </div>

      <button class="btn-primary checkout-btn" id="cart-checkout-btn">Proceed to Checkout</button>
    `;
  }

  renderCouponStatus(html) {
    const box = document.getElementById('coupon-status-box');
    if (box) box.innerHTML = html;
  }

  updateCartBadge() {
    const badge = document.getElementById('cart-badge-val');
    if (!badge) return;
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = count;
    badge.style.display = count === 0 ? 'none' : 'flex';
  }

  // Product detailed popup
  showProductDetailsModal(productId) {
    const products = store.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modalOverlay = document.getElementById('details-modal-overlay');
    const modalContainer = document.getElementById('details-modal-container');
    if (!modalOverlay || !modalContainer) return;

    let isOutOfStock = product.inventory <= 0;

    modalContainer.innerHTML = `
      <button class="modal-close" id="close-details-modal">✕</button>
      <div class="product-details-layout">
        <div>
          <img class="product-details-img" src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-details-info">
          <span class="product-details-category">${product.category}</span>
          <h2 class="product-details-title">${product.name}</h2>
          <div class="product-details-price">$${product.price.toFixed(2)}</div>
          
          <div class="product-details-desc">${product.description}</div>
          
          <div style="margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--neutral-gray);">
            Availability: ${isOutOfStock ? `<span class="text-danger" style="font-weight:600;">Out of Stock</span>` : `<span class="text-success" style="font-weight:600;">In Stock (${product.inventory} units)</span>`}
          </div>

          <div class="product-details-actions">
            ${isOutOfStock ? `
              <button class="btn-primary" disabled style="opacity: 0.5; cursor: not-allowed; flex: 1;">Out of Stock</button>
            ` : `
              <div class="quantity-selector">
                <button class="qty-btn" id="modal-dec-qty">-</button>
                <span class="qty-val" id="modal-qty-val">1</span>
                <button class="qty-btn" id="modal-inc-qty">+</button>
              </div>
              <button class="btn-primary" id="modal-add-to-cart" style="flex: 1;">Add to Cart</button>
            `}
          </div>
        </div>
      </div>
    `;

    // Modal listeners
    let selectQty = 1;
    const qtyVal = modalContainer.querySelector('#modal-qty-val');
    const decBtn = modalContainer.querySelector('#modal-dec-qty');
    const incBtn = modalContainer.querySelector('#modal-inc-qty');
    const addBtn = modalContainer.querySelector('#modal-add-to-cart');

    if (decBtn && incBtn && qtyVal) {
      decBtn.addEventListener('click', () => {
        if (selectQty > 1) {
          selectQty--;
          qtyVal.innerText = selectQty;
        }
      });
      incBtn.addEventListener('click', () => {
        if (selectQty < product.inventory) {
          selectQty++;
          qtyVal.innerText = selectQty;
        } else {
          this.showToast(`Cannot order more than available inventory (${product.inventory} items).`, "warning");
        }
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.addToCart(product.id, selectQty);
        modalOverlay.classList.remove('active');
      });
    }

    const closeBtn = modalContainer.querySelector('#close-details-modal');
    closeBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.classList.add('active');
  }

  // Checkout form
  showCheckoutModal() {
    const modalOverlay = document.getElementById('checkout-modal-overlay');
    const modalContainer = document.getElementById('checkout-modal-container');
    if (!modalOverlay || !modalContainer) return;

    const settings = store.getSettings();

    modalContainer.innerHTML = `
      <button class="modal-close" id="close-checkout-modal" style="top: 0.5rem; right: 0.5rem;">✕</button>
      <h2 style="margin-bottom: 1.5rem;">Shipping & Checkout</h2>
      
      <form id="checkout-form-wizard" style="display:flex; flex-direction:column; gap:1rem;">
        <div class="checkout-form-grid">
          <div class="form-group">
            <label for="co-name">Full Name</label>
            <input type="text" id="co-name" required value="${this.customerName}">
          </div>
          <div class="form-group">
            <label for="co-email">Email Address</label>
            <input type="email" id="co-email" required value="${this.customerEmail}">
          </div>
          <div class="form-group">
            <label for="co-phone">Phone Number</label>
            <input type="tel" id="co-phone" required>
          </div>
          <div class="form-group">
            <label for="co-whatsapp">WhatsApp Number (For Order Updates)</label>
            <input type="tel" id="co-whatsapp" placeholder="e.g. +96170123456" value="${this.customerName ? store.getSettings().whatsappNumber : ''}">
          </div>
          <div class="form-group form-full-width">
            <label for="co-address">Shipping Address</label>
            <textarea id="co-address" rows="2" required></textarea>
          </div>
        </div>

        <h3 style="font-size: 1.1rem; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">Payment Method</h3>
        <div class="payment-options">
          ${settings.paymentMethods.cod.enabled ? `
            <div class="payment-option-card selected" data-method="cod">
              <input type="radio" name="payment_method" value="cod" checked style="display:none;">
              <span>💵</span>
              <div>
                <strong>${settings.paymentMethods.cod.name}</strong>
                <div style="font-size:0.75rem; color:var(--neutral-gray);">Pay with cash upon delivery of items.</div>
              </div>
            </div>
          ` : ''}

          ${settings.paymentMethods.bank.enabled ? `
            <div class="payment-option-card ${!settings.paymentMethods.cod.enabled ? 'selected' : ''}" data-method="bank">
              <input type="radio" name="payment_method" value="bank" ${!settings.paymentMethods.cod.enabled ? 'checked' : ''} style="display:none;">
              <span>🏦</span>
              <div>
                <strong>${settings.paymentMethods.bank.name}</strong>
                <div style="font-size:0.75rem; color:var(--neutral-gray);">Transfer to our bank account. Details sent via email.</div>
              </div>
            </div>
          ` : ''}
        </div>

        <button type="submit" class="btn-primary mt-6" style="padding: 1rem; font-weight:700;">Place Order</button>
      </form>
    `;

    // Radio Card Selector hooks
    const optionCards = modalContainer.querySelectorAll('.payment-option-card');
    optionCards.forEach(card => {
      card.addEventListener('click', () => {
        optionCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const input = card.querySelector('input[type="radio"]');
        if (input) input.checked = true;
      });
    });

    // Real-time Email-Restricted Coupon recalculation
    const emailInput = modalContainer.querySelector('#co-email');
    const nameInput = modalContainer.querySelector('#co-name');
    
    const triggerRecalculate = () => {
      this.customerEmail = emailInput.value.trim();
      this.customerName = nameInput.value.trim();
      this.saveCart();
    };

    emailInput.addEventListener('blur', triggerRecalculate);
    nameInput.addEventListener('blur', triggerRecalculate);

    // Form Submit logic
    const form = modalContainer.querySelector('#checkout-form-wizard');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.placeOrder(form);
    });

    const closeBtn = modalContainer.querySelector('#close-checkout-modal');
    closeBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.classList.add('active');
  }

  // Order Placement
  placeOrder(formElement) {
    const products = store.getProducts();
    
    // Calculate final breakdown
    let subtotal = 0;
    this.cart.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const price = prod ? prod.price : item.price;
      subtotal += price * item.quantity;
    });

    const autoDiscounts = CouponEngine.getAutomaticDiscounts(subtotal, this.customerEmail);
    let autoDiscountTotal = 0;
    autoDiscounts.forEach(ad => autoDiscountTotal += ad.discountAmount);
    
    const subtotalAfterAuto = Math.max(0, subtotal - autoDiscountTotal);

    let couponDiscount = 0;
    let isFreeShippingCoupon = false;
    if (this.appliedCouponCode) {
      const validation = CouponEngine.validateAndApply(this.appliedCouponCode, this.cart, this.customerEmail);
      if (validation.isValid) {
        couponDiscount = validation.discountAmount;
        if (validation.type === 'free_shipping') {
          isFreeShippingCoupon = true;
        }
      }
    }

    const subtotalAfterCoupon = Math.max(0, subtotalAfterAuto - couponDiscount);
    const shippingCost = CouponEngine.calculateShipping(subtotalAfterCoupon, isFreeShippingCoupon);
    const finalTotal = parseFloat((subtotalAfterCoupon + shippingCost).toFixed(2));

    // Form Values
    const name = formElement.querySelector('#co-name').value.trim();
    const email = formElement.querySelector('#co-email').value.trim();
    const phone = formElement.querySelector('#co-phone').value.trim();
    const whatsapp = formElement.querySelector('#co-whatsapp').value.trim();
    const address = formElement.querySelector('#co-address').value.trim();
    
    const selectedCard = formElement.querySelector('.payment-option-card.selected');
    const paymentMethod = selectedCard ? selectedCard.getAttribute('data-method') : 'cod';

    // Deduct stock from inventory
    const updatedProducts = products.map(prod => {
      const cartItem = this.cart.find(c => c.productId === prod.id);
      if (cartItem) {
        return {
          ...prod,
          inventory: Math.max(0, prod.inventory - cartItem.quantity)
        };
      }
      return prod;
    });

    // Save inventory back
    store.saveProducts(updatedProducts);

    // Save Order Object
    const orderObj = {
      customerName: name,
      email,
      phone,
      whatsapp,
      shippingAddress: address,
      paymentMethod,
      items: [...this.cart],
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountApplied: parseFloat((autoDiscountTotal + couponDiscount).toFixed(2)),
      couponCode: this.appliedCouponCode,
      shippingCost,
      total: finalTotal,
      date: new Date().toISOString()
    };

    const savedOrder = store.addOrder(orderObj);

    // Render Success Modal page
    const modalContainer = document.getElementById('checkout-modal-container');
    modalContainer.innerHTML = `
      <div class="success-screen">
        <div class="success-icon">🎉</div>
        <h2>Order Placed Successfully!</h2>
        <p style="color:var(--neutral-gray);">Thank you, ${name}! Your order has been registered.</p>
        
        <div style="background: rgba(255,255,255,0.03); border:1px solid var(--glass-border); padding: 1.5rem; border-radius: 12px; width: 100%; text-align: left; margin: 1rem 0;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;">
            <strong>Order ID:</strong>
            <span class="gradient-text" style="font-weight:700;">${savedOrder.id}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;">
            <strong>Order Total:</strong>
            <span>$${finalTotal.toFixed(2)}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <strong>Payment Method:</strong>
            <span>${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</span>
          </div>
        </div>

        <button class="btn-primary" id="checkout-success-continue-btn" style="width: 100%;">Continue Shopping</button>
      </div>
    `;

    // Confetti effect
    this.celebrateConfetti();

    // Reset checkout forms & cart
    this.clearCart();
    
    const continueBtn = modalContainer.querySelector('#checkout-success-continue-btn');
    continueBtn.addEventListener('click', () => {
      document.getElementById('checkout-modal-overlay').classList.remove('active');
      document.getElementById('cart-drawer').classList.remove('active');
      document.getElementById('cart-drawer-overlay').classList.remove('active');
    });
  }

  // Interactive Confetti Effect
  celebrateConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    
    const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#3b82f6'];

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '9999';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - (p.r / 3)) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      // Remove offscreen
      particles.forEach((p, idx) => {
        if (p.y > canvas.height) {
          particles[idx] = {
            x: Math.random() * canvas.width,
            y: -10,
            r: p.r,
            d: p.d,
            color: p.color,
            tilt: p.tilt,
            tiltAngleIncremental: p.tiltAngleIncremental,
            tiltAngle: p.tiltAngle
          };
        }
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    }

    draw();
  }

  // Bind UI Handlers
  bindEvents() {
    // Logo Click triggers Category Reset
    const logoBtn = document.getElementById('store-logo-btn');
    if (logoBtn) {
      logoBtn.addEventListener('click', () => {
        this.activeCategory = 'All';
        this.searchQuery = '';
        this.render();
      });
    }

    // Search input
    const searchInput = document.getElementById('store-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        
        // INTERCEPT EASTER EGG "/admin" redirect!
        if (this.searchQuery.trim() === '/admin') {
          window.location.hash = '#admin';
          return;
        }

        // Re-render product grid only
        const grid = document.getElementById('product-grid-container');
        if (grid) grid.innerHTML = this.renderProductGrid();
        
        // Re-bind details click on new grid
        this.bindProductCardClicks();
      });
    }

    // Cart slider toggle
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

    // Category Tabs click
    const categoryTabs = this.container.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeCategory = tab.getAttribute('data-category');
        
        // Update product grid
        const grid = document.getElementById('product-grid-container');
        if (grid) grid.innerHTML = this.renderProductGrid();
        
        this.bindProductCardClicks();
      });
    });

    // Carousel dots
    const dots = this.container.querySelectorAll('.dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'));
        this.goToSlide(index);
      });
    });

    // Coupon Apply Click
    const applyCouponBtn = document.getElementById('coupon-apply-btn');
    if (applyCouponBtn) {
      applyCouponBtn.addEventListener('click', () => {
        const input = document.getElementById('coupon-code-input');
        if (input) {
          const rawCode = input.value.trim();
          if (!rawCode) {
            this.showToast("Please enter a coupon code.", "warning");
            return;
          }
          this.appliedCouponCode = rawCode;
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

    this.bindProductCardClicks();
    this.bindCartActions();
  }

  bindProductCardClicks() {
    const cards = this.container.querySelectorAll('.product-card');
    cards.forEach(card => {
      const productId = card.getAttribute('data-product-id');
      
      // Clicking image/title opens modal
      const triggers = card.querySelectorAll('.open-details-trigger');
      triggers.forEach(trig => {
        trig.addEventListener('click', (e) => {
          this.showProductDetailsModal(productId);
        });
      });

      // Quick Buy button
      const buyBtn = card.querySelector('.add-to-cart-trigger');
      if (buyBtn) {
        buyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.addToCart(productId, 1);
        });
      }
    });
  }

  bindCartActions() {
    const listContainer = document.getElementById('cart-items-list-container');
    if (!listContainer) return;

    listContainer.addEventListener('click', (e) => {
      const target = e.target;
      const prodId = target.getAttribute('data-product-id');
      
      if (target.classList.contains('dec-cart-qty')) {
        const qtyVal = parseInt(target.nextElementSibling.innerText);
        this.updateCartQty(prodId, qtyVal - 1);
      } else if (target.classList.contains('inc-cart-qty')) {
        const qtyVal = parseInt(target.previousElementSibling.innerText);
        this.updateCartQty(prodId, qtyVal + 1);
      } else if (target.classList.contains('delete-cart-item')) {
        this.removeFromCart(prodId);
      }
    });

    // Remove coupon trigger hook
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'remove-coupon-btn') {
        this.appliedCouponCode = '';
        const input = document.getElementById('coupon-code-input');
        if (input) input.value = '';
        this.saveCart();
        this.showToast("Coupon removed.", "info");
      }
    });
  }
}
