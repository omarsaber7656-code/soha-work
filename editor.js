// Live Visual Editor View Controller
import { store } from './store.js';
import { Storefront } from './storefront.js';

export class LiveEditor {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.viewportMode = 'desktop'; // desktop, tablet, mobile
    this.openSections = {
      theme: true,
      banners: false,
      textInfo: false,
      shippingPay: false
    };
    
    this.previewStorefront = null;

    // Listen to changes to redraw editor sidebar inputs if modified externally
    this.unsubscribe = store.subscribe((key, val) => {
      // Avoid circular rendering loops by only updating non-input areas
    });

    this.init();
  }

  init() {
    this.render();
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.previewStorefront) {
      this.previewStorefront.destroy();
    }
  }

  render() {
    if (!this.container) return;

    if (!store.isAdminLoggedIn()) {
      window.location.hash = '#admin';
      return;
    }

    const settings = store.getSettings();
    const banners = store.getBanners();

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100vh; background:#0a0d16;">
        <!-- Editor Topbar -->
        <header class="admin-topbar" style="border-bottom:1px solid var(--glass-border); flex-shrink:0;">
          <div style="display:flex; align-items:center; gap:1rem;">
            <a href="#admin" class="btn-secondary" style="padding:0.4rem 1rem; font-size:0.85rem;">⬅ Dashboard</a>
            <span style="font-weight:700; font-size:1.1rem; color:#fff;">Live Editor & Customizer</span>
          </div>

          <!-- Viewport Mode Toggler -->
          <div style="display:flex; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.25rem; border-radius:30px;">
            <button class="viewport-toggle-btn ${this.viewportMode === 'desktop' ? 'active' : ''}" data-mode="desktop" style="padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:#fff;">🖥️ Desktop</button>
            <button class="viewport-toggle-btn ${this.viewportMode === 'tablet' ? 'active' : ''}" data-mode="tablet" style="padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:#fff;">📁 Tablet</button>
            <button class="viewport-toggle-btn ${this.viewportMode === 'mobile' ? 'active' : ''}" data-mode="mobile" style="padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:#fff;">📱 Mobile</button>
          </div>

          <div>
            <a href="#" target="_blank" class="btn-primary" style="padding:0.4rem 1.2rem; font-size:0.85rem;">Launch Live Website</a>
          </div>
        </header>

        <!-- Live Editor Layout Grid -->
        <div class="live-editor-layout">
          
          <!-- Left Sidebar Controls -->
          <aside class="editor-sidebar">
            <div class="editor-sidebar-content">
              
              <!-- 1. Section: Theme & Branding -->
              <div class="editor-section ${this.openSections.theme ? 'open' : ''}" data-section="theme">
                <div class="editor-section-header">
                  <span class="editor-section-title">🎨 Theme & branding</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body">
                  <div class="form-group">
                    <label>Store Name</label>
                    <input type="text" id="edit-store-name" value="${settings.name}">
                  </div>
                  <div class="checkout-form-grid" style="gap:0.75rem;">
                    <div class="form-group">
                      <label>Logo Type</label>
                      <select id="edit-logo-type" style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.5rem; color:#fff;">
                        <option value="text" ${settings.logoType === 'text' ? 'selected' : ''}>Text Logo</option>
                        <option value="image" ${settings.logoType === 'image' ? 'selected' : ''}>Image logo URL</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Logo Value</label>
                      <input type="text" id="edit-logo-val" value="${settings.logo}">
                    </div>
                  </div>

                  <h4 style="font-size:0.85rem; color:var(--neutral-gray); margin-top:0.5rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:0.5rem;">Color Palette</h4>
                  <div class="color-picker-grid">
                    <div class="color-input-wrapper">
                      <input type="color" id="picker-primary" value="${settings.theme.primaryColor}">
                      <span class="color-label">Primary</span>
                    </div>
                    <div class="color-input-wrapper">
                      <input type="color" id="picker-accent" value="${settings.theme.accentColor}">
                      <span class="color-label">Accent</span>
                    </div>
                    <div class="color-input-wrapper">
                      <input type="color" id="picker-bg" value="${settings.theme.bgColor}">
                      <span class="color-label">Background</span>
                    </div>
                    <div class="color-input-wrapper">
                      <input type="color" id="picker-card" value="${settings.theme.cardBgColor}">
                      <span class="color-label">Card bg</span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Site Font Family</label>
                    <select id="edit-font-family" style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.5rem; color:#fff;">
                      <option value="'Outfit', system-ui, sans-serif" ${settings.theme.fontFamily.includes('Outfit') ? 'selected' : ''}>Outfit (Modern Premium)</option>
                      <option value="system-ui, sans-serif" ${settings.theme.fontFamily.includes('system-ui') ? 'selected' : ''}>System Default</option>
                      <option value="'Courier New', monospace" ${settings.theme.fontFamily.includes('Courier') ? 'selected' : ''}>Retro Code</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 2. Section: Carousel Banners & Flash Sale -->
              <div class="editor-section ${this.openSections.banners ? 'open' : ''}" data-section="banners">
                <div class="editor-section-header">
                  <span class="editor-section-title">⚡ Banners & Sale Timer</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body">
                  <!-- Flash Sale Config -->
                  <div style="border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:1rem; display:flex; flex-direction:column; gap:0.75rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong>Flash Sale Timer Banner</strong>
                      <label class="switch">
                        <input type="checkbox" id="edit-sale-enabled" ${settings.saleBanner.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                      </label>
                    </div>
                    <div class="form-group">
                      <label>Sale Announcement Text</label>
                      <input type="text" id="edit-sale-text" value="${settings.saleBanner.text}">
                    </div>
                    <div class="form-group">
                      <label>Countdown Expiry Time</label>
                      <input type="datetime-local" id="edit-sale-expiry" value="${settings.saleBanner.expiry.slice(0, 19)}">
                    </div>
                  </div>

                  <!-- Homepage Carousel list -->
                  <div>
                    <strong style="margin-bottom:0.5rem; display:block;">Homepage Image Banners</strong>
                    <div style="display:flex; flex-direction:column; gap:0.8rem;" id="editor-banner-list-container">
                      ${banners.map((b, idx) => `
                        <div class="glass-panel" style="padding:1rem; font-size:0.85rem; display:flex; flex-direction:column; gap:0.5rem;">
                          <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong>Slide #${idx + 1}</strong>
                            <button class="text-danger delete-editor-banner" data-index="${idx}">Delete</button>
                          </div>
                          <div class="form-group">
                            <label>Banner Image URL</label>
                            <input type="text" class="banner-field-image" data-index="${idx}" value="${b.image}">
                          </div>
                          <div class="form-group">
                            <label>Slide Title</label>
                            <input type="text" class="banner-field-title" data-index="${idx}" value="${b.title}">
                          </div>
                          <div class="form-group">
                            <label>Slide Subtitle</label>
                            <input type="text" class="banner-field-subtitle" data-index="${idx}" value="${b.subtitle}">
                          </div>
                        </div>
                      `).join('')}
                    </div>
                    <button class="btn-primary mt-4" id="editor-add-banner-btn" style="width:100%; padding:0.5rem;">➕ Add Slide Banner</button>
                  </div>
                </div>
              </div>

              <!-- 3. Section: Contact details & Social Links -->
              <div class="editor-section ${this.openSections.textInfo ? 'open' : ''}" data-section="textInfo">
                <div class="editor-section-header">
                  <span class="editor-section-title">📞 Contact Info & Socials</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body">
                  <div class="form-group">
                    <label>WhatsApp Contact Number</label>
                    <input type="text" id="edit-whatsapp" value="${settings.whatsappNumber}">
                  </div>
                  <div class="form-group">
                    <label>Contact Phone</label>
                    <input type="text" id="edit-phone" value="${settings.contactPhone}">
                  </div>
                  <div class="form-group">
                    <label>Contact Email</label>
                    <input type="email" id="edit-email" value="${settings.contactEmail}">
                  </div>
                  <div class="form-group">
                    <label>Store Address</label>
                    <input type="text" id="edit-address" value="${settings.contactAddress}">
                  </div>

                  <h4 style="font-size:0.85rem; color:var(--neutral-gray); margin-top:0.5rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:0.5rem;">Social Media Links</h4>
                  <div class="form-group">
                    <label>Facebook URL</label>
                    <input type="text" id="edit-fb" value="${settings.socialLinks.facebook}">
                  </div>
                  <div class="form-group">
                    <label>Instagram URL</label>
                    <input type="text" id="edit-ig" value="${settings.socialLinks.instagram}">
                  </div>
                  <div class="form-group">
                    <label>Twitter/X URL</label>
                    <input type="text" id="edit-tw" value="${settings.socialLinks.twitter}">
                  </div>
                </div>
              </div>

              <!-- 4. Section: Shipping & Payment Options -->
              <div class="editor-section ${this.openSections.shippingPay ? 'open' : ''}" data-section="shippingPay">
                <div class="editor-section-header">
                  <span class="editor-section-title">⚙️ Shipping & Payments</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body">
                  <div class="checkout-form-grid" style="gap:0.75rem;">
                    <div class="form-group">
                      <label>Shipping Fee ($)</label>
                      <input type="number" id="edit-ship-rate" value="${settings.shippingSettings.baseRate}">
                    </div>
                    <div class="form-group">
                      <label>Free Shipping over ($)</label>
                      <input type="number" id="edit-ship-threshold" value="${settings.shippingSettings.freeShippingThreshold}">
                    </div>
                  </div>

                  <h4 style="font-size:0.85rem; color:var(--neutral-gray); margin-top:0.5rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:0.5rem;">Payment Systems</h4>
                  <div style="display:flex; flex-direction:column; gap:0.75rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong>Cash on Delivery (COD)</strong>
                      <label class="switch">
                        <input type="checkbox" id="edit-pay-cod-enabled" ${settings.paymentMethods.cod.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                      </label>
                    </div>
                    <div class="form-group">
                      <label>COD Label Display Name</label>
                      <input type="text" id="edit-pay-cod-name" value="${settings.paymentMethods.cod.name}">
                    </div>
                  </div>

                  <div style="display:flex; flex-direction:column; gap:0.75rem; border-top: 1px solid rgba(255,255,255,0.05); margin-top:0.5rem; padding-top:0.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong>Bank Transfer Option</strong>
                      <label class="switch">
                        <input type="checkbox" id="edit-pay-bank-enabled" ${settings.paymentMethods.bank.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                      </label>
                    </div>
                    <div class="form-group">
                      <label>Bank Label Display Name</label>
                      <input type="text" id="edit-pay-bank-name" value="${settings.paymentMethods.bank.name}">
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </aside>

          <!-- Right Interactive Viewport Preview -->
          <main class="editor-preview-container">
            <div class="preview-bar">
              <span style="display:flex; align-items:center; gap:0.5rem;">
                <span class="preview-badge">LIVE PREVIEW</span>
                <span style="opacity:0.6;">Interactive preview mode. Clicking edits instantly updates the public site.</span>
              </span>
              <span id="preview-viewport-res" style="opacity:0.6; font-size:0.8rem;">Size: 100% (Desktop)</span>
            </div>

            <div class="preview-iframe-wrapper">
              <!-- Viewport Wrapper simulating mobile phone or tablet -->
              <div id="preview-viewport-box" class="preview-viewport" style="width: 100%; transition: width 0.3s ease;">
                <div id="preview-storefront-mount"></div>
              </div>
            </div>
          </main>

        </div>
      </div>
    `;

    this.bindEvents();
    this.mountPreviewStorefront();
  }

  mountPreviewStorefront() {
    if (this.previewStorefront) {
      this.previewStorefront.destroy();
    }
    // Create an instance of Storefront inside our simulated container!
    this.previewStorefront = new Storefront('preview-storefront-mount');
  }

  // Interactive binding
  bindEvents() {
    // Accordion Sections Toggle
    const headers = this.container.querySelectorAll('.editor-section-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const sec = header.closest('.editor-section');
        const secName = sec.getAttribute('data-section');
        
        // Toggle state
        this.openSections[secName] = !this.openSections[secName];
        
        // Toggle class
        sec.classList.toggle('open');
      });
    });

    // Viewport resizing buttons
    const viewButtons = this.container.querySelectorAll('.viewport-toggle-btn');
    const viewportBox = document.getElementById('preview-viewport-box');
    const resText = document.getElementById('preview-viewport-res');

    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.viewportMode = btn.getAttribute('data-mode');

        if (this.viewportMode === 'desktop') {
          viewportBox.style.width = '100%';
          resText.innerText = 'Size: 100% (Desktop)';
        } else if (this.viewportMode === 'tablet') {
          viewportBox.style.width = '768px';
          resText.innerText = 'Size: 768px (Tablet)';
        } else if (this.viewportMode === 'mobile') {
          viewportBox.style.width = '400px';
          resText.innerText = 'Size: 400px (Mobile Phone)';
        }
      });
    });

    // Binding Realtime Changes from inputs directly to LocalStorage + re-render trigger
    const bindInputField = (inputId, settingsPath) => {
      const el = document.getElementById(inputId);
      if (el) {
        el.addEventListener('input', (e) => {
          const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
          store.updateSettingsField(settingsPath, val);
        });
      }
    };

    // Bind branding
    bindInputField('edit-store-name', 'name');
    bindInputField('edit-logo-type', 'logoType');
    bindInputField('edit-logo-val', 'logo');

    // Bind Colors
    bindInputField('picker-primary', 'theme.primaryColor');
    bindInputField('picker-accent', 'theme.accentColor');
    bindInputField('picker-bg', 'theme.bgColor');
    bindInputField('picker-card', 'theme.cardBgColor');
    bindInputField('edit-font-family', 'theme.fontFamily');

    // Bind Flash Sale
    bindInputField('edit-sale-enabled', 'saleBanner.enabled');
    bindInputField('edit-sale-text', 'saleBanner.text');
    bindInputField('edit-sale-expiry', 'saleBanner.expiry');

    // Bind Contact details
    bindInputField('edit-whatsapp', 'whatsappNumber');
    bindInputField('edit-phone', 'contactPhone');
    bindInputField('edit-email', 'contactEmail');
    bindInputField('edit-address', 'contactAddress');
    bindInputField('edit-fb', 'socialLinks.facebook');
    bindInputField('edit-ig', 'socialLinks.instagram');
    bindInputField('edit-tw', 'socialLinks.twitter');

    // Bind Shipping & Payments
    const bindNumericInputField = (inputId, settingsPath) => {
      const el = document.getElementById(inputId);
      if (el) {
        el.addEventListener('input', (e) => {
          store.updateSettingsField(settingsPath, parseFloat(e.target.value || '0'));
        });
      }
    };
    bindNumericInputField('edit-ship-rate', 'shippingSettings.baseRate');
    bindNumericInputField('edit-ship-threshold', 'shippingSettings.freeShippingThreshold');
    bindInputField('edit-pay-cod-enabled', 'paymentMethods.cod.enabled');
    bindInputField('edit-pay-cod-name', 'paymentMethods.cod.name');
    bindInputField('edit-pay-bank-enabled', 'paymentMethods.bank.enabled');
    bindInputField('edit-pay-bank-name', 'paymentMethods.bank.name');

    // Homepage banners visual lists bindings
    this.bindBannerListEvents();
  }

  bindBannerListEvents() {
    const bannersContainer = document.getElementById('editor-banner-list-container');
    if (!bannersContainer) return;

    // Handle field updates
    bannersContainer.addEventListener('input', (e) => {
      const target = e.target;
      const idx = parseInt(target.getAttribute('data-index'));
      const banners = store.getBanners();

      if (target.classList.contains('banner-field-image')) {
        banners[idx].image = target.value;
      } else if (target.classList.contains('banner-field-title')) {
        banners[idx].title = target.value;
      } else if (target.classList.contains('banner-field-subtitle')) {
        banners[idx].subtitle = target.value;
      }

      store.saveBanners(banners);
    });

    // Delete banners
    bannersContainer.addEventListener('click', (e) => {
      const target = e.target;
      if (target.classList.contains('delete-editor-banner')) {
        const idx = parseInt(target.getAttribute('data-index'));
        const banners = store.getBanners();
        if (banners.length <= 1) {
          alert("Must have at least one homepage slide banner.");
          return;
        }
        banners.splice(idx, 1);
        store.saveBanners(banners);
        this.render(); // Re-render sidebar to update slide numbers
      }
    });

    // Add Banner
    const addBtn = document.getElementById('editor-add-banner-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const banners = store.getBanners();
        banners.push({
          id: 'b' + (banners.length + 1),
          image: 'assets/banner1.jpg',
          title: 'New Collections',
          subtitle: 'Enter slide banner details here to custom highlight products.',
          linkText: 'Learn More',
          linkTarget: '#'
        });
        store.saveBanners(banners);
        this.render();
      });
    }
  }
}
