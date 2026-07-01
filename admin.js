// Admin Controller for HandMade Crochet - Bilingual & Live Customizer
import { store } from './store.js';
import { Storefront } from './storefront.js';

// Arabic translations for Admin Panels
const ADMIN_DICT = {
  dashboard: { en: "📊 Dashboard Overview", ar: "📊 نظرة عامة على لوحة التحكم" },
  products: { en: "📦 Stitch Products", ar: "📦 إدارة منتجات الكروشيه" },
  categories: { en: "🏷️ Categories", ar: "🏷️ تصنيفات المنتجات" },
  coupons: { en: "🎟️ Discount Coupons", ar: "🎟️ كوبونات وقسائم الخصم" },
  custom: { en: "🧶 Custom Requests", ar: "🧶 طلبات الحياكة الخاصة" },
  orders: { en: "🛒 Orders & Sales", ar: "🛒 المبيعات والطلبات" },
  editor: { en: "🎨 Visual Customizer", ar: "🎨 مصمم المظهر المرئي" }
};

export class Admin {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeTab = 'dashboard'; // dashboard, products, categories, coupons, custom, orders, customizer
    this.viewportMode = 'desktop';

    this.productSearch = '';
    this.couponSearch = '';
    this.customizerStorefront = null; // Preview frame instance

    this.unsubscribe = store.subscribe((key, val) => {
      if (store.isAdminLoggedIn()) {
        if (key === 'siteSettings_draft' || key === 'banners_draft') {
          // Auto update customizer preview
          this.updateCustomizerPreview();
        } else if (key === 'products' || key === 'categories' || key === 'coupons' || key === 'orders') {
          this.render();
        }
      }
    });

    this.init();
  }

  init() {
    this.render();
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.customizerStorefront) this.customizerStorefront.destroy();
  }

  lang() { return localStorage.getItem('active_language') || 'en'; }
  isAr() { return this.lang() === 'ar'; }

  t(key) {
    const isArabic = this.isAr();
    const translations = {
      sales: { en: "Total Sales", ar: "إجمالي المبيعات" },
      orders_cnt: { en: "Total Orders", ar: "عدد الطلبات" },
      custom_cnt: { en: "Custom Reviews", ar: "طلبات قيد المراجعة" },
      add_product: { en: "Add Product", ar: "إضافة منتج جديد" },
      create_coupon: { en: "Create Coupon", ar: "إنشاء كوبون" },
      username: { en: "Username", ar: "اسم المستخدم" },
      password: { en: "Password", ar: "كلمة المرور" },
      login: { en: "Login", ar: "تسجيل الدخول" }
    };
    return translations[key] ? (translations[key][isArabic ? 'ar' : 'en']) : key;
  }

  formatPrice(usdAmount) {
    const settings = store.getSettings();
    const curr = localStorage.getItem('active_currency') || 'USD';
    const rate = settings.exchangeRates[curr] || 1.0;
    const converted = usdAmount * rate;
    const symbols = {
      USD: `$${converted.toFixed(2)}`,
      EGP: `${converted.toFixed(0)} ج.م`,
      SAR: `${converted.toFixed(2)} ر.س`
    };
    return symbols[curr] || `$${usdAmount.toFixed(2)}`;
  }

  render() {
    if (!this.container) return;

    if (!store.isAdminLoggedIn()) {
      this.renderLogin();
      return;
    }

    const isAr = this.isAr();
    const pendingCustoms = store.getCustomOrders().filter(c => c.status === 'review').length;

    this.container.innerHTML = `
      <div class="admin-layout">
        <!-- Sidebar Navigation -->
        <aside class="admin-sidebar" style="background:#1c1917; border-right:1px solid rgba(120,53,15,0.12); color:#f5efe6;">
          <div class="admin-sidebar-header" style="border-bottom:1px solid rgba(255,255,255,0.05); text-align:start;">
            <span style="font-size: 1.4rem; font-weight:900; color:#fff; font-family:var(--font-heading);">🧶 ${isAr ? 'لوحة المسؤول' : 'Artisan Admin'}</span>
            <span class="admin-badge-label">${isAr ? 'خيارات الإدارة' : 'CONSOLES'}</span>
          </div>

          <nav class="admin-menu" style="text-align:start;">
            <div class="admin-menu-item ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">📊 ${isAr ? 'الرئيسية' : 'Dashboard'}</div>
            <div class="admin-menu-item ${this.activeTab === 'products' ? 'active' : ''}" data-tab="products">📦 ${isAr ? 'المنتجات' : 'Products'}</div>
            <div class="admin-menu-item ${this.activeTab === 'categories' ? 'active' : ''}" data-tab="categories">🏷️ ${isAr ? 'التصنيفات' : 'Categories'}</div>
            <div class="admin-menu-item ${this.activeTab === 'coupons' ? 'active' : ''}" data-tab="coupons">🎟️ ${isAr ? 'الكوبونات' : 'Coupons'}</div>
            <div class="admin-menu-item ${this.activeTab === 'custom' ? 'active' : ''}" data-tab="custom">
              🧶 ${isAr ? 'طلبات التفصيل' : 'Custom Requests'}
              ${pendingCustoms > 0 ? `<span style="background:var(--primary-color); color:#fff; font-size:0.7rem; font-weight:700; padding:0.15rem 0.4rem; border-radius:10px; margin-inline-start:0.5rem;">${pendingCustoms}</span>` : ''}
            </div>
            <div class="admin-menu-item ${this.activeTab === 'orders' ? 'active' : ''}" data-tab="orders">🛒 ${isAr ? 'المبيعات والطلبات' : 'Sales History'}</div>
            <div class="admin-menu-item ${this.activeTab === 'customizer' ? 'active' : ''}" data-tab="customizer" style="border-top:1px solid rgba(255,255,255,0.05); margin-top:1rem; padding-top:1.5rem; color:var(--accent-color);">🎨 ${isAr ? 'مصمم المظهر المرئي' : 'Live Customizer'}</div>
          </nav>

          <div class="admin-sidebar-footer" style="border-top:1px solid rgba(255,255,255,0.05);">
            <div class="admin-user-info" style="text-align:start;">
              <span class="admin-username" style="color:#fff; font-weight:700;">soha_work</span>
              <span class="admin-role">${isAr ? 'رئيسة الحياكات' : 'Head Knitter'}</span>
            </div>
            <button class="admin-logout-btn" id="admin-logout-btn" title="Logout">🚪</button>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="admin-main-container">
          <header class="admin-topbar">
            <h2 style="font-family:var(--font-heading); font-size:1.6rem;">${ADMIN_DICT[this.activeTab][isAr ? 'ar' : 'en']}</h2>
            <div style="display:flex; align-items:center; gap:1rem;">
              <select id="admin-lang-switch-select" style="background:none; border:none; font-weight:700; font-family:inherit; cursor:pointer;">
                <option value="en" ${this.lang() === 'en' ? 'selected' : ''}>English</option>
                <option value="ar" ${this.lang() === 'ar' ? 'selected' : ''}>العربية (RTL)</option>
              </select>
              <a href="#" class="btn-secondary" style="padding:0.4rem 1rem; font-size:0.85rem;">${isAr ? 'معاينة المتجر المباشر' : 'Live Storefront'}</a>
            </div>
          </header>

          <main class="admin-content" id="admin-tab-content-slot" style="padding:${this.activeTab === 'customizer' ? '0' : '3rem'};">
            ${this.renderTabContent()}
          </main>
        </div>
      </div>

      <!-- Admin Modal Overlay -->
      <div class="modal-overlay" id="admin-modal-overlay">
        <div class="modal-container glass-panel" style="max-width: 600px; padding: 2.5rem; width:100%;" id="admin-modal-container"></div>
      </div>
    `;

    this.bindEvents();
    if (this.activeTab === 'customizer') {
      this.mountCustomizerPreview();
    }
  }

  renderLogin() {
    const isAr = this.isAr();
    this.container.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; min-height:100vh; background:#1c1917; color:#f5efe6; padding:1.5rem;">
        <div class="glass-panel" style="max-width:400px; width:100%; padding:2.5rem; border-radius:12px; text-align:center;">
          <h2 style="font-family:var(--font-heading); margin-bottom:0.5rem; color:#fff;">🧶 ${isAr ? 'بوابة المسؤول' : 'Artisan Login'}</h2>
          <p style="opacity:0.7; font-size:0.85rem; margin-bottom:2rem;">${isAr ? 'الوصول إلى لوحة إدارة كروشيه يدوي' : 'Log in to manage crochet inventory & custom requests.'}</p>
          
          <form id="admin-login-form" style="display:flex; flex-direction:column; gap:1.25rem; text-align:start;">
            <div class="form-group">
              <label>${this.t('username')}</label>
              <input type="text" id="login-user" required style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.15);">
            </div>
            <div class="form-group">
              <label>${this.t('password')}</label>
              <input type="password" id="login-pass" required style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.15);">
            </div>
            <div id="login-error-box" style="color:#ef4444; font-size:0.85rem; font-weight:700; display:none;"></div>
            <button type="submit" class="btn-primary" style="padding:0.75rem; justify-content:center; font-weight:700; background:var(--primary-color); border:none; border-radius:30px; cursor:pointer;">
              ${this.t('login')}
            </button>
          </form>
        </div>
      </div>
    `;

    const form = this.container.querySelector('#admin-login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = form.querySelector('#login-user').value.trim();
      const pass = form.querySelector('#login-pass').value.trim();
      const errorBox = form.querySelector('#login-error-box');

      if (store.loginAdmin(user, pass)) {
        this.render();
      } else {
        errorBox.innerText = isAr ? "اسم المستخدم أو كلمة المرور غير صالحة." : "Invalid username or password.";
        errorBox.style.display = 'block';
      }
    });
  }

  renderTabContent() {
    switch (this.activeTab) {
      case 'dashboard': return this.renderDashboardTab();
      case 'products': return this.renderProductsTab();
      case 'categories': return this.renderCategoriesTab();
      case 'coupons': return this.renderCouponsTab();
      case 'custom': return this.renderCustomTab();
      case 'orders': return this.renderOrdersTab();
      case 'customizer': return this.renderCustomizerTab();
      default: return '';
    }
  }

  // Analytics Dashboard Overview
  renderDashboardTab() {
    const isAr = this.isAr();
    const orders = store.getOrders();
    const products = store.getProducts();
    const custom = store.getCustomOrders();

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const pendingCustoms = custom.filter(o => o.status === 'review').length;

    return `
      <div class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-icon revenue">💵</div>
          <div class="stat-info">
            <span class="stat-value">${this.formatPrice(totalRevenue)}</span>
            <span class="stat-label">${this.t('sales')}</span>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon orders">🧶</div>
          <div class="stat-info">
            <span class="stat-value">${totalOrders}</span>
            <span class="stat-label">${this.t('orders_cnt')}</span>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon" style="background:rgba(249,115,22,0.1); color:var(--primary-color);">📋</div>
          <div class="stat-info">
            <span class="stat-value">${pendingCustoms}</span>
            <span class="stat-label">${this.t('custom_cnt')}</span>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr; gap:2rem; margin-bottom: 2rem; text-align:start;">
        <div class="glass-panel" style="padding:1.5rem; border-radius:12px;">
          <h3>${isAr ? 'منحنى أداء المبيعات والأرباح' : 'Sales Analytics Trend'}</h3>
          <div style="width:100%; display:flex; align-items:center; justify-content:center; margin-top:1.5rem;">
            <svg viewBox="0 0 500 100" style="width:100%; max-height:150px;">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M 0 90 L 80 75 L 160 85 L 240 40 L 320 55 L 400 25 L 500 10 L 500 90 Z" fill="url(#chartGrad)"/>
              <path d="M 0 90 L 80 75 L 160 85 L 240 40 L 320 55 L 400 25 L 500 10" fill="none" stroke="var(--primary-color)" stroke-width="3"/>
            </svg>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:2rem; text-align:start;">
        <div class="glass-panel" style="padding:1.5rem; border-radius:12px;">
          <h3 style="margin-bottom:1rem;">${isAr ? 'المنتجات المميزة الأكثر مبيعاً' : 'Best Selling Crochet'}</h3>
          <table class="admin-table">
            <thead>
              <tr>
                <th>${isAr ? 'المنتج' : 'Product'}</th>
                <th>${isAr ? 'السعر' : 'Price'}</th>
                <th>${isAr ? 'الفئة' : 'Category'}</th>
              </tr>
            </thead>
            <tbody>
              ${products.slice(0, 3).map(p => `
                <tr>
                  <td><strong>${isAr ? p.nameAr : p.nameEn}</strong></td>
                  <td>${this.formatPrice(p.price)}</td>
                  <td>${isAr ? p.categoryAr : p.category}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="glass-panel" style="padding:1.5rem; border-radius:12px;">
          <h3 style="margin-bottom:1rem; color:#ef4444;">🚨 ${isAr ? 'تنبيهات نقص مخزون خيوط الصوف' : 'Low Inventory Warnings'}</h3>
          <table class="admin-table">
            <thead>
              <tr>
                <th>${isAr ? 'المنتج' : 'Product'}</th>
                <th>${isAr ? 'المخزون المتوفر' : 'Stock left'}</th>
              </tr>
            </thead>
            <tbody>
              ${products.filter(p => p.inventory <= 5).map(p => `
                <tr>
                  <td>${isAr ? p.nameAr : p.nameEn}</td>
                  <td style="color:#ef4444; font-weight:700;">${p.inventory} ${isAr ? 'قطع متبقية' : 'pieces left'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Products Tab
  renderProductsTab() {
    const isAr = this.isAr();
    const products = store.getProducts();
    let filtered = products;

    if (this.productSearch.trim()) {
      const q = this.productSearch.toLowerCase();
      filtered = filtered.filter(p => p.nameEn.toLowerCase().includes(q) || p.nameAr.includes(q));
    }

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; gap:1rem; flex-wrap:wrap;">
        <input type="text" id="admin-prod-search" placeholder="${isAr ? 'ابحث عن منتج...' : 'Search products...'}" value="${this.productSearch}" style="background:#fff; border:1px solid var(--border-color); border-radius:8px; padding:0.5rem 1rem; color:var(--text-color); max-width:300px; width:100%;">
        <button class="btn-luxury" id="open-add-prod-modal">➕ ${this.t('add_product')}</button>
      </div>

      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>${isAr ? 'صورة' : 'Image'}</th>
              <th>${isAr ? 'الاسم' : 'Name'}</th>
              <th>${isAr ? 'الفئة' : 'Category'}</th>
              <th>${isAr ? 'السعر' : 'Price'}</th>
              <th>${isAr ? 'المخزون' : 'Stock'}</th>
              <th>${isAr ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => `
              <tr>
                <td><img class="admin-table-img" src="${p.image}" alt=""></td>
                <td><strong>${isAr ? p.nameAr : p.nameEn}</strong></td>
                <td>${isAr ? p.categoryAr : p.category}</td>
                <td>${this.formatPrice(p.price)}</td>
                <td><span class="${p.inventory <= 3 ? 'text-danger' : 'text-success'}" style="font-weight:700;">${p.inventory}</span></td>
                <td>
                  <div class="admin-actions-cell">
                    <button class="btn-secondary edit-product-btn" data-id="${p.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">✏️ ${isAr ? 'تعديل' : 'Edit'}</button>
                    <button class="btn-danger delete-product-btn" data-id="${p.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">🗑️ ${isAr ? 'حذف' : 'Delete'}</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Categories Tab
  renderCategoriesTab() {
    const isAr = this.isAr();
    const categories = store.getCategories();
    return `
      <div style="display:grid; grid-template-columns:1fr; gap:2rem; text-align:start;">
        <div class="glass-panel" style="padding:2rem; border-radius:12px; max-width:480px;">
          <h3 style="margin-bottom:1rem;">${isAr ? 'إضافة فئة جديدة' : 'Add New Category'}</h3>
          <form id="add-category-form" style="display:flex; gap:1rem;">
            <input type="text" id="new-category-name" placeholder="e.g. Blankets" required style="flex:1; border:1px solid var(--border-color); border-radius:8px; padding:0.5rem; background:#fff;">
            <button type="submit" class="btn-luxury">${isAr ? 'إضافة' : 'Add'}</button>
          </form>
        </div>

        <div class="glass-panel" style="padding:2rem; border-radius:12px;">
          <h3 style="margin-bottom:1.5rem;">${isAr ? 'التصنيفات المتاحة حالياً' : 'All Categories'}</h3>
          <table class="admin-table">
            <thead>
              <tr>
                <th>${isAr ? 'اسم الفئة' : 'Category Name'}</th>
                <th>${isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map(cat => `
                <tr>
                  <td><strong>${cat}</strong></td>
                  <td>
                    <button class="btn-danger delete-category-btn" data-cat="${cat}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">🗑️ ${isAr ? 'حذف' : 'Delete'}</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Coupons Tab
  renderCouponsTab() {
    const isAr = this.isAr();
    const coupons = store.getCoupons();
    let filtered = coupons;

    if (this.couponSearch.trim()) {
      const q = this.couponSearch.toLowerCase();
      filtered = filtered.filter(c => c.code.toLowerCase().includes(q));
    }

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; gap:1rem; flex-wrap:wrap;">
        <input type="text" id="admin-coupon-search" placeholder="${isAr ? 'ابحث عن كوبون...' : 'Search coupons...'}" value="${this.couponSearch}" style="background:#fff; border:1px solid var(--border-color); border-radius:8px; padding:0.5rem 1rem; color:var(--text-color); max-width:300px; width:100%;">
        <button class="btn-luxury" id="open-add-coupon-modal">➕ ${this.t('create_coupon')}</button>
      </div>

      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>${isAr ? 'الكود' : 'Code'}</th>
              <th>${isAr ? 'النوع' : 'Type'}</th>
              <th>${isAr ? 'قيمة الخصم' : 'Discount Value'}</th>
              <th>${isAr ? 'الاستخدام' : 'Usage'}</th>
              <th>${isAr ? 'الحالة' : 'Status'}</th>
              <th>${isAr ? 'العوائد' : 'Revenue'}</th>
              <th>${isAr ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(c => `
              <tr>
                <td><strong>${c.code}</strong></td>
                <td style="font-size:0.85rem; text-transform:uppercase; opacity:0.75;">${c.type}</td>
                <td>${c.type === 'percentage' ? `${c.value}%` : this.formatPrice(c.value)}</td>
                <td>${c.usageCount} / ${c.usageLimit || '∞'}</td>
                <td><span class="status-badge ${c.enabled ? 'active' : 'disabled'}">${c.enabled ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Disabled')}</span></td>
                <td class="text-success" style="font-weight:700;">${this.formatPrice(c.revenueGenerated || 0)}</td>
                <td>
                  <div class="admin-actions-cell">
                    <button class="btn-secondary edit-coupon-btn" data-code="${c.code}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">✏️</button>
                    <button class="btn-secondary duplicate-coupon-btn" data-code="${c.code}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">👥</button>
                    <button class="btn-danger delete-coupon-btn" data-code="${c.code}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Custom requests approvals
  renderCustomTab() {
    const isAr = this.isAr();
    const orders = store.getCustomOrders();

    return `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>${isAr ? 'العميل' : 'Client'}</th>
              <th>${isAr ? 'التفاصيل المطلوبة' : 'Details'}</th>
              <th>${isAr ? 'المقاس / الألوان' : 'Size / Colors'}</th>
              <th>${isAr ? 'الميزانية المقترحة' : 'Budget'}</th>
              <th>${isAr ? 'تاريخ التسليم' : 'Due Date'}</th>
              <th>${isAr ? 'حالة الطلب' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>
                  <strong>${o.name}</strong>
                  <div style="font-size:0.75rem; color:var(--text-color); opacity:0.6;">${o.email}</div>
                </td>
                <td style="font-size:0.85rem; max-width:250px; white-space:normal; line-height:1.4;">${o.details}</td>
                <td>
                  <div>Size: ${o.size}</div>
                  <div style="font-size:0.75rem; opacity:0.8;">Colors: ${o.colors}</div>
                </td>
                <td style="font-weight:700; color:var(--primary-color);">${this.formatPrice(o.budget)}</td>
                <td style="font-size:0.85rem;">${new Date(o.deliveryDate).toLocaleDateString()}</td>
                <td>
                  <select class="change-custom-order-status" data-id="${o.id}" style="background:#fff; border:1px solid var(--border-color); border-radius:4px; padding:0.2rem; font-family:inherit;">
                    <option value="review" ${o.status === 'review' ? 'selected' : ''}>Review</option>
                    <option value="accepted" ${o.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                    <option value="in-progress" ${o.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                  </select>
                </td>
              </tr>
            `).join('')}
            ${orders.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align:center; padding:3rem; opacity:0.6;">${isAr ? 'لا توجد طلبات حياكة خاصة مخصصة مسجلة حالياً.' : 'No custom stitching requests found.'}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;
  }

  // Sales History Tab
  renderOrdersTab() {
    const isAr = this.isAr();
    const orders = store.getOrders();
    const customers = store.getCustomers();

    return `
      <div style="display:flex; flex-direction:column; gap:3rem; text-align:start;">
        <div>
          <h3>${isAr ? 'سجل عمليات الشراء والطلبات' : 'Sales History Log'}</h3>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>${isAr ? 'رقم الطلب' : 'Order ID'}</th>
                  <th>${isAr ? 'العميل' : 'Customer'}</th>
                  <th>${isAr ? 'المحتويات' : 'Items'}</th>
                  <th>${isAr ? 'الإجمالي المدفوع' : 'Total'}</th>
                  <th>${isAr ? 'التغليف كهدية' : 'Wrap'}</th>
                  <th>${isAr ? 'الشهادة' : 'Cert'}</th>
                  <th>${isAr ? 'حالة الطلب' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(o => `
                  <tr>
                    <td><strong>${o.id}</strong></td>
                    <td>
                      <div><strong>${o.customerName}</strong></div>
                      <div style="font-size:0.75rem; color:var(--text-color); opacity:0.6;">${o.email}</div>
                    </td>
                    <td style="font-size:0.85rem; line-height:1.4;">
                      ${o.items.map(it => `• ${isAr ? it.nameAr : it.nameEn} (x${it.quantity})`).join('<br>')}
                    </td>
                    <td style="font-weight:700; color:var(--primary-color);">${this.formatPrice(o.total)}</td>
                    <td>${o.giftWrapActive ? '🎁 Gift Wrapped' : 'Standard'}</td>
                    <td>${o.includeCertificate ? '📜 Included' : 'No'}</td>
                    <td>
                      <select class="change-order-status" data-id="${o.id}" style="background:#fff; border:1px solid var(--border-color); border-radius:4px; padding:0.2rem; font-family:inherit;">
                        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                      </select>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3>${isAr ? 'دليل العملاء ونقاط الولاء والمكافآت' : 'Customer Loyalty Directory'}</h3>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>${isAr ? 'اسم العميل' : 'Customer Name'}</th>
                  <th>${isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th>${isAr ? 'عدد الطلبات' : 'Orders Count'}</th>
                  <th>${isAr ? 'إجمالي المشتريات' : 'Total Spent'}</th>
                  <th>${isAr ? 'نقاط الولاء المكتسبة' : 'Loyalty Points'}</th>
                </tr>
              </thead>
              <tbody>
                ${customers.map(c => `
                  <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.email}</td>
                    <td>${c.ordersCount}</td>
                    <td class="text-success" style="font-weight:700;">${this.formatPrice(c.totalSpent)}</td>
                    <td style="font-weight:700; color:var(--primary-color);">${150 + Math.floor(c.totalSpent * 0.1)} Points</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // Visual Customizer Tab (Shopify split view)
  renderCustomizerTab() {
    const isAr = this.isAr();
    const settings = store.getSettings(true); // Load draft configurations

    return `
      <div style="display:flex; flex-direction:column; height:calc(100vh - var(--header-height)); background:#181512; color:#f5efe6;">
        <!-- Visual customizer controls bar -->
        <div style="background:#110e0c; border-bottom:1px solid rgba(255,255,255,0.05); padding:0.6rem 2rem; display:flex; justify-content:space-between; align-items:center;">
          <!-- Undo Redo actions -->
          <div style="display:flex; gap:0.5rem;">
            <button class="btn-secondary" id="editor-undo-btn" style="padding:0.3rem 0.8rem; font-size:0.8rem; background:rgba(255,255,255,0.05); color:#fff; border:none;">↩️ ${isAr ? 'تراجع' : 'Undo'}</button>
            <button class="btn-secondary" id="editor-redo-btn" style="padding:0.3rem 0.8rem; font-size:0.8rem; background:rgba(255,255,255,0.05); color:#fff; border:none;">↪️ ${isAr ? 'إعادة' : 'Redo'}</button>
          </div>

          <!-- Viewport Mode selector -->
          <div style="display:flex; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.25rem; border-radius:30px;">
            <button class="viewport-toggle-btn ${this.viewportMode === 'desktop' ? 'active' : ''}" data-mode="desktop" style="padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:#fff; background:none; border:none; cursor:pointer;">🖥️</button>
            <button class="viewport-toggle-btn ${this.viewportMode === 'tablet' ? 'active' : ''}" data-mode="tablet" style="padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:#fff; background:none; border:none; cursor:pointer;">📁</button>
            <button class="viewport-toggle-btn ${this.viewportMode === 'mobile' ? 'active' : ''}" data-mode="mobile" style="padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:#fff; background:none; border:none; cursor:pointer;">📱</button>
          </div>

          <!-- Publish toggler -->
          <button class="btn-luxury" id="editor-publish-btn" style="padding:0.4rem 1.2rem; font-size:0.8rem; background:var(--accent-color);">
            🚀 ${isAr ? 'نشر التعديلات الحالية' : 'Publish Changes'}
          </button>
        </div>

        <div class="live-editor-layout">
          <!-- Left settings parameters -->
          <aside class="editor-sidebar" style="background:#201c18; border-right:1px solid rgba(255,255,255,0.08);">
            <div class="editor-sidebar-content">
              <!-- 1. Theme style & fonts -->
              <div class="editor-section open" data-section="theme">
                <div class="editor-section-header">
                  <span>🎨 ${isAr ? 'الألوان والهوية البصرية' : 'Brand Customizer'}</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body" style="text-align:start;">
                  <div class="form-group">
                    <label>Store Name Title</label>
                    <input type="text" id="edit-store-name" value="${settings.name}" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.15);">
                  </div>
                  <div class="form-group">
                    <label>WhatsApp Number</label>
                    <input type="text" id="edit-whatsapp" value="${settings.whatsappNumber}" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.15);">
                  </div>

                  <h4 style="font-size:0.8rem; opacity:0.6; margin-top:0.5rem;">Theme Palette Configuration</h4>
                  <div class="color-picker-grid">
                    <div class="color-input-wrapper">
                      <input type="color" id="picker-primary" value="${settings.theme.primaryColor}">
                      <span class="color-label">Terracotta</span>
                    </div>
                    <div class="color-input-wrapper">
                      <input type="color" id="picker-accent" value="${settings.theme.accentColor}">
                      <span class="color-label">Accent</span>
                    </div>
                    <div class="color-input-wrapper">
                      <input type="color" id="picker-bg" value="${settings.theme.bgColor}">
                      <span class="color-label">Cream BG</span>
                    </div>
                    <div class="color-input-wrapper">
                      <input type="color" id="picker-card" value="${settings.theme.cardBgColor}">
                      <span class="color-label">Card BG</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Manual Exchange Rates editing -->
              <div class="editor-section" data-section="rates">
                <div class="editor-section-header">
                  <span>💰 ${isAr ? 'أسعار الصرف والعملات' : 'Exchange Currency Rates'}</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body" style="text-align:start;">
                  <div class="form-group">
                    <label>Saudi Riyal (SAR) Exchange Rate</label>
                    <input type="number" step="0.01" id="edit-rate-sar" value="${settings.exchangeRates.SAR}" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.15);">
                  </div>
                  <div class="form-group">
                    <label>Egyptian Pound (EGP) Exchange Rate</label>
                    <input type="number" step="0.05" id="edit-rate-egp" value="${settings.exchangeRates.EGP}" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.15);">
                  </div>
                </div>
              </div>

              <!-- 3. Drag and Drop / Up Down Section ordering -->
              <div class="editor-section" data-section="ordering">
                <div class="editor-section-header">
                  <span>↕️ ${isAr ? 'ترتيب وتفعيل أقسام الرئيسية' : 'Homepage Section Ordering'}</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body" style="text-align:start;">
                  <p style="font-size:0.75rem; opacity:0.7;">Click arrows to change the layout sequence dynamically.</p>
                  <div style="display:flex; flex-direction:column; gap:0.6rem;" id="editor-sections-ordering-list">
                    ${settings.sectionsOrder.map((sec, idx) => `
                      <div class="glass-panel" style="padding:0.75rem; border-radius:6px; display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);">
                        <strong style="text-transform:capitalize; font-size:0.85rem;">${sec} Section</strong>
                        <div style="display:flex; gap:0.3rem;">
                          <button class="btn-section-order-up" data-index="${idx}" style="background:none; border:none; color:#fff; font-size:0.9rem; cursor:pointer; padding:0.25rem;">▲</button>
                          <button class="btn-section-order-down" data-index="${idx}" style="background:none; border:none; color:#fff; font-size:0.9rem; cursor:pointer; padding:0.25rem;">▼</button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- 4. Shipping Settings -->
              <div class="editor-section" data-section="shipping">
                <div class="editor-section-header">
                  <span>🚚 ${isAr ? 'تكاليف ومصاريف الشحن' : 'Shipping Rates Config'}</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body" style="text-align:start;">
                  <div class="form-group">
                    <label>Base Shipping Cost ($)</label>
                    <input type="number" step="0.1" id="edit-shipping-rate" value="${settings.shippingSettings.baseRate}" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.15);">
                  </div>
                  <div class="form-group">
                    <label>Free Shipping Threshold ($)</label>
                    <input type="number" step="1" id="edit-shipping-threshold" value="${settings.shippingSettings.freeShippingThreshold}" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.15);">
                  </div>
                </div>
              </div>

            </div>
          </aside>

          <!-- Right Live Preview panel -->
          <main class="editor-preview-container" style="background:#181512; flex:1; display:flex; flex-direction:column;">
            <div class="preview-iframe-wrapper" style="flex:1;">
              <div id="preview-viewport-box" class="preview-viewport" style="width:100%; transition: width 0.3s ease; height:100%; background:var(--bg-color);">
                <div id="preview-storefront-mount"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    `;
  }

  mountCustomizerPreview() {
    if (this.customizerStorefront) this.customizerStorefront.destroy();
    // Instantiate storefront pointing to preview element
    this.customizerStorefront = new Storefront('preview-storefront-mount');
  }

  updateCustomizerPreview() {
    if (this.customizerStorefront) {
      this.customizerStorefront.updateTheme();
      this.customizerStorefront.render();
    }
  }

  // Modals Add/Edit Crochet Products
  showProductModal(prodId = null) {
    const isEdit = prodId !== null;
    const overlay = document.getElementById('admin-modal-overlay');
    const container = document.getElementById('admin-modal-container');
    if (!overlay || !container) return;

    const isAr = this.isAr();
    const categories = store.getCategories();
    let p = { nameEn: '', nameAr: '', price: 0, category: categories[0] || '', categoryAr: 'كروشيه', descriptionEn: '', descriptionAr: '', image: '', inventory: 5, materialsEn: '', materialsAr: '', processEn: '', processAr: '' };

    if (isEdit) {
      const match = store.getProducts().find(pr => pr.id === prodId);
      p = match ? { ...match } : p;
    }

    container.innerHTML = `
      <button class="modal-close" id="close-admin-modal">✕</button>
      <h2 style="font-family:var(--font-heading); margin-bottom:1.5rem; text-align:start;">${isEdit ? (isAr ? 'تعديل منتج كروشيه' : 'Edit Product') : (isAr ? 'إضافة منتج صوف جديد' : 'Add New Product')}</h2>

      <form id="admin-product-form" style="display:flex; flex-direction:column; gap:0.8rem; max-height:75vh; overflow-y:auto; text-align:start; padding-inline-end:0.5rem;">
        <div class="checkout-form-grid">
          <div class="form-group">
            <label>Name (English)</label>
            <input type="text" id="ap-nameEn" required value="${p.nameEn}">
          </div>
          <div class="form-group">
            <label>الاسم (العربية)</label>
            <input type="text" id="ap-nameAr" required value="${p.nameAr}">
          </div>
        </div>

        <div class="checkout-form-grid">
          <div class="form-group">
            <label>Price ($ USD base)</label>
            <input type="number" step="0.01" id="ap-price" required value="${p.price}">
          </div>
          <div class="form-group">
            <label>Inventory Stock</label>
            <input type="number" id="ap-inventory" required value="${p.inventory}">
          </div>
        </div>

        <div class="checkout-form-grid">
          <div class="form-group">
            <label>Category (English)</label>
            <select id="ap-category" style="background:#fff; border:1px solid var(--border-color); padding:0.6rem; border-radius:8px;">
              ${categories.map(c => `<option value="${c}" ${p.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>التصنيف (العربية)</label>
            <input type="text" id="ap-categoryAr" required value="${p.categoryAr}">
          </div>
        </div>

        <div class="form-group">
          <label>Image Source</label>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <input type="text" id="ap-image-url" placeholder="Paste Image URL" value="${p.image}">
            <input type="file" id="ap-image-file" accept="image/*" style="background:rgba(0,0,0,0.02); padding:0.4rem; border-radius:8px; border:1px dashed var(--border-color);">
          </div>
        </div>

        <div class="checkout-form-grid">
          <div class="form-group">
            <label>Materials (English)</label>
            <input type="text" id="ap-materialsEn" value="${p.materialsEn}">
          </div>
          <div class="form-group">
            <label>المواد المستخدمة (العربية)</label>
            <input type="text" id="ap-materialsAr" value="${p.materialsAr}">
          </div>
        </div>

        <div class="checkout-form-grid">
          <div class="form-group">
            <label>Stitching Process (English)</label>
            <input type="text" id="ap-processEn" value="${p.processEn}">
          </div>
          <div class="form-group">
            <label>عملية الحياكة (العربية)</label>
            <input type="text" id="ap-processAr" value="${p.processAr}">
          </div>
        </div>

        <div class="form-group">
          <label>Description (English)</label>
          <textarea id="ap-descEn" rows="2" required>${p.descriptionEn}</textarea>
        </div>
        <div class="form-group">
          <label>الوصف (العربية)</label>
          <textarea id="ap-descAr" rows="2" required>${p.descriptionAr}</textarea>
        </div>

        <button type="submit" class="btn-primary mt-4" style="justify-content:center; padding:0.8rem; font-weight:700;">
          Save Product Details
        </button>
      </form>
    `;

    const form = container.querySelector('#admin-product-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameEn = form.querySelector('#ap-nameEn').value.trim();
      const nameAr = form.querySelector('#ap-nameAr').value.trim();
      const price = parseFloat(form.querySelector('#ap-price').value);
      const inventory = parseInt(form.querySelector('#ap-inventory').value);
      const category = form.querySelector('#ap-category').value;
      const categoryAr = form.querySelector('#ap-categoryAr').value.trim();
      const materialsEn = form.querySelector('#ap-materialsEn').value.trim();
      const materialsAr = form.querySelector('#ap-materialsAr').value.trim();
      const processEn = form.querySelector('#ap-processEn').value.trim();
      const processAr = form.querySelector('#ap-processAr').value.trim();
      const descriptionEn = form.querySelector('#ap-descEn').value.trim();
      const descriptionAr = form.querySelector('#ap-descAr').value.trim();
      let image = form.querySelector('#ap-image-url').value.trim();

      const save = (finalImg) => {
        const data = { nameEn, nameAr, price, inventory, category, categoryAr, materialsEn, materialsAr, processEn, processAr, descriptionEn, descriptionAr, image: finalImg };
        if (isEdit) {
          store.updateProduct(prodId, data);
        } else {
          store.addProduct(data);
        }
        overlay.classList.remove('active');
        this.render();
      };

      const fileInput = form.querySelector('#ap-image-file');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => save(ev.target.result);
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        save(image);
      }
    });

    container.querySelector('#close-admin-modal').addEventListener('click', () => overlay.classList.remove('active'));
    overlay.classList.add('active');
  }

  // Add/Edit Coupons modal sheet
  showCouponModal(couponCode = null, isDuplicate = false) {
    const isEdit = couponCode !== null && !isDuplicate;
    const overlay = document.getElementById('admin-modal-overlay');
    const container = document.getElementById('admin-modal-container');
    if (!overlay || !container) return;

    let c = { code: '', type: 'percentage', value: 0, minPurchase: 0, maxDiscount: 0, usageLimit: 0, enabled: true };

    if (couponCode) {
      const match = store.getCoupons().find(co => co.code.toLowerCase() === couponCode.toLowerCase());
      if (match) {
        c = { ...match };
        if (isDuplicate) {
          c.code = `${c.code}-COPY`;
          c.usageCount = 0;
          c.revenueGenerated = 0;
        }
      }
    }

    container.innerHTML = `
      <button class="modal-close" id="close-admin-modal">✕</button>
      <h2 style="font-family:var(--font-heading); margin-bottom:1.5rem; text-align:start;">${isEdit ? 'Edit Coupon' : 'Create Coupon'}</h2>

      <form id="admin-coupon-form" style="display:flex; flex-direction:column; gap:1rem; text-align:start;">
        <div class="form-group">
          <label>Coupon Promotional Code</label>
          <input type="text" id="ac-code" required placeholder="e.g. WOOL50" value="${c.code}">
        </div>

        <div class="checkout-form-grid">
          <div class="form-group">
            <label>Discount Type</label>
            <select id="ac-type" style="background:#fff; border:1px solid var(--border-color); padding:0.6rem; border-radius:8px;">
              <option value="percentage" ${c.type === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
              <option value="fixed" ${c.type === 'fixed' ? 'selected' : ''}>Fixed Amount ($ USD)</option>
              <option value="free_shipping" ${c.type === 'free_shipping' ? 'selected' : ''}>Free Shipping</option>
            </select>
          </div>
          <div class="form-group">
            <label>Discount Value</label>
            <input type="number" id="ac-value" value="${c.value}">
          </div>
        </div>

        <div class="checkout-form-grid">
          <div class="form-group">
            <label>Min Purchase Threshold ($)</label>
            <input type="number" id="ac-min" value="${c.minPurchase}">
          </div>
          <div class="form-group">
            <label>Max Discount Cap ($)</label>
            <input type="number" id="ac-max" value="${c.maxDiscount}">
          </div>
        </div>

        <div class="form-group">
          <label>Usage Limit (Total times code can be used)</label>
          <input type="number" id="ac-limit" value="${c.usageLimit}">
        </div>

        <button type="submit" class="btn-primary mt-4" style="justify-content:center; padding:0.8rem; font-weight:700;">
          Save Promo Coupon
        </button>
      </form>
    `;

    const form = container.querySelector('#admin-coupon-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const code = form.querySelector('#ac-code').value.trim().toUpperCase();
      const type = form.querySelector('#ac-type').value;
      const value = parseFloat(form.querySelector('#ac-value').value || '0');
      const minPurchase = parseFloat(form.querySelector('#ac-min').value || '0');
      const maxDiscount = parseFloat(form.querySelector('#ac-max').value || '0');
      const usageLimit = parseInt(form.querySelector('#ac-limit').value || '0');

      const data = { code, type, value, minPurchase, maxDiscount, usageLimit, enabled: c.enabled, usageCount: c.usageCount || 0, revenueGenerated: c.revenueGenerated || 0 };

      if (isEdit) {
        store.updateCoupon(couponCode, data);
      } else {
        store.addCoupon(data);
      }
      overlay.classList.remove('active');
      this.render();
    });

    container.querySelector('#close-admin-modal').addEventListener('click', () => overlay.classList.remove('active'));
    overlay.classList.add('active');
  }

  bindEvents() {
    const isAr = this.isAr();

    // Tab buttons switching
    this.container.querySelectorAll('.admin-menu-item').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      if (tab) {
        btn.addEventListener('click', () => {
          this.activeTab = tab;
          this.render();
        });
      }
    });

    // Language switcher
    const langSelect = document.getElementById('admin-lang-switch-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const nextLang = e.target.value;
        localStorage.setItem('active_language', nextLang);
        store.setData('active_language', nextLang);
      });
    }

    // Logout
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        store.logoutAdmin();
        this.render();
      });
    }

    if (this.activeTab === 'products') {
      const search = document.getElementById('admin-prod-search');
      if (search) {
        search.addEventListener('input', (e) => {
          this.productSearch = e.target.value;
          this.renderFilteredProductsGrid();
        });
      }

      document.getElementById('open-add-prod-modal').addEventListener('click', () => this.showProductModal());
      this.bindProductsTableActions();

    } else if (this.activeTab === 'categories') {
      const form = document.getElementById('add-category-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('new-category-name').value.trim();
          store.addCategory(name);
          this.render();
        });
      }
      this.container.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const cat = btn.getAttribute('data-cat');
          if (confirm(isAr ? `هل تريد بالتأكيد حذف الفئة "${cat}"؟` : `Delete category "${cat}"?`)) {
            store.deleteCategory(cat);
            this.render();
          }
        });
      });

    } else if (this.activeTab === 'coupons') {
      const search = document.getElementById('admin-coupon-search');
      if (search) {
        search.addEventListener('input', (e) => {
          this.couponSearch = e.target.value;
          this.renderFilteredCouponsGrid();
        });
      }
      document.getElementById('open-add-coupon-modal').addEventListener('click', () => this.showCouponModal());
      this.bindCouponsTableActions();

    } else if (this.activeTab === 'custom') {
      this.container.querySelectorAll('.change-custom-order-status').forEach(sel => {
        sel.addEventListener('change', () => {
          const id = sel.getAttribute('data-id');
          const status = sel.value;
          store.updateCustomOrderStatus(id, status);
          alert(isAr ? `تم تحديث حالة طلب التفصيل ${id} إلى ${status}.` : `Status of custom request ${id} updated to ${status}.`);
        });
      });

    } else if (this.activeTab === 'orders') {
      this.container.querySelectorAll('.change-order-status').forEach(sel => {
        sel.addEventListener('change', () => {
          const id = sel.getAttribute('data-id');
          const status = sel.value;
          const list = store.getOrders();
          const idx = list.findIndex(o => o.id === id);
          if (idx !== -1) {
            list[idx].status = status;
            store.setData('orders', list);
            alert(isAr ? `تم تحديث حالة شحن الطلب ${id} إلى ${status}.` : `Order status ${id} updated to ${status}.`);
          }
        });
      });

    } else if (this.activeTab === 'customizer') {
      // Visual customizer binds
      const bindEditorInput = (id, path, type = 'text') => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', (e) => {
            const val = type === 'number' ? parseFloat(e.target.value) : e.target.value;
            store.updateSettingsField(path, val);
          });
        }
      };

      bindEditorInput('edit-store-name', 'name');
      bindEditorInput('edit-whatsapp', 'whatsappNumber');
      bindEditorInput('picker-primary', 'theme.primaryColor');
      bindEditorInput('picker-accent', 'theme.accentColor');
      bindEditorInput('picker-bg', 'theme.bgColor');
      bindEditorInput('picker-card', 'theme.cardBgColor');
      
      bindEditorInput('edit-rate-sar', 'exchangeRates.SAR', 'number');
      bindEditorInput('edit-rate-egp', 'exchangeRates.EGP', 'number');
      bindEditorInput('edit-shipping-rate', 'shippingSettings.baseRate', 'number');
      bindEditorInput('edit-shipping-threshold', 'shippingSettings.freeShippingThreshold', 'number');

      // Reordering homepage sections Up/Down buttons
      const listOrder = document.getElementById('editor-sections-ordering-list');
      if (listOrder) {
        listOrder.addEventListener('click', (e) => {
          const up = e.target.closest('.btn-section-order-up');
          const down = e.target.closest('.btn-section-order-down');
          if (!up && !down) return;

          const idx = parseInt((up || down).getAttribute('data-index'));
          const settings = store.getSettings(true);
          const sections = settings.sectionsOrder;

          if (up && idx > 0) {
            // Swap with previous
            const temp = sections[idx];
            sections[idx] = sections[idx - 1];
            sections[idx - 1] = temp;
          } else if (down && idx < sections.length - 1) {
            // Swap with next
            const temp = sections[idx];
            sections[idx] = sections[idx + 1];
            sections[idx + 1] = temp;
          }

          store.updateSettingsField('sectionsOrder', sections);
          this.render(); // Redraw customizer inputs
        });
      }

      // Viewport mode switchers
      const viewBtns = this.container.querySelectorAll('.viewport-toggle-btn');
      const viewportBox = document.getElementById('preview-viewport-box');
      viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          viewBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.viewportMode = btn.getAttribute('data-mode');

          if (this.viewportMode === 'desktop') {
            viewportBox.style.width = '100%';
          } else if (this.viewportMode === 'tablet') {
            viewportBox.style.width = '768px';
          } else if (this.viewportMode === 'mobile') {
            viewportBox.style.width = '390px';
          }
        });
      });

      // Undo Redo publish buttons
      const undoBtn = document.getElementById('editor-undo-btn');
      if (undoBtn) {
        undoBtn.addEventListener('click', () => {
          if (store.undo()) {
            this.render(); // Redraw panel inputs
            alert(isAr ? 'تم التراجع عن الخطوة السابقة' : 'Previous change undone.');
          } else {
            alert(isAr ? 'لا يوجد شيء للتراجع عنه' : 'Nothing to undo.');
          }
        });
      }

      const redoBtn = document.getElementById('editor-redo-btn');
      if (redoBtn) {
        redoBtn.addEventListener('click', () => {
          if (store.redo()) {
            this.render();
            alert(isAr ? 'تمت إعادة الخطوة' : 'Change redone.');
          } else {
            alert(isAr ? 'لا يوجد شيء لإعادته' : 'Nothing to redo.');
          }
        });
      }

      const publishBtn = document.getElementById('editor-publish-btn');
      if (publishBtn) {
        publishBtn.addEventListener('click', () => {
          store.publishChanges();
          alert(isAr ? '🎉 تم نشر جميع التعديلات بنجاح على المتجر المباشر!' : '🎉 All visual edits published successfully to live storefront!');
        });
      }
    }
  }

  bindProductsTableActions() {
    this.container.querySelectorAll('.edit-product-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showProductModal(btn.getAttribute('data-id')));
    });
    this.container.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm(this.isAr() ? 'هل تريد حذف هذا المنتج نهائياً؟' : 'Delete this product permanently?')) {
          store.deleteProduct(id);
          this.render();
        }
      });
    });
  }

  bindCouponsTableActions() {
    this.container.querySelectorAll('.edit-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showCouponModal(btn.getAttribute('data-code')));
    });
    this.container.querySelectorAll('.duplicate-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showCouponModal(btn.getAttribute('data-code'), true));
    });
    this.container.querySelectorAll('.delete-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        if (confirm(this.isAr() ? 'حذف كوبون الخصم هذا؟' : 'Delete this coupon?')) {
          store.deleteCoupon(code);
          this.render();
        }
      });
    });
  }

  renderFilteredProductsGrid() {
    const isAr = this.isAr();
    const products = store.getProducts();
    let filtered = products;

    if (this.productSearch.trim()) {
      const q = this.productSearch.toLowerCase();
      filtered = filtered.filter(p => p.nameEn.toLowerCase().includes(q) || p.nameAr.includes(q));
    }

    const tbody = this.container.querySelector('.admin-table tbody');
    if (tbody) {
      tbody.innerHTML = filtered.map(p => `
        <tr>
          <td><img class="admin-table-img" src="${p.image}" alt=""></td>
          <td><strong>${isAr ? p.nameAr : p.nameEn}</strong></td>
          <td>${isAr ? p.categoryAr : p.category}</td>
          <td>${this.formatPrice(p.price)}</td>
          <td><span class="${p.inventory <= 3 ? 'text-danger' : 'text-success'}" style="font-weight:700;">${p.inventory}</span></td>
          <td>
            <div class="admin-actions-cell">
              <button class="btn-secondary edit-product-btn" data-id="${p.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">✏️ ${isAr ? 'تعديل' : 'Edit'}</button>
              <button class="btn-danger delete-product-btn" data-id="${p.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">🗑️ ${isAr ? 'حذف' : 'Delete'}</button>
            </div>
          </td>
        </tr>
      `).join('');
      this.bindProductsTableActions();
    }
  }

  renderFilteredCouponsGrid() {
    const isAr = this.isAr();
    const coupons = store.getCoupons();
    let filtered = coupons;

    if (this.couponSearch.trim()) {
      const q = this.couponSearch.toLowerCase();
      filtered = filtered.filter(c => c.code.toLowerCase().includes(q));
    }

    const tbody = this.container.querySelector('.admin-table tbody');
    if (tbody) {
      tbody.innerHTML = filtered.map(c => `
        <tr>
          <td><strong>${c.code}</strong></td>
          <td style="font-size:0.85rem; text-transform:uppercase; opacity:0.75;">${c.type}</td>
          <td>${c.type === 'percentage' ? `${c.value}%` : this.formatPrice(c.value)}</td>
          <td>${c.usageCount} / ${c.usageLimit || '∞'}</td>
          <td><span class="status-badge ${c.enabled ? 'active' : 'disabled'}">${c.enabled ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Disabled')}</span></td>
          <td class="text-success" style="font-weight:700;">${this.formatPrice(c.revenueGenerated || 0)}</td>
          <td>
            <div class="admin-actions-cell">
              <button class="btn-secondary edit-coupon-btn" data-code="${c.code}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">✏️</button>
              <button class="btn-secondary duplicate-coupon-btn" data-code="${c.code}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">👥</button>
              <button class="btn-danger delete-coupon-btn" data-code="${c.code}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
      this.bindCouponsTableActions();
    }
  }
}
export default Admin;
export { Admin };
