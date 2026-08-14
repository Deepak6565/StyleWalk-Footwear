import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('stylewalk_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem('stylewalk_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('stylewalk_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('stylewalk_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('stylewalk_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product, selectedSize = "UK 8") => {
    const cost = product.price_inr !== undefined ? product.price_inr : product.price;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        item => item.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + 1;
        if (product.stock_quantity !== undefined && newQty > product.stock_quantity) {
          return prev;
        }
        updated[existingIdx].quantity = newQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: cost,
            price_inr: cost,
            image_url: product.image_url,
            selectedSize,
            stock_quantity: product.stock_quantity,
            quantity: 1
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, selectedSize) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
  };

  const updateQuantity = (id, selectedSize, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id, selectedSize);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id && item.selectedSize === selectedSize) {
          if (item.stock_quantity !== undefined && newQty > item.stock_quantity) {
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Subtotal & Coupon calculation in ₹ INR
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || item.price_inr) * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discount_type === 'percent' || appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
    } else if (appliedCoupon.discount_type === 'flat' || appliedCoupon.discount_type === 'fixed') {
      discountAmount = appliedCoupon.discount_value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Math.round(discountAmount);
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  const applyCoupon = async (code) => {
    try {
      const res = await axios.post('http://localhost:5000/api/coupons/validate', {
        code,
        subtotal
      });

      if (res.data && res.data.valid) {
        setAppliedCoupon(res.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Coupon validation failed:', err);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        appliedCoupon,
        discountAmount,
        totalAmount,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
