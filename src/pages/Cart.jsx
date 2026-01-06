// src/pages/Cart.jsx
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, AlertTriangle, CreditCard, Banknote } from "lucide-react";

const Cart = () => {
  const { cart, removeFromCart, addToCart, decreaseQuantity, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' or 'bkash'

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
        // 1. Basic Login Check
        if (!user) { alert("Please login!"); navigate("/login"); return; }

        // 2. Security: Check Email Verification
        try { await user.reload(); } catch (e) { console.log("Reload error", e); }
        if (!user.emailVerified) {
            alert("⚠️ Account Not Verified.\nPlease verify your email before placing an order.");
            return;
        }

        // 3. Validation: Address & Phone
        if (!phone || phone.trim() === "") {
            alert("⚠️ Phone Number Missing. Required for delivery.");
            return;
        }
        if (!address.trim()) { alert("Please enter shipping address."); return; }

        // --- PAYMENT PROCESSING START ---
        let finalPaymentStatus = "Pending (COD)";
        let finalPaymentMethod = "Cash on Delivery";

        // IF USER SELECTED BKASH
        if (paymentMethod === "bkash") {
            const amount = cartTotal + 120;

            // A. Show Instructions
            const confirmMsg = `PAYMENT INSTRUCTIONS:\n\n1. Open bKash App -> 'Send Money'\n2. Send ৳${amount} to: 017XXXXXXXX (Personal)\n3. Copy the TrxID.\n\nClick OK to enter the TrxID.`;

            if (!window.confirm(confirmMsg)) return; // User clicked Cancel

            // B. Ask for TrxID
            const trxId = window.prompt("Enter the 10-digit bKash TrxID:");

            if (!trxId) return; // User pressed Cancel on prompt

            // C. STRICT VALIDATION (The Fix)
            // This checks if it is exactly 10 characters, only Letters & Numbers (No spaces, no symbols)
            const isValidFormat = /^[A-Za-z0-9]{10}$/.test(trxId);

            if (!isValidFormat) {
                alert("❌ INVALID TRX-ID!\n\nA valid bKash TrxID must be exactly 10 characters long and contain only letters and numbers.");
                return; // Stop the checkout
            }

            // If valid, format it properly
            finalPaymentMethod = `bKash (TrxID: ${trxId.toUpperCase()})`;
            finalPaymentStatus = "Verify TrxID";
        }
        // --- PAYMENT PROCESSING END ---

        setIsCheckingOut(true);

        try {
            // 4. Save User Info
            await setDoc(doc(db, "users", user.uid), {
                address: address,
                phone: phone
            }, { merge: true });

            // 5. Create the Order
            const orderData = {
                userId: user.uid,
                userEmail: user.email,
                userPhone: phone,
                items: cart,
                totalAmount: cartTotal + 120,
                address: address,
                status: "Pending",
                // Use the variables we set above
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
        {/* Cart Items */}
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

        {/* Checkout Box */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Checkout Details</h2>
            
            {user && !user.emailVerified && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4 text-sm text-red-800 flex items-start gap-2">
                 <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                 <span><strong>Not Verified.</strong> Verify email to order.</span>
              </div>
            )}

            <div className="space-y-3 text-gray-600 mb-6">
              <div className="flex justify-between"><span>Subtotal</span><span>৳{cartTotal}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>৳120</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-gray-800 text-lg"><span>Total</span><span>৳{cartTotal + 120}</span></div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" placeholder="017..." className="w-full p-3 border rounded-lg outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                <textarea rows="3" placeholder="Address..." className="w-full p-3 border rounded-lg outline-none" value={address} onChange={(e) => setAddress(e.target.value)}></textarea>
              </div>

              {/* PAYMENT SELECTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 transition ${paymentMethod === 'cod' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Banknote className="w-5 h-5"/> Cash on Delivery
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("bkash")}
                    className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 transition ${paymentMethod === 'bkash' ? 'bg-[#E2136E] text-white border-[#E2136E]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-1"><CreditCard className="w-5 h-5"/> bKash (Personal)</div>
                  </button>
                </div>
              </div>
            </div>

            <button 
              className={`w-full py-3 rounded-lg font-bold text-white transition disabled:bg-gray-400 ${paymentMethod === 'bkash' ? 'bg-[#E2136E] hover:bg-[#c20f5e]' : 'bg-gray-900 hover:bg-gray-800'}`}
              onClick={handleCheckout}
              disabled={isCheckingOut || loadingProfile}
            >
              {isCheckingOut ? "Processing..." : paymentMethod === 'bkash' ? "Pay & Confirm" : "Place Order (COD)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;