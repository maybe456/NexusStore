// src/pages/Cart.jsx
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, AlertTriangle } from "lucide-react";

const Cart = () => {
  const { cart, removeFromCart, addToCart, decreaseQuantity, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

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
    
    // --- SECURITY CHECK START ---
    
    // 1. Force refresh user data from server (Critical for Verification)
    try {
      await user.reload(); 
    } catch (e) {
      console.log("Error reloading user status", e);
    }

    // 2. Check Verification Status
    if (!user.emailVerified) {
      alert("⚠️ Security Alert\n\nYour email address has NOT been verified.\nPlease check your inbox for the verification link or go to your Dashboard to resend it.");
      navigate("/dashboard");
      return;
    }

    // 3. Check Phone
    if (!phone || phone.trim() === "") {
      alert("⚠️ Contact Info Missing\n\nA phone number is required for delivery. Please enter it below.");
      return;
    }

    if (!address.trim()) { alert("Please enter shipping address."); return; }
    // --- SECURITY CHECK END ---

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
        paymentStatus: "Pending (COD)",
        createdAt: new Date(),
        paymentMethod: "Cash on Delivery"
      };

      await addDoc(collection(db, "orders"), orderData);
      clearCart();
      navigate("/success");
    } catch (error) {
      console.error(error);
      alert("Checkout failed.");
    }
    setIsCheckingOut(false);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
        <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border gap-4">
              <div className="flex items-center space-x-4">
                <img src={item.image} alt={item.title} className="w-20 h-20 bg-gray-100 rounded-md object-cover" />
                <div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-blue-600 font-bold mt-1">৳{item.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center border rounded-lg bg-gray-50">
                  <button onClick={() => decreaseQuantity(item.id)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-l-lg disabled:opacity-50" disabled={item.quantity <= 1}><Minus className="w-4 h-4" /></button>
                  <span className="px-4 font-semibold text-gray-800 w-8 text-center">{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-lg"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
            
            {/* Warning Visual */}
            {user && !user.emailVerified && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4 text-sm text-red-800 flex items-start gap-2">
                 <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                 <span><strong>Account Not Verified.</strong> You cannot place an order until you verify your email.</span>
              </div>
            )}

            <div className="space-y-3 text-gray-600 mb-6">
              <div className="flex justify-between"><span>Subtotal</span><span>৳{cartTotal}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>৳120</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-gray-800 text-lg"><span>Total</span><span>৳{cartTotal + 120}</span></div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Required)</label>
                <input type="tel" placeholder="017..." className={`w-full p-3 border rounded-lg outline-none ${!phone && "border-red-300 ring-1 ring-red-100"}`} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                <textarea rows="3" placeholder="Address..." className="w-full p-3 border rounded-lg outline-none" value={address} onChange={(e) => setAddress(e.target.value)}></textarea>
              </div>
            </div>

            <button 
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400"
              onClick={handleCheckout}
              disabled={isCheckingOut || loadingProfile}
            >
              {isCheckingOut ? "Processing..." : "Place Order (COD)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;