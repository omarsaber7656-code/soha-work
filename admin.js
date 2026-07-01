// Admin Dashboard View Controller for HandMade Crochet
import { store } from './store.js';

export class Admin {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeTab = 'dashboard'; // dashboard, products, categories, coupons, customOrders, orders
    
    this.productSearch = '';
    this.couponSearch = '';
    this.couponFilter = 'all';

    // Subscribe to store updates
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

  render() {
    if (!this.container) return;

    if (!store.isAdminLoggedIn()) {
      this.renderLogin();
      return;
    }

    const customOrdersCount = store.getCustomOrders().filter(o => o.status === 'review').length;

    this.container.innerHTML = `
      <div class="admin-layout">
        <!-- Sidebar Navigation -->
        <aside class="admin-sidebar" style="background:#1c1917; border-right:1px solid var(--border-color);">
          <div class="admin-sidebar-header" style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="font-size: 1.4rem; font-weight:900; color:#fff; font-family:var(--font-heading);">Artisan Admin</span>
            <span class="admin-badge-label">CONSOLES</span>
          </div>

          <nav class="admin-menu">
            <div class="admin-menu-item ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">📊 Dashboard</div>
            <div class="admin-menu-item ${this.activeTab === 'products' ? 'active' : ''}" data-tab="products">📦 Products</div>
            <div class="admin-menu-item ${this.activeTab === 'categories' ? 'active' : ''}" data-tab="categories">🏷️ Categories</div>
            <div class="admin-menu-item ${this.activeTab === 'coupons' ? 'active' : ''}" data-tab="coupons">🎟️ Coupons & Discounts</div>
            <div class="admin-menu-item ${this.activeTab === 'customOrders' ? 'active' : ''}" data-tab="customOrders">
              🧶 Custom Requests
              ${customOrdersCount > 0 ? `<span class="badge-count" style="background:var(--primary-color); color:#fff; margin-inline-start:0.5rem;">${customOrdersCount}</span>` : ''}
            </div>
            <div class="admin-menu-item ${this.activeTab === 'orders' ? 'active' : ''}" data-tab="orders">🛒 Orders & Sales</div>
            <a href="#editor" class="admin-menu-item" style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; color: var(--primary-color);">🎨 Visual Editor</a>
          </nav>

          <div class="admin-sidebar-footer" style="border-top:1px solid rgba(255,255,255,0.05);">
            <div class="admin-user-info">
              <span class="admin-username" style="color:#fff;">soha_work</span>
              <span class="admin-role">Head Knitter</span>
            </div>
            <button class="admin-logout-btn" id="admin-logout-btn" title="Logout">🚪</button>
          </div>
        </aside>

        <!-- Main Content Panel -->
        <div class="admin-main-container">
          <header class="admin-topbar">
            <h2>${this.getTabTitle()}</h2>
            <a href="#" class="btn-secondary" style="padding:0.4rem 1rem; font-size:0.85rem;">View Storefront</a>
          </header>
          
          <main class="admin-content" id="admin-tab-content">
            ${this.renderTabContent()}
          </main>
        </div>
      </div>

      <!-- Modals mount overlay -->
      <div class="modal-overlay" id="admin-modal-overlay">
        <div class="modal-container glass-panel" style="max-width: 600px; padding: 2.5rem;" id="admin-modal-container"></div>
      </div>
    `;

    this.bindEvents();
  }

  renderLogin() {
    this.container.innerHTML = `
      <div class="admin-login-wrapper">
        <div class="login-card glass-panel">
          <div class="login-header">
            <h2>Artisan LogIn</h2>
            <p>Access the custom crochet admin dashboard</p>
          </div>
          <form id="admin-login-form" style="display:flex; flex-direction:column; gap:1.25rem;">
            <div class="form-group">
              <label>Username</label>
              <input type="text" id="login-user" required autocomplete="username">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="login-pass" required autocomplete="current-password">
            </div>
            <div id="login-error-box" class="text-danger" style="font-size:0.85rem; font-weight:600; display:none;"></div>
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

      if (store.loginAdmin(user, pass)) {
        this.render();
      } else {
        errorBox.innerText = "Invalid username or password.";
        errorBox.style.display = 'block';
      }
    });
  }

  getTabTitle() {
    const titles = {
      dashboard: 'Artisan Shop Dashboard',
      products: 'Manage Stitched Products',
      categories: 'Artisan Categories',
      coupons: 'Live Coupons Manager',
      customOrders: 'Custom Stitching Requests',
      orders: 'Sales Orders & Loyalty Directory'
    };
    return titles[this.activeTab] || 'Admin Console';
  }

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
      case 'customOrders':
        return this.renderCustomOrdersTab();
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
    const custom = store.getCustomOrders();

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const pendingCustoms = custom.filter(o => o.status === 'review').length;

    return `
      <div class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-icon revenue">💵</div>
          <div class="stat-info">
            <span class="stat-value">$${totalRevenue.toFixed(2)}</span>
            <span class="stat-label">Total Sales</span>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon orders">🧶</div>
          <div class="stat-info">
            <span class="stat-value">${totalOrders}</span>
            <span class="stat-label">Total Orders</span>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon coupons">🎟️</div>
          <div class="stat-info">
            <span class="stat-value">${coupons.filter(c => c.enabled).length}</span>
            <span class="stat-label">Active Coupons</span>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon" style="background:rgba(234,88,12,0.1); color:var(--primary-color);">📋</div>
          <div class="stat-info">
            <span class="stat-value">${pendingCustoms}</span>
            <span class="stat-label">Custom Reviews</span>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr; gap:2rem; margin-bottom: 2rem;">
        <div class="glass-panel" style="padding:1.5rem;">
          <h3>Sales Analytics Chart</h3>
          <div style="width:100%; display:flex; align-items:center; justify-content:center; margin-top:1rem;">
            <svg viewBox="0 0 500 100" style="width:100%; max-height:150px;">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="10" x2="500" y2="10" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
              <path d="M 0 90 L 80 70 L 160 85 L 240 40 L 320 60 L 400 30 L 500 10 L 500 90 Z" fill="url(#chartGrad)"/>
              <path d="M 0 90 L 80 70 L 160 85 L 240 40 L 320 60 L 400 30 L 500 10" fill="none" stroke="var(--primary-color)" stroke-width="3"/>
            </svg>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:2rem;">
        <div class="glass-panel" style="padding:1.5rem;">
          <h3 style="margin-bottom:1rem;">Top Stitched Products</h3>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${products.slice(0, 3).map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td>$${p.price.toFixed(2)}</td>
                  <td>${p.category}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="glass-panel" style="padding:1.5rem;">
          <h3 style="margin-bottom:1rem;">Low Yarn Stock warning</h3>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock left</th>
              </tr>
            </thead>
            <tbody>
              ${products.filter(p => p.inventory <= 5).map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td class="text-danger" style="font-weight:700;">${p.inventory} pieces</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Products List tab
  renderProductsTab() {
    const products = store.getProducts();
    let filtered = products;

    if (this.productSearch.trim()) {
      const q = this.productSearch.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    return `
      <div class="admin-section-header">
        <input type="text" id="admin-prod-search" placeholder="Search products..." value="${this.productSearch}" style="background:rgba(255,255,255,0.5); border:1px solid var(--border-color); border-radius:8px; padding:0.5rem 1rem; color:var(--text-color); max-width:300px; width:100%;">
        <button class="btn-luxury" id="open-add-prod-modal">➕ Add Crochet Product</button>
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
                <td><span class="${p.inventory <= 3 ? 'text-danger' : 'text-success'}" style="font-weight:700;">${p.inventory}</span></td>
                <td>
                  <div class="admin-actions-cell">
                    <button class="btn-secondary edit-product-btn" data-id="${p.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">✏️ Edit</button>
                    <button class="btn-danger delete-product-btn" data-id="${p.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">🗑️ Delete</button>
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
    const categories = store.getCategories();
    return `
      <div style="display:grid; grid-template-columns:1fr; gap:2rem;">
        <div class="glass-panel" style="padding:1.5rem; max-width:480px;">
          <h3 style="margin-bottom:1rem;">Add New Category</h3>
          <form id="add-category-form" style="display:flex; gap:1rem;">
            <input type="text" id="new-category-name" placeholder="e.g. Blankets" required style="flex:1; border:1px solid var(--border-color); border-radius:8px; padding:0.5rem; background:rgba(255,255,255,0.5);">
            <button type="submit" class="btn-luxury">Add</button>
          </form>
        </div>

        <div class="glass-panel" style="padding:1.5rem;">
          <h3 style="margin-bottom:1rem;">Manage Categories</h3>
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
                    <button class="btn-danger delete-category-btn" data-cat="${cat}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">🗑️ Delete</button>
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
    const coupons = store.getCoupons();
    let filtered = coupons;

    if (this.couponSearch.trim()) {
      const q = this.couponSearch.toLowerCase();
      filtered = filtered.filter(c => c.code.toLowerCase().includes(q));
    }

    return `
      <div class="coupon-grid-tab">
        <div>
          <div class="admin-section-header">
            <input type="text" id="admin-coupon-search" placeholder="Search coupons..." value="${this.couponSearch}" style="background:rgba(255,255,255,0.5); border:1px solid var(--border-color); border-radius:8px; padding:0.5rem; max-width:300px; width:100%;">
            <button class="btn-luxury" id="open-add-coupon-modal">➕ Create Coupon</button>
          </div>

          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(c => `
                  <tr>
                    <td><strong>${c.code}</strong></td>
                    <td style="font-size:0.85rem; text-transform:uppercase; color:var(--neutral-gray);">${c.type}</td>
                    <td>${c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}</td>
                    <td>${c.usageCount} / ${c.usageLimit || '∞'}</td>
                    <td><span class="status-badge ${c.enabled ? 'active' : 'disabled'}">${c.enabled ? 'Active' : 'Disabled'}</span></td>
                    <td class="text-success">$${(c.revenueGenerated || 0).toFixed(2)}</td>
                    <td>
                      <div class="admin-actions-cell" style="gap:0.3rem;">
                        <button class="btn-secondary edit-coupon-btn" data-code="${c.code}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">✏️ Edit</button>
                        <button class="btn-secondary duplicate-coupon-btn" data-code="${c.code}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">👥 Clone</button>
                        <button class="btn-danger delete-coupon-btn" data-code="${c.code}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:2rem;">
          <!-- Visual Card Generator -->
          <div class="glass-panel" style="padding:1.5rem; text-align:center;">
            <h3>Visual Card Generator</h3>
            <p style="font-size:0.8rem; opacity:0.7; margin-bottom:1rem;">Copy styled visual marketing flyer grids.</p>
            <div style="border:2px dashed var(--primary-color); border-radius:12px; padding:1.5rem; background:rgba(255,255,255,0.4);" id="flyer-preview">
              <span style="font-size:2rem;">🧶</span>
              <h4 style="font-family:var(--font-heading); font-size:1.4rem; color:var(--primary-color);">HEIRLOOM CROCHET</h4>
              <div style="font-size:1.6rem; font-weight:900; margin:1rem 0; letter-spacing:0.05em; border:2px dashed var(--primary-color); padding:0.5rem; border-radius:8px;">WELCOME10</div>
              <p style="font-size:0.8rem; opacity:0.8;">Get 10% off your first handcrafted crochet cardigan!</p>
            </div>
            <button class="btn-secondary mt-4" style="width:100%;" id="copy-flyer-html-btn">Copy HTML Card Template</button>
          </div>
        </div>
      </div>
    `;
  }

  // Custom Orders Tab View
  renderCustomOrdersTab() {
    const orders = store.getCustomOrders();

    return `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Details</th>
              <th>Size / Colors</th>
              <th>Budget</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>
                  <strong>${o.name}</strong>
                  <div style="font-size:0.75rem; color:var(--neutral-gray);">${o.email}</div>
                </td>
                <td style="font-size:0.85rem; max-width:250px; white-space:normal; line-height:1.4;">${o.details}</td>
                <td>
                  <div>Size: ${o.size}</div>
                  <div style="font-size:0.75rem; opacity:0.8;">Colors: ${o.colors}</div>
                </td>
                <td style="font-weight:700;">$${o.budget}</td>
                <td style="font-size:0.85rem;">${new Date(o.deliveryDate).toLocaleDateString()}</td>
                <td>
                  <select class="change-custom-order-status" data-id="${o.id}" style="background:var(--card-bg-color); border:1px solid var(--border-color); border-radius:4px; padding:0.2rem; color:var(--text-color); font-size:0.8rem;">
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
                <td colspan="6" style="text-align:center; padding:3rem; color:var(--neutral-gray);">No custom requests submitted yet.</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;
  }

  // Sales Orders Tab View
  renderOrdersTab() {
    const orders = store.getOrders();
    const customers = store.getCustomers();

    return `
      <div style="display:flex; flex-direction:column; gap:3rem;">
        <div>
          <h3>Sales History</h3>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Packaging</th>
                  <th>Certificate</th>
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
                    <td style="font-size:0.85rem; line-height:1.4;">
                      ${o.items.map(it => `• ${it.name} (x${it.quantity}) [${it.size}/${it.color}]`).join('<br>')}
                    </td>
                    <td style="font-weight:700;">$${o.total.toFixed(2)}</td>
                    <td>${o.giftWrapActive ? '🎁 Gift Wrapped' : 'Standard'}</td>
                    <td>${o.includeCertificate ? '📜 Included' : 'No'}</td>
                    <td>
                      <select class="change-order-status" data-id="${o.id}" style="background:var(--card-bg-color); border:1px solid var(--border-color); border-radius:4px; padding:0.2rem; color:var(--text-color); font-size:0.8rem;">
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
          <h3>Customer Directory & Loyalty Points</h3>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Orders Count</th>
                  <th>Total Spent</th>
                  <th>Loyalty Points</th>
                </tr>
              </thead>
              <tbody>
                ${customers.map(c => `
                  <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.email}</td>
                    <td>${c.ordersCount}</td>
                    <td class="text-success" style="font-weight:700;">$${c.totalSpent.toFixed(2)}</td>
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

  // Modals Add/Edit Products
  showAddProductModal(prodId = null) {
    const isEdit = prodId !== null;
    const overlay = document.getElementById('admin-modal-overlay');
    const container = document.getElementById('admin-modal-container');
    if (!overlay || !container) return;

    const categories = store.getCategories();
    let product = { name: '', price: 0, category: categories[0] || '', description: '', image: '', inventory: 5, materials: '', process: '' };

    if (isEdit) {
      const products = store.getProducts();
      product = products.find(p => p.id === prodId) || product;
    }

    container.innerHTML = `
      <button class="modal-close" id="close-admin-modal">✕</button>
      <h2>${isEdit ? 'Edit Crochet Product' : 'Add New Crochet Product'}</h2>

      <form id="admin-prod-form" style="display:flex; flex-direction:column; gap:0.8rem; max-height:80vh; overflow-y:auto; padding-inline-end:0.5rem; text-align:start;">
        <div class="form-group">
          <label>Product Title Name</label>
          <input type="text" id="ap-name" required value="${product.name}">
        </div>

        <div class="checkout-form-grid" style="gap:1rem;">
          <div class="form-group">
            <label>Price ($)</label>
            <input type="number" step="0.01" id="ap-price" required value="${product.price}">
          </div>
          <div class="form-group">
            <label>Category</label>
            <select id="ap-category" style="background:#fff; border:1px solid var(--border-color); padding:0.6rem; border-radius:8px;">
              ${categories.map(c => `<option value="${c}" ${product.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Inventory / Stock Count</label>
          <input type="number" id="ap-inventory" required value="${product.inventory}">
        </div>

        <div class="form-group">
          <label>Image Source</label>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <input type="text" id="ap-image-url" placeholder="Paste Image URL" value="${product.image}">
            <input type="file" id="ap-image-file" accept="image/*" style="background:rgba(0,0,0,0.02); padding:0.4rem; border-radius:8px;">
          </div>
        </div>

        <div class="form-group">
          <label>Materials Detail</label>
          <input type="text" id="ap-materials" placeholder="e.g. 100% Organic Cotton Yarn" value="${product.materials}">
        </div>

        <div class="form-group">
          <label>Handmade Stitching Details</label>
          <input type="text" id="ap-process" placeholder="e.g. Stitched over 15 hours by local artisans" value="${product.process}">
        </div>

        <div class="form-group">
          <label>Short Description</label>
          <textarea id="ap-desc" rows="3" required>${product.description}</textarea>
        </div>

        <button type="submit" class="btn-primary mt-4" style="padding:0.8rem; justify-content:center;">${isEdit ? 'Update Product' : 'Create Product'}</button>
      </form>
    `;

    const form = container.querySelector('#admin-prod-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#ap-name').value.trim();
      const price = parseFloat(form.querySelector('#ap-price').value);
      const category = form.querySelector('#ap-category').value;
      const inventory = parseInt(form.querySelector('#ap-inventory').value);
      const materials = form.querySelector('#ap-materials').value.trim();
      const process = form.querySelector('#ap-process').value.trim();
      const description = form.querySelector('#ap-desc').value.trim();
      let image = form.querySelector('#ap-image-url').value.trim();

      const save = (finalImage) => {
        const data = { name, price, category, inventory, materials, process, description, image: finalImage };
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

    container.querySelector('#close-admin-modal').addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    overlay.classList.add('active');
  }

  showAddCouponModal(couponCode = null, isDuplicate = false) {
    const isEdit = couponCode !== null && !isDuplicate;
    const overlay = document.getElementById('admin-modal-overlay');
    const container = document.getElementById('admin-modal-container');
    if (!overlay || !container) return;

    let coupon = { code: '', type: 'percentage', value: 0, minPurchase: 0, maxDiscount: 0, startDate: '', expirationDate: '', usageLimit: 0, oneTimePerCustomer: false, enabled: true };

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

    container.innerHTML = `
      <button class="modal-close" id="close-admin-modal">✕</button>
      <h2>${isEdit ? 'Edit Coupon' : 'Create Coupon'}</h2>

      <form id="admin-coupon-form" style="display:flex; flex-direction:column; gap:0.8rem; text-align:start;">
        <div class="form-group">
          <label>Coupon Code</label>
          <input type="text" id="ac-code" required placeholder="e.g. BOHO50" value="${coupon.code}">
        </div>

        <div class="checkout-form-grid" style="gap:1rem;">
          <div class="form-group">
            <label>Discount Type</label>
            <select id="ac-type" style="background:#fff; border:1px solid var(--border-color); padding:0.6rem; border-radius:8px;">
              <option value="percentage" ${coupon.type === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
              <option value="fixed" ${coupon.type === 'fixed' ? 'selected' : ''}>Fixed Amount ($)</option>
              <option value="free_shipping" ${coupon.type === 'free_shipping' ? 'selected' : ''}>Free Shipping</option>
            </select>
          </div>
          <div class="form-group">
            <label>Discount Value</label>
            <input type="number" id="ac-value" value="${coupon.value}">
          </div>
        </div>

        <div class="checkout-form-grid" style="gap:1rem;">
          <div class="form-group">
            <label>Min Purchase Threshold ($)</label>
            <input type="number" id="ac-min" value="${coupon.minPurchase}">
          </div>
          <div class="form-group">
            <label>Max Discount ($)</label>
            <input type="number" id="ac-max" value="${coupon.maxDiscount}">
          </div>
        </div>

        <div class="checkout-form-grid" style="gap:1rem;">
          <div class="form-group">
            <label>Usage Limit</label>
            <input type="number" id="ac-limit" value="${coupon.usageLimit}">
          </div>
          <div class="form-group">
            <label>Expiration Date</label>
            <input type="date" id="ac-expiry" value="${coupon.expirationDate}">
          </div>
        </div>

        <button type="submit" class="btn-primary mt-4" style="justify-content:center; padding:0.8rem;">Save Coupon</button>
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
      const expirationDate = form.querySelector('#ac-expiry').value;

      const data = { code, type, value, minPurchase, maxDiscount, usageLimit, expirationDate, enabled: coupon.enabled, usageCount: coupon.usageCount || 0, revenueGenerated: coupon.revenueGenerated || 0 };

      if (isEdit) {
        store.updateCoupon(couponCode, data);
      } else {
        store.addCoupon(data);
      }
      overlay.classList.remove('active');
      this.render();
    });

    container.querySelector('#close-admin-modal').addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    overlay.classList.add('active');
  }

  bindEvents() {
    // Menu links switcher
    this.container.querySelectorAll('.admin-menu-item').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      if (tab) {
        btn.addEventListener('click', () => {
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

    if (this.activeTab === 'products') {
      const search = document.getElementById('admin-prod-search');
      if (search) {
        search.addEventListener('input', (e) => {
          this.productSearch = e.target.value;
          const list = document.getElementById('admin-tab-content');
          if (list) list.innerHTML = this.renderProductsTab();
          this.bindProductsTableActions();
        });
      }

      document.getElementById('open-add-prod-modal').addEventListener('click', () => {
        this.showAddProductModal();
      });
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
          if (confirm(`Delete category "${cat}"?`)) {
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
          this.render();
        });
      }
      document.getElementById('open-add-coupon-modal').addEventListener('click', () => {
        this.showAddCouponModal();
      });
      this.bindCouponsTableActions();

      // Copy flyer html templates
      const copyBtn = document.getElementById('copy-flyer-html-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const flyer = document.getElementById('flyer-preview');
          if (flyer) {
            navigator.clipboard.writeText(flyer.outerHTML)
              .then(() => alert("Flyer Card HTML copied successfully!"))
              .catch(() => alert("Failed to copy."));
          }
        });
      }

    } else if (this.activeTab === 'customOrders') {
      // Change status listener
      this.container.querySelectorAll('.change-custom-order-status').forEach(sel => {
        sel.addEventListener('change', () => {
          const id = sel.getAttribute('data-id');
          const status = sel.value;
          store.updateCustomOrderStatus(id, status);
          alert(`Status of custom request ${id} updated to ${status}.`);
        });
      });

    } else if (this.activeTab === 'orders') {
      this.container.querySelectorAll('.change-order-status').forEach(sel => {
        sel.addEventListener('change', () => {
          const id = sel.getAttribute('data-id');
          const status = sel.value;
          const orders = store.getOrders();
          const idx = orders.findIndex(o => o.id === id);
          if (idx !== -1) {
            orders[idx].status = status;
            store.setData('orders', orders);
            alert(`Order status ${id} updated to ${status}.`);
          }
        });
      });
    }
  }

  bindProductsTableActions() {
    this.container.querySelectorAll('.edit-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showAddProductModal(btn.getAttribute('data-id'));
      });
    });
    this.container.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Delete this product?")) {
          store.deleteProduct(id);
          this.render();
        }
      });
    });
  }

  bindCouponsTableActions() {
    this.container.querySelectorAll('.edit-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showAddCouponModal(btn.getAttribute('data-code'));
      });
    });
    this.container.querySelectorAll('.duplicate-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showAddCouponModal(btn.getAttribute('data-code'), true);
      });
    });
    this.container.querySelectorAll('.delete-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        if (confirm(`Delete coupon "${code}"?`)) {
          store.deleteCoupon(code);
          this.render();
        }
      });
    });
  }
}
