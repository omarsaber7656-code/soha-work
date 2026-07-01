// Live Visual Customizer for HandMade Crochet
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
    this.init();
  }

  init() {
    this.render();
  }

  destroy() {
    if (this.previewStorefront) this.previewStorefront.destroy();
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
      <div style="display:flex; flex-direction:column; height:100vh; background:#181512; color:#f5efe6;">
        
        <!-- Editor Topbar -->
        <header class="admin-topbar" style="border-bottom:1px solid var(--border-color); background:#181512; flex-shrink:0;">
          <div style="display:flex; align-items:center; gap:1rem;">
            <a href="#admin" class="btn-secondary" style="padding:0.4rem 1rem; font-size:0.85rem;">⬅ Dashboard</a>
            <span style="font-weight:700; font-family:var(--font-heading); font-size:1.2rem; color:#fff;">Crochet Visual Customizer</span>
          </div>

          <!-- Viewport Mode Toggler -->
          <div style="display:flex; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.25rem; border-radius:30px;">
            <button class="viewport-toggle-btn ${this.viewportMode === 'desktop' ? 'active' : ''}" data-mode="desktop" style="padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:#fff;">🖥️ Desktop</button>
            <button class="viewport-toggle-btn ${this.viewportMode === 'tablet' ? 'active' : ''}" data-mode="tablet" style="padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:#fff;">📁 Tablet</button>
            <button class="viewport-toggle-btn ${this.viewportMode === 'mobile' ? 'active' : ''}" data-mode="mobile" style="padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:#fff;">📱 Mobile</button>
          </div>

          <div>
            <a href="#" class="btn-primary" style="padding:0.4rem 1.2rem; font-size:0.85rem;">Launch Live Store</a>
          </div>
        </header>

        <!-- Live Editor Layout Grid -->
        <div class="live-editor-layout">
          
          <!-- Left Controls Sidebar -->
          <aside class="editor-sidebar" style="background:#27221d; border-right:1px solid var(--border-color);">
            <div class="editor-sidebar-content">
              
              <!-- 1. Section: Theme & Branding -->
              <div class="editor-section ${this.openSections.theme ? 'open' : ''}" data-section="theme">
                <div class="editor-section-header">
                  <span class="editor-section-title">🎨 Brand Theme Settings</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body">
                  <div class="form-group">
                    <label>Store Name</label>
                    <input type="text" id="edit-store-name" value="${settings.name}">
                  </div>
                  
                  <div class="form-group">
                    <label>Logo Headline</label>
                    <input type="text" id="edit-logo-val" value="${settings.logo}">
                  </div>

                  <h4 style="font-size:0.85rem; color:var(--neutral-gray); margin-top:0.5rem; border-top:1px solid var(--border-color); padding-top:0.5rem;">Cozy Theme Colors</h4>
                  <div class="color-picker-grid">
                    <div class="color-input-wrapper" style="background:rgba(255,255,255,0.03);">
                      <input type="color" id="picker-primary" value="${settings.theme.primaryColor}">
                      <span class="color-label">Terracotta</span>
                    </div>
                    <div class="color-input-wrapper" style="background:rgba(255,255,255,0.03);">
                      <input type="color" id="picker-accent" value="${settings.theme.accentColor}">
                      <span class="color-label">Orange Accent</span>
                    </div>
                    <div class="color-input-wrapper" style="background:rgba(255,255,255,0.03);">
                      <input type="color" id="picker-bg" value="${settings.theme.bgColor}">
                      <span class="color-label">Cream BG</span>
                    </div>
                    <div class="color-input-wrapper" style="background:rgba(255,255,255,0.03);">
                      <input type="color" id="picker-card" value="${settings.theme.cardBgColor}">
                      <span class="color-label">Sand Card</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Section: Carousel Banners & Countdown -->
              <div class="editor-section ${this.openSections.banners ? 'open' : ''}" data-section="banners">
                <div class="editor-section-header">
                  <span class="editor-section-title">🧶 Slides & Countdown Banner</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body">
                  <!-- Flash Sale Config -->
                  <div style="border-bottom:1px solid var(--border-color); padding-bottom:1rem; display:flex; flex-direction:column; gap:0.75rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong>Active Sale Banner</strong>
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

                  <!-- Banners -->
                  <div>
                    <strong style="margin-bottom:0.5rem; display:block;">Hero Carousel Slides</strong>
                    <div style="display:flex; flex-direction:column; gap:0.8rem;" id="editor-banner-list-container">
                      ${banners.map((b, idx) => `
                        <div class="glass-panel" style="padding:1rem; font-size:0.85rem; display:flex; flex-direction:column; gap:0.5rem;">
                          <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong>Slide #${idx + 1}</strong>
                            <button class="text-danger delete-editor-banner" data-index="${idx}">Delete</button>
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
                  </div>
                </div>
              </div>

              <!-- 3. Section: Contact Details -->
              <div class="editor-section ${this.openSections.textInfo ? 'open' : ''}" data-section="textInfo">
                <div class="editor-section-header">
                  <span class="editor-section-title">📞 Contact & Socials</span>
                  <span>▼</span>
                </div>
                <div class="editor-section-body">
                  <div class="form-group">
                    <label>WhatsApp Number</label>
                    <input type="text" id="edit-whatsapp" value="${settings.whatsappNumber}">
                  </div>
                  <div class="form-group">
                    <label>Store Address</label>
                    <input type="text" id="edit-address" value="${settings.contactAddress}">
                  </div>
                  <div class="form-group">
                    <label>Contact Email</label>
                    <input type="email" id="edit-email" value="${settings.contactEmail}">
                  </div>
                </div>
              </div>

            </div>
          </aside>

          <!-- Right Simulated Viewport -->
          <main class="editor-preview-container" style="background:#181512;">
            <div class="preview-bar" style="background:#110e0c; border-bottom:1px solid var(--border-color);">
              <span style="display:flex; align-items:center; gap:0.5rem;">
                <span class="preview-badge" style="background:var(--primary-color);">LIVE PREVIEW</span>
                <span style="opacity:0.6; color:#f5efe6;">Artisan customizer view. Changes update instantly.</span>
              </span>
              <span id="preview-viewport-res" style="opacity:0.6; font-size:0.8rem; color:#f5efe6;">Size: 100% (Desktop)</span>
            </div>

            <div class="preview-iframe-wrapper">
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
    if (this.previewStorefront) this.previewStorefront.destroy();
    this.previewStorefront = new Storefront('preview-storefront-mount');
  }

  bindEvents() {
    // Section headers click
    const headers = this.container.querySelectorAll('.editor-section-header');
    headers.forEach(h => {
      h.addEventListener('click', () => {
        const sec = h.closest('.editor-section');
        const name = sec.getAttribute('data-section');
        this.openSections[name] = !this.openSections[name];
        sec.classList.toggle('open');
      });
    });

    // Viewport sizes
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
          resText.innerText = 'Size: 400px (Mobile)';
        }
      });
    });

    // Bind inputs
    const bindInput = (id, path) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
          store.updateSettingsField(path, val);
        });
      }
    };

    bindInput('edit-store-name', 'name');
    bindInput('edit-logo-val', 'logo');
    bindInput('picker-primary', 'theme.primaryColor');
    bindInput('picker-accent', 'theme.accentColor');
    bindInput('picker-bg', 'theme.bgColor');
    bindInput('picker-card', 'theme.cardBgColor');
    bindInput('edit-sale-enabled', 'saleBanner.enabled');
    bindInput('edit-sale-text', 'saleBanner.text');
    bindInput('edit-sale-expiry', 'saleBanner.expiry');
    bindInput('edit-whatsapp', 'whatsappNumber');
    bindInput('edit-address', 'contactAddress');
    bindInput('edit-email', 'contactEmail');

    // Banners updates in customizer sidebar
    const bannerContainer = document.getElementById('editor-banner-list-container');
    if (bannerContainer) {
      bannerContainer.addEventListener('input', (e) => {
        const target = e.target;
        const index = parseInt(target.getAttribute('data-index'));
        const banners = store.getBanners();

        if (target.classList.contains('banner-field-title')) {
          banners[index].title = target.value;
        } else if (target.classList.contains('banner-field-subtitle')) {
          banners[index].subtitle = target.value;
        }

        store.saveBanners(banners);
      });

      bannerContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('delete-editor-banner')) {
          const index = parseInt(target.getAttribute('data-index'));
          const banners = store.getBanners();
          if (banners.length <= 1) {
            alert("Minimum 1 banner required.");
            return;
          }
          banners.splice(index, 1);
          store.saveBanners(banners);
          this.render();
        }
      });
    }
  }
}
export const liveEditor = LiveEditor;
