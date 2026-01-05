// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useAuth(); // We need to know WHO is logged in

  // 1. SYNC CART WITH DATABASE
  useEffect(() => {
    if (user) {
      // If user is logged in, listen to THEIR specific cart in Firestore
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists() && doc.data().cart) {
          setCart(doc.data().cart);
        } else {
          setCart([]);
        }
      });
      return () => unsubscribe();
    } else {
      // If logged out, clear the cart (or load from local storage if you want guest cart)
      setCart([]); 
    }
  }, [user]);

  // Helper to save to Firestore
  const saveCartToDB = async (newCart) => {
    if (user) {
      await setDoc(doc(db, "users", user.uid), { cart: newCart }, { merge: true });
    }
    setCart(newCart); // Always update local state for immediate UI feedback
  };

  const addToCart = async (product) => {
    let newCart;
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    await saveCartToDB(newCart);
  };

  const decreaseQuantity = async (productId) => {
    const existingItem = cart.find((item) => item.id === productId);
    if (!existingItem) return;

    let newCart;
    if (existingItem.quantity > 1) {
      newCart = cart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    } else {
      // If quantity is 1, asking to decrease usually means remove? 
      // But user asked for explicit delete button. So we stop at 1.
      return; 
    }
    await saveCartToDB(newCart);
  };

  const removeFromCart = async (productId) => {
    const newCart = cart.filter((item) => item.id !== productId);
    await saveCartToDB(newCart);
  };

  const clearCart = async () => {
    await saveCartToDB([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, decreaseQuantity, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);