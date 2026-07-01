// Coupon and Discount Validation Engine
import { store } from './store.js';

export class CouponEngine {
  /**
   * Validates a coupon against a shopping cart and customer profile.
   * @param {string} code - The coupon code to check.
   * @param {Array} cartItems - Array of cart items { productId, price, quantity, category }
   * @param {string} customerEmail - The email of the shopper (optional).
   * @returns {Object} { isValid: boolean, error?: string, discountAmount?: number, type?: string, message?: string }
   */
  static validateAndApply(code, cartItems, customerEmail = "") {
    if (!code) {
      return { isValid: false, error: "Please enter a coupon code." };
    }

    const coupons = store.getCoupons();
    const coupon = coupons.find(c => c.code.toLowerCase() === code.trim().toLowerCase());

    if (!coupon) {
      return { isValid: false, error: "Coupon code does not exist." };
    }

    if (!coupon.enabled) {
      return { isValid: false, error: "This coupon is currently disabled." };
    }

    // Date validation
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (coupon.startDate && todayStr < coupon.startDate) {
      return { isValid: false, error: `This coupon is not active yet. It starts on ${coupon.startDate}.` };
    }

    if (coupon.expirationDate && todayStr > coupon.expirationDate) {
      return { isValid: false, error: "This coupon has expired." };
    }

    // Usage limit check
    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
      return { isValid: false, error: "This coupon has reached its maximum usage limit." };
    }

    // Customer email restriction
    if (coupon.restrictCustomers && coupon.restrictCustomers.length > 0) {
      if (!customerEmail) {
        return { isValid: false, error: "Email address is required to use this coupon." };
      }
      const isAllowedCustomer = coupon.restrictCustomers.some(email => email.toLowerCase() === customerEmail.toLowerCase());
      if (!isAllowedCustomer) {
        return { isValid: false, error: "This coupon is not valid for your account." };
      }
    }

    // One-time per customer check
    if (coupon.oneTimePerCustomer && customerEmail) {
      const orders = store.getOrders();
      const hasUsed = orders.some(o => o.email.toLowerCase() === customerEmail.toLowerCase() && o.couponCode.toLowerCase() === code.toLowerCase());
      if (hasUsed) {
        return { isValid: false, error: "You have already used this coupon code." };
      }
    }

    // Calculate cart totals
    const products = store.getProducts();
    let subtotal = 0;
    let eligibleTotal = 0;
    
    // Check if the cart has items
    if (!cartItems || cartItems.length === 0) {
      return { isValid: false, error: "Your cart is empty." };
    }

    cartItems.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const price = prod ? prod.price : item.price;
      const category = prod ? prod.category : item.category;

      subtotal += price * item.quantity;

      // Check restrictions on products/categories
      let isRestricted = false;
      if (coupon.restrictProducts && coupon.restrictProducts.length > 0) {
        if (!coupon.restrictProducts.includes(item.productId)) {
          isRestricted = true;
        }
      }
      if (coupon.restrictCategories && coupon.restrictCategories.length > 0) {
        if (!coupon.restrictCategories.includes(category)) {
          isRestricted = true;
        }
      }

      if (!isRestricted) {
        eligibleTotal += price * item.quantity;
      }
    });

    // Minimum purchase requirement (checked against total subtotal of cart)
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return { isValid: false, error: `Minimum purchase of $${coupon.minPurchase.toFixed(2)} is required to use this coupon.` };
    }

    // If restricted coupon, check if any items matched
    if (eligibleTotal === 0 && (
      (coupon.restrictProducts && coupon.restrictProducts.length > 0) ||
      (coupon.restrictCategories && coupon.restrictCategories.length > 0)
    )) {
      return { isValid: false, error: "This coupon does not apply to the items in your cart." };
    }

    let discountAmount = 0;
    let message = "";

    // Calculate discount based on type
    if (coupon.type === "percentage") {
      discountAmount = (coupon.value / 100) * eligibleTotal;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
        message = `Percentage discount applied, capped at maximum of $${coupon.maxDiscount.toFixed(2)}.`;
      } else {
        message = `${coupon.value}% discount applied successfully!`;
      }
    } else if (coupon.type === "fixed") {
      discountAmount = Math.min(coupon.value, eligibleTotal);
      message = `$${discountAmount.toFixed(2)} off applied successfully!`;
    } else if (coupon.type === "free_shipping") {
      discountAmount = 0; // Handled at shipping calculations, returns free shipping indicator
      message = "Free shipping applied successfully!";
    } else if (coupon.type === "bogo") {
      // BOGO: Buy X get Y free
      const buyItem = cartItems.find(item => item.productId === coupon.buyProductId);
      const getItem = cartItems.find(item => item.productId === coupon.getProductId);

      if (!buyItem) {
        const buyProd = products.find(p => p.id === coupon.buyProductId);
        return { isValid: false, error: `This coupon requires purchasing: ${buyProd ? buyProd.name : 'Required product'}` };
      }
      if (!getItem) {
        const getProd = products.find(p => p.id === coupon.getProductId);
        return { isValid: false, error: `Add the reward item to your cart to get it free: ${getProd ? getProd.name : 'Reward product'}` };
      }

      // Calculate BOGO pairs
      const buyQty = buyItem.quantity;
      const getQty = getItem.quantity;
      const pairs = Math.min(buyQty, getQty);

      const getItemDetails = products.find(p => p.id === coupon.getProductId);
      const getItemPrice = getItemDetails ? getItemDetails.price : getItem.price;

      discountAmount = pairs * getItemPrice;
      message = `BOGO Applied: Get ${pairs} free ${getItemDetails ? getItemDetails.name : 'reward items'}!`;
    }

    // Ensure we don't exceed the total price
    discountAmount = parseFloat(Math.min(discountAmount, subtotal).toFixed(2));

    return {
      isValid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      message,
      couponDetails: coupon
    };
  }

  /**
   * Computes automatic discounts (non-coupon) based on cart subtotal and user profile.
   * @param {number} subtotal - The cart subtotal.
   * @param {string} customerEmail - Shopper's email.
   * @returns {Array} Array of applied auto discounts { type, text, discountAmount }
   */
  static getAutomaticDiscounts(subtotal, customerEmail = "") {
    const settings = store.getSettings();
    const auto = settings.autoDiscounts;
    const applied = [];

    if (!auto) return applied;

    // 1. Cart Threshold Discount
    if (auto.cartThreshold && auto.cartThreshold.enabled && subtotal >= auto.cartThreshold.threshold) {
      const pct = auto.cartThreshold.discountPercent;
      const amt = parseFloat(((pct / 100) * subtotal).toFixed(2));
      applied.push({
        type: "cart_threshold",
        text: auto.cartThreshold.text || `Spend $${auto.cartThreshold.threshold} get ${pct}% off`,
        discountAmount: amt
      });
      // Update subtotal for subsequent checks if needed
      subtotal -= amt;
    }

    // 2. First Time Customer Discount
    if (auto.firstTime && auto.firstTime.enabled && customerEmail) {
      const orders = store.getOrders();
      const isFirstTime = !orders.some(o => o.email.toLowerCase() === customerEmail.toLowerCase());
      if (isFirstTime) {
        const pct = auto.firstTime.discountPercent;
        const amt = parseFloat(((pct / 100) * subtotal).toFixed(2));
        applied.push({
          type: "first_time",
          text: auto.firstTime.text || `${pct}% off for first-time customers`,
          discountAmount: amt
        });
      }
    }

    return applied;
  }

  /**
   * Calculates shipping cost based on cart items, subtotal after automatic discounts, and site settings.
   * @param {number} finalSubtotal - The subtotal after auto-discounts and coupon-discounts.
   * @param {boolean} isFreeShippingCouponActive - Whether a free shipping coupon was successfully applied.
   * @returns {number} The shipping cost.
   */
  static calculateShipping(finalSubtotal, isFreeShippingCouponActive = false) {
    const settings = store.getSettings();
    const shipping = settings.shippingSettings;

    if (!shipping || !shipping.enabled) return 0;
    if (isFreeShippingCouponActive) return 0;

    // Threshold check
    if (shipping.freeShippingThreshold && finalSubtotal >= shipping.freeShippingThreshold) {
      return 0;
    }

    return shipping.baseRate;
  }
}
