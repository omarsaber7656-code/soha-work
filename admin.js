// Admin Dashboard View Controller
import { store } from './store.js';

export class Admin {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeTab = 'dashboard'; // dashboard, products, categories, coupons, orders
    
    // Search/Filters
    this.productSearch = '';
    this.couponSearch = '';
    this.couponFilter = 'all'; // all, active, expired, disabled

    // Modals
    this.modalOpen = false;

    // Listen to changes to keep Admin Dashboard fresh if elements update in store
    this.unsubscribe = store.subscribe((key, val) => {
      if (store.isAdminLoggedIn()) {
        this.render();
      }
    });

    this.init();
  }

  init() {
    this.render();
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  // Routing checks
  render() {
    if (!this.container) return;

    if (!store.isAdminLoggedIn()) {
      this.renderLogin();
      return;
    }

    // Render Admin Shell
    this.container.innerHTML = `
      <div class="admin-layout">
        <!-- Admin Sidebar -->
        <aside class="admin-sidebar">
          <div class="admin-sidebar-header">
            <span style="font-size: 1.5rem; font-weight:800; color: #fff;">SOHA Shop</span>
            <span class="admin-badge-label">ADMIN</span>
          </div>

          <nav class="admin-menu">
            <div class="admin-menu-item ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
              📊 Dashboard
            </div>
            <div class="admin-menu-item ${this.activeTab === 'products' ? 'active' : ''}" data-tab="products">
              📦 Products
            </div>
            <div class="admin-menu-item ${this.activeTab === 'categories' ? 'active' : ''}" data-tab="categories">
              🏷️ Categories
            </div>
            <div class="admin-menu-item ${this.activeTab === 'coupons' ? 'active' : ''}" data-tab="coupons">
              🎟️ Coupons & Discounts
            </div>
            <div class="admin-menu-item ${this.activeTab === 'orders' ? 'active' : ''}" data-tab="orders">
              🛒 Orders & Customers
            </div>
            <a href="#editor" class="admin-menu-item" style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; color: var(--primary-color);">
              🎨 Live Site Editor
            </a>
          </nav>

          <div class="admin-sidebar-footer">
            <div class="admin-user-info">
              <span class="admin-username">soha_work</span>
              <span class="admin-role">Administrator</span>
            </div>
            <button class="admin-logout-btn" id="admin-logout-btn" title="Logout">
              🚪
            </button>
          </div>
        </aside>

        <!-- Admin Main Content -->
        <div class="admin-main-container">
          <header class="admin-topbar">
            <h2>${this.getTabTitle()}</h2>
            <div class="admin-topbar-actions">
              <a href="#" class="btn-secondary" style="padding:0.4rem 1.2rem; font-size:0.85rem;">View Storefront</a>
            </div>
          </header>

          <main class="admin-content" id="admin-tab-content">
            ${this.renderTabContent()}
          </main>
        </div>
      </div>

      <!-- Admin Actions Dialog Modals -->
      <div class="modal-overlay" id="admin-modal-overlay">
        <div class="modal-container glass-panel" style="max-width: 600px; padding: 2.5rem;" id="admin-modal-container">
          <!-- Injected modal form -->
        </div>
      </div>
    `;

    this.bindEvents();
  }

  // Login Page View
  renderLogin() {
    this.container.innerHTML = `
      <div class="admin-login-wrapper">
        <div class="login-card glass-panel">
          <div class="login-header">
            <h2>Admin Login</h2>
            <p>Enter credentials to access the Dashboard</p>
          </div>

          <form id="admin-login-form" style="display:flex; flex-direction:column; gap:1.25rem;">
            <div class="form-group">
              <label for="login-user">Username</label>
              <input type="text" id="login-user" required autocomplete="username">
            </div>
            <div class="form-group">
              <label for="login-pass">Password</label>
              <input type="password" id="login-pass" required autocomplete="current-password">
            </div>
            
            <div id="login-error-box" class="text-danger" style="font-size: 0.85rem; font-weight:600; display:none;"></div>
            
            <button type="submit" class="btn-primary login-btn">Login</button>
          </form>
        </div>
      </div>
    `;

    const form = document.getElementById('admin-login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('login-user').value.trim();
      const pass = document.getElementById('login-pass').value.trim();
      const errorBox = document.getElementById('login-error-box');

      const success = store.loginAdmin(user, pass);
      if (success) {
        this.render();
      } else {
        errorBox.innerText = "Invalid username or password.";
        errorBox.style.display = 'block';
      }
    });
  }

  getTabTitle() {
    const titles = {
      dashboard: 'Dashboard Overview',
      products: 'Inventory Management',
      categories: 'Store Categories',
      coupons: 'Coupons & Live Discounts',
      orders: 'Sales Orders & Customers'
    };
    return titles[this.activeTab] || 'Admin Console';
  }

  // Routing tab display
  renderTabContent() {
    switch (this.activeTab) {
      case 'dashboard':
        return this.renderDashboardTab();
      case 'products':
        return this.renderProductsTab();
      case 'categories':
        return this.renderCategoriesTab();
      case 'coupons':
        return this.renderCouponsTab();
      case 'orders':
        return this.renderOrdersTab();
      default:
        return '';
    }
  }

  // Dashboard Stats Tab
  renderDashboardTab() {
    const orders = store.getOrders();
    const products = store.getProducts();
    const coupons = store.getCoupons();

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderVal = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    
    // Sort coupons by revenue generated
    const sortedCoupons = [...coupons].sort((a,b) => (b.revenueGenerated || 0) - (a.revenueGenerated || 0));

    // Simple custom SVG chart coordinates for mock sales
    const maxSales = Math.max(...orders.slice(0, 6).map(o => o.total), 100);
    const chartWidth = 500;
    const chartHeight = 120;

    return `
      <div class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-icon revenue">💵</div>
          <div class="stat-info">
            <span class="stat-value">$${totalRevenue.toFixed(2)}</span>
            <span class="stat-label">Total Revenue</span>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon orders">🛒</div>
          <div class="stat-info">
            <span class="stat-value">${totalOrders}</span>
            <span class="stat-label">Total Orders</span>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <span class="stat-value">$${avgOrderVal.toFixed(2)}</span>
            <span class="stat-label">Avg Order Value</span>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon coupons">🎫</div>
          <div class="stat-info">
            <span class="stat-value">${coupons.filter(c => c.enabled).length}</span>
            <span class="stat-label">Active Coupons</span>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr; gap:2rem; margin-bottom: 2rem; width:100%;">
        <div class="glass-panel" style="padding: 1.5rem; display:flex; flex-direction:column; gap:1rem;">
          <h3>Sales Performance (Recent orders)</h3>
          <div style="width:100%; display:flex; align-items:center; justify-content:center;">
            <svg viewBox="0 0 ${chartWidth} ${chartHeight}" style="width:100%; max-height: 200px;">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- Grid Lines -->
              <line x1="0" y1="10" x2="${chartWidth}" y2="10" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              <line x1="0" y1="60" x2="${chartWidth}" y2="60" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              <line x1="0" y1="110" x2="${chartWidth}" y2="110" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              
              <!-- Sparkline chart path -->
              <path d="M 0 110 L 50 80 L 120 90 L 190 40 L 260 85 L 340 30 L 420 50 L ${chartWidth} 10 L ${chartWidth} 110 Z" fill="url(#chartGrad)"/>
              <path d="M 0 110 L 50 80 L 120 90 L 190 40 L 260 85 L 340 30 L 420 50 L ${chartWidth} 10" fill="none" stroke="var(--primary-color)" stroke-width="3"/>
            </svg>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:2rem;">
        <div class="glass-panel" style="padding: 1.5rem;">
          <h3 style="margin-bottom:1rem;">Top Performing Coupons</h3>
          <div class="admin-table-container" style="border:none; background:none;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Times Used</th>
                  <th>Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                ${sortedCoupons.slice(0, 5).map(c => `
                  <tr>
                    <td><strong>${c.code}</strong></td>
                    <td>${c.usageCount || 0}</td>
                    <td class="text-success">$${(c.revenueGenerated || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="glass-panel" style="padding: 1.5rem;">
          <h3 style="margin-bottom:1rem;">Low Stock Warning</h3>
          <div class="admin-table-container" style="border:none; background:none;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock left</th>
                </tr>
              </thead>
              <tbody>
                ${products.filter(p => p.inventory <= 5).map(p => `
                  <tr>
                    <td>${p.name}</td>
                    <td>${p.category}</td>
                    <td class="${p.inventory === 0 ? 'text-danger' : 'text-warning'}" style="font-weight:700;">
                      ${p.inventory === 0 ? 'Out of Stock' : `${p.inventory} left`}
                    </td>
                  </tr>
                `).join('')}
                ${products.filter(p => p.inventory <= 5).length === 0 ? `
                  <tr>
                    <td colspan="3" style="text-align:center; color:var(--neutral-gray);">All products have sufficient stock.</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // Products Tab
  renderProductsTab() {
    const products = store.getProducts();
    const categories = store.getCategories();
    
    let filtered = products;
    if (this.productSearch.trim()) {
      const q = this.productSearch.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    return `
      <div class="admin-section-header">
        <div style="display:flex; gap:1rem; flex: 1; max-width:400px;">
          <input type="text" id="admin-prod-search" placeholder="Search products..." value="${this.productSearch}" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); border-radius:8px; padding:0.5rem 1rem; color:#fff;">
        </div>
        <button class="btn-primary" id="open-add-prod-modal">➕ Add New Product</button>
      </div>

      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => `
              <tr>
                <td><img class="admin-table-img" src="${p.image}" alt=""></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>$${p.price.toFixed(2)}</td>
                <td>
                  <span class="${p.inventory <= 0 ? 'text-danger' : (p.inventory <= 5 ? 'text-warning' : 'text-success')}" style="font-weight:600;">
                    ${p.inventory}
                  </span>
                </td>
                <td>
                  <div class="admin-actions-cell">
                    <button class="btn-secondary edit-product-btn" data-product-id="${p.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">✏️ Edit</button>
                    <button class="btn-danger delete-product-btn" data-product-id="${p.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">🗑️ Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Category Tab Builder
  renderCategoriesTab() {
    const categories = store.getCategories();
    return `
      <div style="display:grid; grid-template-columns: 1fr; gap:2rem; width:100%;">
        <div class="glass-panel" style="padding: 2rem; max-width: 500px;">
          <h3 style="margin-bottom:1.5rem;">Add New Category</h3>
          <form id="add-category-form" style="display:flex; gap:1rem;">
            <input type="text" id="new-category-name" placeholder="Category Name" required style="flex:1; background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); border-radius:8px; padding:0.5rem 1rem; color:#fff;">
            <button type="submit" class="btn-primary">Add</button>
          </form>
          <div id="category-error-box" class="text-danger mt-4" style="font-size:0.85rem; font-weight:600; display:none;"></div>
        </div>

        <div class="glass-panel" style="padding: 2rem;">
          <h3 style="margin-bottom:1.5rem;">Manage Existing Categories</h3>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${categories.map(cat => `
                  <tr>
                    <td><strong>${cat}</strong></td>
                    <td>
                      <div class="admin-actions-cell">
                        <button class="btn-secondary rename-category-btn" data-category="${cat}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">✏️ Rename</button>
                        <button class="btn-danger delete-category-btn" data-category="${cat}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // Coupon Configurator
  renderCouponsTab() {
    const coupons = store.getCoupons();
    
    // Filters logic
    let filtered = coupons;
    
    // Search filter
    if (this.couponSearch.trim()) {
      const q = this.couponSearch.toLowerCase();
      filtered = filtered.filter(c => c.code.toLowerCase().includes(q));
    }

    // Status filter
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (this.couponFilter === 'active') {
      filtered = filtered.filter(c => c.enabled && (!c.startDate || todayStr >= c.startDate) && (!c.expirationDate || todayStr <= c.expirationDate));
    } else if (this.couponFilter === 'expired') {
      filtered = filtered.filter(c => c.expirationDate && todayStr > c.expirationDate);
    } else if (this.couponFilter === 'disabled') {
      filtered = filtered.filter(c => !c.enabled);
    }

    return `
      <div class="coupon-grid-tab">
        <!-- Coupon List -->
        <div>
          <div class="admin-section-header">
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
              <input type="text" id="admin-coupon-search" placeholder="Search coupons..." value="${this.couponSearch}" style="background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); border-radius:8px; padding:0.5rem 1rem; color:#fff;">
              <select id="admin-coupon-filter" style="background:#1e293b; border:1px solid var(--glass-border); border-radius:8px; padding:0.5rem 1rem; color:#fff;">
                <option value="all" ${this.couponFilter === 'all' ? 'selected' : ''}>All Coupons</option>
                <option value="active" ${this.couponFilter === 'active' ? 'selected' : ''}>Active</option>
                <option value="expired" ${this.couponFilter === 'expired' ? 'selected' : ''}>Expired</option>
                <option value="disabled" ${this.couponFilter === 'disabled' ? 'selected' : ''}>Disabled</option>
              </select>
            </div>
            <button class="btn-primary" id="open-add-coupon-modal">➕ Create Coupon</button>
          </div>

          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Usage (Used/Limit)</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(c => {
                  let status = 'active';
                  if (!c.enabled) status = 'disabled';
                  else if (c.expirationDate && todayStr > c.expirationDate) status = 'expired';
                  
                  let valDisplay = '-';
                  if (c.type === 'percentage') valDisplay = `${c.value}%`;
                  else if (c.type === 'fixed') valDisplay = `$${c.value.toFixed(2)}`;
                  else if (c.type === 'free_shipping') valDisplay = 'Free Ship';
                  else if (c.type === 'bogo') valDisplay = 'BOGO';

                  return `
                    <tr>
                      <td><strong>${c.code}</strong></td>
                      <td style="font-size:0.85rem; text-transform:uppercase; color:var(--neutral-gray);">${c.type}</td>
                      <td>${valDisplay}</td>
                      <td><span class="status-badge ${status}">${status}</span></td>
                      <td>${c.usageCount || 0} / ${c.usageLimit || '∞'}</td>
                      <td class="text-success">$${(c.revenueGenerated || 0).toFixed(2)}</td>
                      <td>
                        <div class="admin-actions-cell" style="flex-wrap:wrap; gap:0.25rem;">
                          <button class="btn-secondary edit-coupon-btn" data-code="${c.code}" style="padding:0.2rem 0.5rem; font-size:0.75rem;">✏️ Edit</button>
                          <button class="btn-secondary duplicate-coupon-btn" data-code="${c.code}" style="padding:0.2rem 0.5rem; font-size:0.75rem;">👥 Clone</button>
                          <button class="btn-danger delete-coupon-btn" data-code="${c.code}" style="padding:0.2rem 0.5rem; font-size:0.75rem;">🗑️ Delete</button>
                          
                          <label class="switch" style="margin-left:0.5rem;">
                            <input type="checkbox" class="toggle-coupon-status" data-code="${c.code}" ${c.enabled ? 'checked' : ''}>
                            <span class="slider"></span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Automatic Discounts & Newsletter Builder Sidebar -->
        <div style="display:flex; flex-direction:column; gap:2rem;">
          <!-- Auto Discounts Panel -->
          <div class="glass-panel" style="padding: 1.5rem;">
            <h3 style="margin-bottom:1.25rem;">Automatic Store Discounts</h3>
            <form id="auto-discounts-form" style="display:flex; flex-direction:column; gap:1.25rem;">
              
              <!-- Threshold -->
              <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                  <strong>Cart Threshold Discount</strong>
                  <label class="switch">
                    <input type="checkbox" id="auto-threshold-enabled" ${store.getSettings().autoDiscounts.cartThreshold.enabled ? 'checked' : ''}>
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="checkout-form-grid" style="gap:0.75rem;">
                  <div class="form-group">
                    <label>Threshold ($)</label>
                    <input type="number" id="auto-threshold-val" value="${store.getSettings().autoDiscounts.cartThreshold.threshold}">
                  </div>
                  <div class="form-group">
                    <label>Discount (%)</label>
                    <input type="number" id="auto-threshold-pct" value="${store.getSettings().autoDiscounts.cartThreshold.discountPercent}">
                  </div>
                </div>
              </div>

              <!-- First Time Buyer -->
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                  <strong>First-Time Customer Discount</strong>
                  <label class="switch">
                    <input type="checkbox" id="auto-firsttime-enabled" ${store.getSettings().autoDiscounts.firstTime.enabled ? 'checked' : ''}>
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="form-group" style="max-width:200px;">
                  <label>Discount (%)</label>
                  <input type="number" id="auto-firsttime-pct" value="${store.getSettings().autoDiscounts.firstTime.discountPercent}">
                </div>
              </div>

              <button type="submit" class="btn-success">Save Auto Discounts</button>
            </form>
          </div>

          <!-- Email Coupon Generator Panel -->
          <div class="glass-panel" style="padding: 1.5rem;">
            <h3 style="margin-bottom:1rem;">Visual Email Card Generator</h3>
            <p style="font-size:0.8rem; color:var(--neutral-gray); margin-bottom:1rem;">Generate coupon layouts for email marketing or social flyers.</p>
            
            <div class="form-group mb-4">
              <label>Select Coupon Code</label>
              <select id="newsletter-coupon-selector" style="background:#1e293b; border:1px solid var(--glass-border); border-radius:8px; padding:0.5rem; color:#fff;">
                ${coupons.map(c => `<option value="${c.code}">${c.code}</option>`).join('')}
              </select>
            </div>

            <div class="newsletter-card" id="newsletter-card-preview">
              <h3 style="color:#fff; font-size:1.5rem; margin-bottom:0.2rem;">EXCLUSIVE OFFER</h3>
              <p style="font-size:0.85rem; opacity:0.8;">Use code below at checkout</p>
              <div class="newsletter-coupon-box" id="newsletter-code-box">WELCOME15</div>
              <p style="font-size:0.8rem;" id="newsletter-desc-box">Get 15% off your next purchase!</p>
              <div class="newsletter-card-cta">Visit sohapremium.com</div>
            </div>
            
            <button class="btn-secondary mt-4" id="copy-card-html-btn" style="width:100%;">Copy HTML Template</button>
          </div>
        </div>
      </div>
    `;
  }

  // Orders Tab view
  renderOrdersTab() {
    const orders = store.getOrders();
    const customers = store.getCustomers();

    return `
      <div style="display:flex; flex-direction:column; gap:2.5rem;">
        
        <!-- Orders List -->
        <div>
          <h3 style="margin-bottom:1rem;">Sales Orders History</h3>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Shipping</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(o => `
                  <tr>
                    <td><strong>${o.id}</strong></td>
                    <td>
                      <div><strong>${o.customerName}</strong></div>
                      <div style="font-size:0.75rem; color:var(--neutral-gray);">${o.email}</div>
                    </td>
                    <td style="font-size:0.85rem;">${new Date(o.date).toLocaleDateString()}</td>
                    <td>
                      <div style="font-size:0.85rem;">
                        ${o.items.map(item => `• ${item.name} (x${item.quantity})`).join('<br>')}
                      </div>
                    </td>
                    <td>$${o.subtotal.toFixed(2)}</td>
                    <td class="text-success">${o.discountApplied > 0 ? `-$${o.discountApplied.toFixed(2)}` : '-'}</td>
                    <td>$${o.shippingCost.toFixed(2)}</td>
                    <td style="font-weight:700;">$${o.total.toFixed(2)}</td>
                    <td style="font-size:0.85rem; text-transform:uppercase;">${o.paymentMethod}</td>
                    <td>
                      <select class="change-order-status" data-order-id="${o.id}" style="background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:0.2rem; color:#fff; font-size:0.8rem;">
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

        <!-- Customers Directory -->
        <div>
          <h3 style="margin-bottom:1rem;">Customer Directory</h3>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Orders Placed</th>
                  <th>Total Revenue Contribution</th>
                </tr>
              </thead>
              <tbody>
                ${customers.map(c => `
                  <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.email}</td>
                    <td>${c.ordersCount}</td>
                    <td class="text-success" style="font-weight:700;">$${c.totalSpent.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // Modals management
  showAddProductModal(prodId = null) {
    const isEdit = prodId !== null;
    const modalOverlay = document.getElementById('admin-modal-overlay');
    const modalContainer = document.getElementById('admin-modal-container');
    if (!modalOverlay || !modalContainer) return;

    const categories = store.getCategories();
    let product = { name: '', price: 0, category: categories[0] || '', description: '', image: '', inventory: 10 };

    if (isEdit) {
      const products = store.getProducts();
      product = products.find(p => p.id === prodId) || product;
    }

    modalContainer.innerHTML = `
      <button class="modal-close" id="close-admin-modal">✕</button>
      <h2 style="margin-bottom: 1.5rem;">${isEdit ? 'Edit Product' : 'Add New Product'}</h2>

      <form id="admin-prod-form" style="display:flex; flex-direction:column; gap:1rem;">
        <div class="form-group">
          <label>Product Name</label>
          <input type="text" id="ap-name" required value="${product.name}">
        </div>
        
        <div class="checkout-form-grid" style="gap:1rem;">
          <div class="form-group">
            <label>Price ($)</label>
            <input type="number" step="0.01" id="ap-price" required value="${product.price}">
          </div>
          <div class="form-group">
            <label>Category</label>
            <select id="ap-category" style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.6rem; color:#fff;">
              ${categories.map(c => `<option value="${c}" ${product.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Product Image Source</label>
          <div style="display:flex; gap:0.5rem; flex-direction:column;">
            <input type="text" id="ap-image-url" placeholder="Paste Image URL" value="${product.image}">
            <span style="font-size:0.75rem; color:var(--neutral-gray); text-align:center;">- OR -</span>
            <input type="file" id="ap-image-file" accept="image/*" style="background:rgba(255,255,255,0.03); padding:0.4rem; border-radius:8px;">
          </div>
        </div>

        <div class="form-group">
          <label>Stock Count / Inventory</label>
          <input type="number" id="ap-inventory" required value="${product.inventory}">
        </div>

        <div class="form-group">
          <label>Product Description</label>
          <textarea id="ap-desc" rows="3" required>${product.description}</textarea>
        </div>

        <button type="submit" class="btn-primary mt-4" style="padding:0.8rem;">${isEdit ? 'Update Product' : 'Create Product'}</button>
      </form>
    `;

    const form = modalContainer.querySelector('#admin-prod-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = form.querySelector('#ap-name').value.trim();
      const price = parseFloat(form.querySelector('#ap-price').value);
      const category = form.querySelector('#ap-category').value;
      const inventory = parseInt(form.querySelector('#ap-inventory').value);
      const description = form.querySelector('#ap-desc').value.trim();
      let image = form.querySelector('#ap-image-url').value.trim();

      const processSave = (finalImage) => {
        const prodData = { name, price, category, image: finalImage || 'assets/placeholder.jpg', inventory, description };
        if (isEdit) {
          store.updateProduct(prodId, prodData);
        } else {
          store.addProduct(prodData);
        }
        modalOverlay.classList.remove('active');
        this.render();
      };

      // Handle local image uploads
      const fileInput = form.querySelector('#ap-image-file');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          processSave(event.target.result); // Save Base64 string directly
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        processSave(image);
      }
    });

    modalContainer.querySelector('#close-admin-modal').addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.classList.add('active');
  }

  showAddCouponModal(couponCode = null, isDuplicate = false) {
    const isEdit = couponCode !== null && !isDuplicate;
    const modalOverlay = document.getElementById('admin-modal-overlay');
    const modalContainer = document.getElementById('admin-modal-container');
    if (!modalOverlay || !modalContainer) return;

    let coupon = {
      code: '', type: 'percentage', value: 0, minPurchase: 0, maxDiscount: 0,
      startDate: '', expirationDate: '', usageLimit: 0, oneTimePerCustomer: false,
      enabled: true, restrictProducts: [], restrictCategories: [], restrictCustomers: []
    };

    if (couponCode) {
      const coupons = store.getCoupons();
      const match = coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
      if (match) {
        coupon = { ...match };
        if (isDuplicate) {
          coupon.code = `${coupon.code}-COPY`;
          coupon.usageCount = 0;
          coupon.revenueGenerated = 0;
        }
      }
    }

    const products = store.getProducts();
    const categories = store.getCategories();

    modalContainer.innerHTML = `
      <button class="modal-close" id="close-admin-modal">✕</button>
      <h2 style="margin-bottom: 1rem;">${isEdit ? 'Edit Discount Coupon' : (isDuplicate ? 'Clone Coupon' : 'Create Discount Coupon')}</h2>

      <form id="admin-coupon-form" style="display:flex; flex-direction:column; gap:0.8rem; max-height:80vh; overflow-y:auto; padding-right:0.5rem;">
        <div class="form-group">
          <label>Coupon Code Name</label>
          <div style="display:flex; gap:0.5rem;">
            <input type="text" id="ac-code" required placeholder="e.g. SUMMER50" style="flex:1;" value="${coupon.code}">
            <button type="button" class="btn-secondary" id="coupon-random-gen" style="padding:0.5rem 1rem;">🎲 Auto-Gen</button>
          </div>
        </div>

        <div class="checkout-form-grid" style="gap:0.8rem;">
          <div class="form-group">
            <label>Discount Type</label>
            <select id="ac-type" style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.6rem; color:#fff;">
              <option value="percentage" ${coupon.type === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
              <option value="fixed" ${coupon.type === 'fixed' ? 'selected' : ''}>Fixed Amount ($)</option>
              <option value="free_shipping" ${coupon.type === 'free_shipping' ? 'selected' : ''}>Free Shipping</option>
              <option value="bogo" ${coupon.type === 'bogo' ? 'selected' : ''}>Buy One Get One (BOGO)</option>
            </select>
          </div>
          <div class="form-group" id="coupon-value-group">
            <label id="coupon-val-label">Discount Value</label>
            <input type="number" step="0.01" id="ac-value" value="${coupon.value}">
          </div>
        </div>

        <!-- BOGO Selectors -->
        <div id="bogo-products-group" class="checkout-form-grid" style="gap:0.8rem; display: ${coupon.type === 'bogo' ? 'grid' : 'none'};">
          <div class="form-group">
            <label>Buy Product</label>
            <select id="ac-buy-prod" style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.6rem; color:#fff;">
              ${products.map(p => `<option value="${p.id}" ${coupon.buyProductId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Get Reward Product Free</label>
            <select id="ac-get-prod" style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.6rem; color:#fff;">
              ${products.map(p => `<option value="${p.id}" ${coupon.getProductId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="checkout-form-grid" style="gap:0.8rem;">
          <div class="form-group">
            <label>Min Purchase Threshold ($)</label>
            <input type="number" step="0.01" id="ac-min-purchase" value="${coupon.minPurchase}">
          </div>
          <div class="form-group" id="coupon-max-disc-group">
            <label>Max Discount Amount ($)</label>
            <input type="number" step="0.01" id="ac-max-discount" value="${coupon.maxDiscount}">
          </div>
        </div>

        <div class="checkout-form-grid" style="gap:0.8rem;">
          <div class="form-group">
            <label>Start Date</label>
            <input type="date" id="ac-start-date" value="${coupon.startDate}">
          </div>
          <div class="form-group">
            <label>Expiration Date</label>
            <input type="date" id="ac-expire-date" value="${coupon.expirationDate}">
          </div>
        </div>

        <div class="checkout-form-grid" style="gap:0.8rem; align-items:center;">
          <div class="form-group">
            <label>Usage Limit (Total count)</label>
            <input type="number" id="ac-usage-limit" value="${coupon.usageLimit}">
          </div>
          <div class="form-group" style="flex-direction:row; gap:0.5rem; margin-top:1.5rem;">
            <input type="checkbox" id="ac-onetime" ${coupon.oneTimePerCustomer ? 'checked' : ''} style="width:auto; cursor:pointer;">
            <label for="ac-onetime" style="cursor:pointer; color:var(--text-color);">One-Time Use Per Shopper</label>
          </div>
        </div>

        <!-- Restrictions -->
        <h4 style="font-size:0.95rem; margin-top:0.5rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:0.5rem;">Purchase Restrictions</h4>
        
        <div class="form-group">
          <label>Restrict to Products (Leave empty for all)</label>
          <div style="max-height:100px; overflow-y:auto; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); padding:0.5rem; border-radius:8px; display:flex; flex-direction:column; gap:0.3rem;">
            ${products.map(p => `
              <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; font-weight:normal; color:var(--text-color);">
                <input type="checkbox" class="restrict-product-check" value="${p.id}" ${coupon.restrictProducts.includes(p.id) ? 'checked' : ''} style="width:auto;"> ${p.name}
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label>Restrict to Categories (Leave empty for all)</label>
          <div style="display:flex; flex-wrap:wrap; gap:0.6rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); padding:0.5rem; border-radius:8px;">
            ${categories.map(c => `
              <label style="display:flex; align-items:center; gap:0.3rem; font-size:0.85rem; font-weight:normal; color:var(--text-color);">
                <input type="checkbox" class="restrict-category-check" value="${c}" ${coupon.restrictCategories.includes(c) ? 'checked' : ''} style="width:auto;"> ${c}
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label>Restrict to Customers (Emails comma separated, leave empty for all)</label>
          <textarea id="ac-restrict-customers" rows="2" placeholder="e.g. customer1@gmail.com, test@example.com" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.5rem; color:#fff;">${coupon.restrictCustomers.join(', ')}</textarea>
        </div>

        <button type="submit" class="btn-primary mt-4" style="padding:0.8rem; font-weight:700;">${isEdit ? 'Update Coupon' : 'Create Coupon'}</button>
      </form>
    `;

    // Dynamic Select changes
    const selectType = modalContainer.querySelector('#ac-type');
    const valueGroup = modalContainer.querySelector('#coupon-value-group');
    const labelVal = modalContainer.querySelector('#coupon-val-label');
    const inputVal = modalContainer.querySelector('#ac-value');
    const maxDiscGroup = modalContainer.querySelector('#coupon-max-disc-group');
    const bogoGroup = modalContainer.querySelector('#bogo-products-group');

    const updateFieldsVisibility = () => {
      const type = selectType.value;
      if (type === 'percentage') {
        valueGroup.style.display = 'block';
        maxDiscGroup.style.display = 'block';
        bogoGroup.style.display = 'none';
        labelVal.innerText = 'Discount Value (%)';
      } else if (type === 'fixed') {
        valueGroup.style.display = 'block';
        maxDiscGroup.style.display = 'none';
        bogoGroup.style.display = 'none';
        labelVal.innerText = 'Discount Amount ($)';
      } else if (type === 'free_shipping') {
        valueGroup.style.display = 'none';
        maxDiscGroup.style.display = 'none';
        bogoGroup.style.display = 'none';
        inputVal.value = '0';
      } else if (type === 'bogo') {
        valueGroup.style.display = 'none';
        maxDiscGroup.style.display = 'none';
        bogoGroup.style.display = 'grid';
        inputVal.value = '0';
      }
    };
    selectType.addEventListener('change', updateFieldsVisibility);
    updateFieldsVisibility();

    // Random generator
    modalContainer.querySelector('#coupon-random-gen').addEventListener('click', () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'SOHA-';
      for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
      code += '-';
      for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
      modalContainer.querySelector('#ac-code').value = code;
    });

    // Form submit
    const form = modalContainer.querySelector('#admin-coupon-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const code = form.querySelector('#ac-code').value.trim().toUpperCase();
      const type = form.querySelector('#ac-type').value;
      const value = parseFloat(form.querySelector('#ac-value').value || '0');
      const minPurchase = parseFloat(form.querySelector('#ac-min-purchase').value || '0');
      const maxDiscount = parseFloat(form.querySelector('#ac-max-discount').value || '0');
      const startDate = form.querySelector('#ac-start-date').value;
      const expirationDate = form.querySelector('#ac-expire-date').value;
      const usageLimit = parseInt(form.querySelector('#ac-usage-limit').value || '0');
      const oneTimePerCustomer = form.querySelector('#ac-onetime').checked;

      // Restrictions arrays
      const restrictProducts = Array.from(form.querySelectorAll('.restrict-product-check:checked')).map(cb => cb.value);
      const restrictCategories = Array.from(form.querySelectorAll('.restrict-category-check:checked')).map(cb => cb.value);
      
      const rawCustStr = form.querySelector('#ac-restrict-customers').value.trim();
      const restrictCustomers = rawCustStr ? rawCustStr.split(',').map(email => email.trim()).filter(Boolean) : [];

      const couponData = {
        code, type, value, minPurchase, maxDiscount, startDate, expirationDate,
        usageLimit, oneTimePerCustomer, enabled: coupon.enabled,
        restrictProducts, restrictCategories, restrictCustomers,
        buyProductId: type === 'bogo' ? form.querySelector('#ac-buy-prod').value : '',
        getProductId: type === 'bogo' ? form.querySelector('#ac-get-prod').value : '',
        usageCount: coupon.usageCount || 0,
        revenueGenerated: coupon.revenueGenerated || 0
      };

      if (isEdit) {
        store.updateCoupon(couponCode, couponData);
      } else {
        // Create or Duplicate
        store.addCoupon(couponData);
      }

      modalOverlay.classList.remove('active');
      this.render();
    });

    modalContainer.querySelector('#close-admin-modal').addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.classList.add('active');
  }

  // Event bindings
  bindEvents() {
    // Menu navigation click listeners
    const menuItems = this.container.querySelectorAll('.admin-menu-item');
    menuItems.forEach(item => {
      const tab = item.getAttribute('data-tab');
      if (tab) {
        item.addEventListener('click', () => {
          this.activeTab = tab;
          this.render();
        });
      }
    });

    // Logout
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        store.logoutAdmin();
        this.render();
      });
    }

    // Bind items conditional to each tab
    if (this.activeTab === 'products') {
      this.bindProductsEvents();
    } else if (this.activeTab === 'categories') {
      this.bindCategoriesEvents();
    } else if (this.activeTab === 'coupons') {
      this.bindCouponsEvents();
    } else if (this.activeTab === 'orders') {
      this.bindOrdersEvents();
    }
  }

  bindProductsEvents() {
    // Search filter input
    const searchInput = document.getElementById('admin-prod-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.productSearch = e.target.value;
        
        // Re-render table only
        const content = document.getElementById('admin-tab-content');
        if (content) content.innerHTML = this.renderProductsTab();
        
        // Re-bind events on new list
        this.bindProductsTableActions();
      });
    }

    // Opener Modal
    document.getElementById('open-add-prod-modal').addEventListener('click', () => {
      this.showAddProductModal();
    });

    this.bindProductsTableActions();
  }

  bindProductsTableActions() {
    const table = this.container.querySelector('.admin-table');
    if (!table) return;

    // Edit Product Click
    table.querySelectorAll('.edit-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-product-id');
        this.showAddProductModal(id);
      });
    });

    // Delete Product Click
    table.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-product-id');
        if (confirm("Are you sure you want to delete this product from store?")) {
          store.deleteProduct(id);
          this.render();
        }
      });
    });
  }

  bindCategoriesEvents() {
    const addForm = document.getElementById('add-category-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-category-name').value.trim();
        const errorBox = document.getElementById('category-error-box');

        const success = store.addCategory(name);
        if (success) {
          this.render();
        } else {
          errorBox.innerText = "Category already exists.";
          errorBox.style.display = 'block';
        }
      });
    }

    // Rename Click
    this.container.querySelectorAll('.rename-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const oldName = btn.getAttribute('data-category');
        const newName = prompt(`Rename category "${oldName}" to:`, oldName);
        if (newName && newName.trim() && newName.trim() !== oldName) {
          const success = store.renameCategory(oldName, newName.trim());
          if (success) {
            this.render();
          } else {
            alert("Could not rename category. Name might already be in use.");
          }
        }
      });
    });

    // Delete category
    this.container.querySelectorAll('.delete-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-category');
        if (confirm(`Are you sure you want to delete the category "${name}"? Products in this category will become Uncategorized.`)) {
          store.deleteCategory(name);
          this.render();
        }
      });
    });
  }

  bindCouponsEvents() {
    // Coupon Search
    const searchInput = document.getElementById('admin-coupon-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.couponSearch = e.target.value;
        this.updateCouponsTable();
      });
    }

    // Coupon Status select filter
    const selectFilter = document.getElementById('admin-coupon-filter');
    if (selectFilter) {
      selectFilter.addEventListener('change', (e) => {
        this.couponFilter = e.target.value;
        this.updateCouponsTable();
      });
    }

    // Add modal opener
    document.getElementById('open-add-coupon-modal').addEventListener('click', () => {
      this.showAddCouponModal();
    });

    // Automatic discounts submit handler
    const autoForm = document.getElementById('auto-discounts-form');
    if (autoForm) {
      autoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const thresholdEnabled = document.getElementById('auto-threshold-enabled').checked;
        const thresholdVal = parseFloat(document.getElementById('auto-threshold-val').value || '0');
        const thresholdPct = parseInt(document.getElementById('auto-threshold-pct').value || '0');
        
        const firstTimeEnabled = document.getElementById('auto-firsttime-enabled').checked;
        const firstTimePct = parseInt(document.getElementById('auto-firsttime-pct').value || '0');

        const settings = store.getSettings();
        settings.autoDiscounts = {
          cartThreshold: {
            enabled: thresholdEnabled,
            threshold: thresholdVal,
            discountPercent: thresholdPct,
            text: `${thresholdPct}% off on orders over $${thresholdVal}`
          },
          firstTime: {
            enabled: firstTimeEnabled,
            discountPercent: firstTimePct,
            text: `${firstTimePct}% off for your first order`
          }
        };

        store.saveSettings(settings);
        alert("Automatic discounts saved successfully!");
      });
    }

    // Email Coupon newsletter changes
    const newsletterSelect = document.getElementById('newsletter-coupon-selector');
    if (newsletterSelect) {
      const updateNewsletterCard = () => {
        const code = newsletterSelect.value;
        const coupons = store.getCoupons();
        const c = coupons.find(item => item.code === code);
        if (!c) return;

        const codeBox = document.getElementById('newsletter-code-box');
        const descBox = document.getElementById('newsletter-desc-box');

        if (codeBox) codeBox.innerText = c.code;
        if (descBox) {
          let text = '';
          if (c.type === 'percentage') text = `Get ${c.value}% off your purchase!`;
          else if (c.type === 'fixed') text = `Get $${c.value} discount on your order!`;
          else if (c.type === 'free_shipping') text = `Get free shipping on your order!`;
          else if (c.type === 'bogo') text = 'Buy One Get One Free offer active!';
          descBox.innerText = text;
        }
      };

      newsletterSelect.addEventListener('change', updateNewsletterCard);
      updateNewsletterCard();

      // Copy HTML btn
      document.getElementById('copy-card-html-btn').addEventListener('click', () => {
        const card = document.getElementById('newsletter-card-preview');
        if (card) {
          const html = card.outerHTML;
          navigator.clipboard.writeText(html)
            .then(() => alert("Newsletter card HTML copied to clipboard!"))
            .catch(() => alert("Could not copy card html. Please try manually."));
        }
      });
    }

    this.bindCouponsTableActions();
  }

  updateCouponsTable() {
    this.render(); // Re-renders tab completely to update view
  }

  bindCouponsTableActions() {
    const table = this.container.querySelector('.admin-table');
    if (!table) return;

    // Toggle coupon enabled status
    table.querySelectorAll('.toggle-coupon-status').forEach(toggle => {
      toggle.addEventListener('change', () => {
        const code = toggle.getAttribute('data-code');
        const enabled = toggle.checked;
        store.updateCoupon(code, { enabled });
      });
    });

    // Edit Coupon click
    table.querySelectorAll('.edit-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        this.showAddCouponModal(code);
      });
    });

    // Duplicate/Clone Coupon click
    table.querySelectorAll('.duplicate-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        this.showAddCouponModal(code, true);
      });
    });

    // Delete Coupon click
    table.querySelectorAll('.delete-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        if (confirm(`Are you sure you want to delete coupon code "${code}"?`)) {
          store.deleteCoupon(code);
          this.render();
        }
      });
    });
  }

  bindOrdersEvents() {
    // Change order status select
    this.container.querySelectorAll('.change-order-status').forEach(select => {
      select.addEventListener('change', (e) => {
        const orderId = select.getAttribute('data-order-id');
        const status = select.value;
        
        const orders = store.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          orders[index].status = status;
          store.setData('orders', orders);
          alert(`Order status updated to ${status}.`);
        }
      });
    });
  }
}
