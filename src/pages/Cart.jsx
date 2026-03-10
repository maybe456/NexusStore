// src/pages/Cart.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { 
  Trash2, Plus, Minus, AlertTriangle, CreditCard, Banknote, 
  ShoppingBag, ArrowRight, Shield, Truck, Package, Sparkles, Zap
} from "lucide-react";
import { ScatteredFloatingIcons } from "../components/Interactive3D";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  },
  exit: { 
    opacity: 0, 
    x: -100, 
    scale: 0.8,
    transition: { duration: 0.3 }
  }
};

const Cart = () => {
  const { cart, removeFromCart, addToCart, decreaseQuantity, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [hoveredItem, setHoveredItem] = useState(null);

  // Load User Data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoadingProfile(true);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.address) setAddress(data.address);
            if (data.phone) setPhone(data.phone);
          }
        } catch (error) { console.error(error); }
        setLoadingProfile(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleCheckout = async () => {
    if (!user) { alert("Please login!"); navigate("/login"); return; }

    try { await user.reload(); } catch (e) { console.log("Reload error", e); }
    if (!user.emailVerified) {
      alert("Please verify your email before placing an order.");
      return;
    }

    if (!phone || phone.trim() === "") {
      alert("Phone Number is required for delivery.");
      return;
    }
    if (!address.trim()) { alert("Please enter shipping address."); return; }

    let finalPaymentStatus = "Pending (COD)";
    let finalPaymentMethod = "Cash on Delivery";

    if (paymentMethod === "bkash") {
      const amount = cartTotal + 120;
      const confirmMsg = "PAYMENT INSTRUCTIONS:\n\n1. Open bKash App -> 'Send Money'\n2. Send " + amount + " to: 017XXXXXXXX (Personal)\n3. Copy the TrxID.\n\nClick OK to enter the TrxID.";

      if (!window.confirm(confirmMsg)) return;

      const trxId = window.prompt("Enter the 10-digit bKash TrxID:");
      if (!trxId) return;

      const isValidFormat = /^[A-Za-z0-9]{10}$/.test(trxId);
      if (!isValidFormat) {
        alert("Invalid TrxID! Must be exactly 10 characters (letters and numbers only).");
        return;
      }

      finalPaymentMethod = "bKash (TrxID: " + trxId.toUpperCase() + ")";
      finalPaymentStatus = "Verify TrxID";
    }

    setIsCheckingOut(true);

    try {
      await setDoc(doc(db, "users", user.uid), {
        address: address,
        phone: phone
      }, { merge: true });

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        userPhone: phone,
        items: cart,
        totalAmount: cartTotal + 120,
        address: address,
        status: "Pending",
        paymentStatus: finalPaymentStatus,
        paymentMethod: finalPaymentMethod,
        createdAt: new Date()
      };

      await addDoc(collection(db, "orders"), orderData);
      clearCart();
      navigate("/success");

    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please try again.");
    }
    setIsCheckingOut(false);
  };

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900 px-4 relative overflow-hidden">
        {/* Animated background */}
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="text-center relative z-10"
        >
          <motion.div 
            className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-800 dark:to-dark-700 flex items-center justify-center mx-auto mb-8 shadow-2xl"
            animate={{ 
              rotateY: [0, 360],
              boxShadow: [
                "0 25px 50px -12px rgba(0,0,0,0.1)",
                "0 25px 50px -12px rgba(99,102,241,0.3)",
                "0 25px 50px -12px rgba(0,0,0,0.1)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </motion.div>
          </motion.div>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Your Cart is <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Empty</span>
          </motion.h2>
          <motion.p 
            className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Looks like you haven't added anything to your cart yet.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              to="/shop" 
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 px-10 py-5 rounded-2xl font-bold transition-all hover:-translate-y-1 shadow-2xl shadow-gray-900/30 dark:shadow-white/20 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-3 group-hover:text-white dark:group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
                Start Shopping
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const paymentButtonClass = (method, selected) => {
    if (method === "bkash") {
      return "p-4 rounded-2xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all " + 
        (selected ? "bg-[#E2136E] text-white border-[#E2136E] shadow-lg shadow-[#E2136E]/25" : "bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20");
    }
    return "p-4 rounded-2xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all " + 
      (selected ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg shadow-gray-900/20" : "bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 relative overflow-hidden">
      {/* Scattered floating icons */}
      <ScatteredFloatingIcons density="sparse" />
      
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 -right-20 w-80 h-80 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 0.8, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-10"
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3"
            whileHover={{ scale: 1.01 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShoppingBag className="w-10 h-10 text-primary-600"/>
            </motion.div>
            <span className="bg-gradient-to-r from-gray-900 via-primary-600 to-accent-500 dark:from-white dark:via-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
              Shopping Cart
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>
          </motion.h1>
          <motion.p 
            className="text-gray-500 dark:text-gray-400 mt-2 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="font-bold text-primary-600">{cart.length}</span> item{cart.length !== 1 ? "s" : ""} in your cart
          </motion.p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <motion.div 
            className="flex-1 space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => (
                <motion.div 
                  key={item.id}
                  variants={itemVariants}
                  exit="exit"
                  layout
                  className="relative group"
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  {/* Glow effect on hover */}
                  <motion.div 
                    className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  />
                  
                  <div className="relative flex flex-col sm:flex-row sm:items-center justify-between bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-white/10 gap-4">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-600 rounded-xl overflow-hidden flex-shrink-0 shadow-inner"
                        whileHover={{ rotate: [0, -3, 3, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain p-2" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg line-clamp-2 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                        {item.size && (
                          <motion.span 
                            className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-lg mt-2"
                            whileHover={{ scale: 1.05 }}
                          >
                            Size: {item.size}
                          </motion.span>
                        )}
                        <motion.p 
                          className="text-xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mt-2"
                          animate={hoveredItem === item.id ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          ৳{item.price?.toLocaleString()}
                        </motion.p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-gray-100 dark:bg-dark-700 rounded-xl overflow-hidden shadow-inner">
                        <motion.button 
                          onClick={() => decreaseQuantity(item.id)} 
                          className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                          disabled={item.quantity <= 1}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <motion.span 
                          className="px-5 font-bold text-gray-900 dark:text-white min-w-[50px] text-center text-lg"
                          key={item.quantity}
                          initial={{ scale: 1.3, color: "#6366f1" }}
                          animate={{ scale: 1, color: "inherit" }}
                        >
                          {item.quantity}
                        </motion.span>
                        <motion.button 
                          onClick={() => addToCart(item)} 
                          className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                      
                      {/* Remove Button */}
                      <motion.button 
                        onClick={() => removeFromCart(item.id)} 
                        className="p-3 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shadow-lg shadow-red-500/10"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Checkout Box */}
          <motion.div 
            initial={{ opacity: 0, x: 50, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.3 }}
            className="lg:w-[420px]"
            style={{ perspective: "1000px" }}
          >
            <div className="relative">
              {/* Animated glow border */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 rounded-[28px] blur-lg opacity-30"
                animate={{ 
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="relative bg-white/95 dark:bg-dark-800/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 sticky top-24">
                <motion.h2 
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Order Summary
                </motion.h2>
                
                {/* Verification Warning */}
                {user && !user.emailVerified && (
                  <motion.div 
                    className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl mb-6 flex items-start gap-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0"/>
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Account Not Verified</p>
                      <p className="text-xs text-amber-700 dark:text-amber-500/80">Please verify your email to place orders.</p>
                    </div>
                  </motion.div>
                )}

                {/* Price Summary */}
                <motion.div 
                  className="space-y-4 text-gray-600 dark:text-gray-400 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900 dark:text-white">৳{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Shipping
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">৳120</span>
                  </div>
                  <motion.div 
                    className="border-t-2 border-gray-100 dark:border-white/10 pt-4 flex justify-between text-xl font-bold text-gray-900 dark:text-white"
                    animate={{ scale: [1, 1.01, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent text-2xl">
                      ৳{(cartTotal + 120).toLocaleString()}
                    </span>
                  </motion.div>
                </motion.div>
                
                {/* Form Fields */}
                <motion.div 
                  className="space-y-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <motion.input 
                      type="tel" 
                      placeholder="017..." 
                      className="w-full p-4 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Shipping Address</label>
                    <motion.textarea 
                      rows="3" 
                      placeholder="Enter your full address..." 
                      className="w-full p-4 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all resize-none" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>

                  {/* Payment Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button 
                        onClick={() => setPaymentMethod("cod")}
                        className={paymentButtonClass("cod", paymentMethod === "cod")}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Banknote className="w-6 h-6"/> 
                        Cash on Delivery
                      </motion.button>
                      <motion.button 
                        onClick={() => setPaymentMethod("bkash")}
                        className={paymentButtonClass("bkash", paymentMethod === "bkash")}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <CreditCard className="w-6 h-6"/> 
                        bKash
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Checkout Button */}
                <motion.button 
                  className={"relative w-full py-5 rounded-2xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden " + 
                    (paymentMethod === "bkash" 
                      ? "bg-[#E2136E] shadow-xl shadow-[#E2136E]/30" 
                      : "bg-gradient-to-r from-gray-900 to-gray-800 dark:from-primary-600 dark:to-accent-500 shadow-xl shadow-gray-900/30 dark:shadow-primary-500/30"
                    )
                  }
                  onClick={handleCheckout}
                  disabled={isCheckingOut || loadingProfile}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  animate={!isCheckingOut ? { 
                    boxShadow: [
                      "0 20px 40px -15px rgba(99,102,241,0.3)",
                      "0 20px 40px -15px rgba(236,72,153,0.3)",
                      "0 20px 40px -15px rgba(99,102,241,0.3)"
                    ]
                  } : {}}
                  transition={!isCheckingOut ? { duration: 2, repeat: Infinity } : {}}
                >
                  {/* Animated shine effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  
                  {isCheckingOut ? (
                    <>
                      <motion.div 
                        className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="relative">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 relative" />
                      <span className="relative">{paymentMethod === "bkash" ? "Pay & Confirm" : "Place Order"}</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5 relative" />
                      </motion.div>
                    </>
                  )}
                </motion.button>

                {/* Trust Badges */}
                <motion.div 
                  className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { icon: Shield, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20", label: "Secure" },
                      { icon: Truck, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20", label: "Fast Delivery" },
                      { icon: Package, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20", label: "Quality" }
                    ].map((badge, i) => (
                      <motion.div 
                        key={badge.label}
                        className="p-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + i * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <motion.div 
                          className={`w-10 h-10 ${badge.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                        >
                          <badge.icon className={`w-5 h-5 ${badge.color}`} />
                        </motion.div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{badge.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart;