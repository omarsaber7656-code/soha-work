// Coupon and Discount Validation Engine
import { store } from './store.js';

export class CouponEngine {
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

    // Date checks
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (coupon.startDate && todayStr < coupon.startDate) {
      return { isValid: false, error: `This coupon starts on ${coupon.startDate}.` };
    }

    if (coupon.expirationDate && todayStr > coupon.expirationDate) {
      return { isValid: false, error: "This coupon has expired." };
    }

    // Limit checks
    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
      return { isValid: false, error: "This coupon has reached its maximum usage limit." };
    }

    // Customer restriction checks
    if (coupon.restrictCustomers && coupon.restrictCustomers.length > 0) {
      if (!customerEmail) {
        return { isValid: false, error: "Email address is required to validate this coupon." };
      }
      const isAllowed = coupon.restrictCustomers.some(email => email.toLowerCase() === customerEmail.toLowerCase());
      if (!isAllowed) {
        return { isValid: false, error: "This coupon is not valid for your account." };
      }
    }

    // One-time per customer checks
    if (coupon.oneTimePerCustomer && customerEmail) {
      const orders = store.getOrders();
      const hasUsed = orders.some(o => o.email.toLowerCase() === customerEmail.toLowerCase() && o.couponCode.toLowerCase() === code.toLowerCase());
      if (hasUsed) {
        return { isValid: false, error: "You have already used this coupon code." };
      }
    }

    // Totals calculations
    const products = store.getProducts();
    let subtotal = 0;
    let eligibleTotal = 0;
    
    if (!cartItems || cartItems.length === 0) {
      return { isValid: false, error: "Your cart is empty." };
    }

    cartItems.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const price = prod ? prod.price : item.price;
      const category = prod ? prod.category : item.category;

      subtotal += price * item.quantity;

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

    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return { isValid: false, error: `Minimum purchase of $${coupon.minPurchase.toFixed(2)} is required.` };
    }

    if (eligibleTotal === 0 && (
      (coupon.restrictProducts && coupon.restrictProducts.length > 0) ||
      (coupon.restrictCategories && coupon.restrictCategories.length > 0)
    )) {
      return { isValid: false, error: "This coupon does not apply to items in your cart." };
    }

    let discountAmount = 0;
    let message = "";

    if (coupon.type === "percentage") {
      discountAmount = (coupon.value / 100) * eligibleTotal;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
        message = `Percentage discount applied, capped at $${coupon.maxDiscount.toFixed(2)}.`;
      } else {
        message = `${coupon.value}% discount applied!`;
      }
    } else if (coupon.type === "fixed") {
      discountAmount = Math.min(coupon.value, eligibleTotal);
      message = `$${discountAmount.toFixed(2)} off applied!`;
    } else if (coupon.type === "free_shipping") {
      discountAmount = 0;
      message = "Free shipping applied!";
    } else if (coupon.type === "bogo") {
      const buyItem = cartItems.find(item => item.productId === coupon.buyProductId);
      const getItem = cartItems.find(item => item.productId === coupon.getProductId);

      if (!buyItem) {
        const buyProd = products.find(p => p.id === coupon.buyProductId);
        return { isValid: false, error: `Requires purchasing: ${buyProd ? buyProd.name : 'Required product'}` };
      }
      if (!getItem) {
        const getProd = products.find(p => p.id === coupon.getProductId);
        return { isValid: false, error: `Add reward item to cart: ${getProd ? getProd.name : 'Reward product'}` };
      }

      const pairs = Math.min(buyItem.quantity, getItem.quantity);
      const getItemDetails = products.find(p => p.id === coupon.getProductId);
      const getItemPrice = getItemDetails ? getItemDetails.price : getItem.price;

      discountAmount = pairs * getItemPrice;
      message = `BOGO: ${pairs} free ${getItemDetails ? getItemDetails.name : 'reward items'}!`;
    }

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

  static getAutomaticDiscounts(subtotal, customerEmail = "") {
    const settings = store.getSettings();
    const auto = settings.autoDiscounts;
    const applied = [];

    if (!auto) return applied;

    if (auto.cartThreshold && auto.cartThreshold.enabled && subtotal >= auto.cartThreshold.threshold) {
      const pct = auto.cartThreshold.discountPercent;
      const amt = parseFloat(((pct / 100) * subtotal).toFixed(2));
      applied.push({
        type: "cart_threshold",
        text: auto.cartThreshold.text || `Spend $${auto.cartThreshold.threshold} get ${pct}% off`,
        discountAmount: amt
      });
      subtotal -= amt;
    }

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

  static calculateShipping(finalSubtotal, isFreeShippingCouponActive = false) {
    const settings = store.getSettings();
    const shipping = settings.shippingSettings;

    if (!shipping || !shipping.enabled) return 0;
    if (isFreeShippingCouponActive) return 0;

    if (shipping.freeShippingThreshold && finalSubtotal >= shipping.freeShippingThreshold) {
      return 0;
    }

    return shipping.baseRate;
  }
}
