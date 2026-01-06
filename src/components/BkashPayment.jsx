import { useState } from "react";
import { X } from "lucide-react";

const BkashPayment = ({ amount, onSuccess, onClose }) => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: PIN
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => {
    setLoading(true);
    setError("");
    
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      if (step === 1) setStep(2);
      else if (step === 2) setStep(3);
      else if (step === 3) onSuccess(); // Payment "Success"
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-white w-full max-w-[350px] overflow-hidden shadow-2xl rounded-sm relative">
        
        {/* bKash Header */}
        <div className="bg-[#E2136E] p-3 sm:p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <img 
               src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" 
               alt="bKash" 
               className="h-6 sm:h-8 bg-white rounded p-0.5" 
            />
            <span className="text-xs sm:text-sm opacity-90">Merchant Payment</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Invoice Info */}
        <div className="bg-gray-100 p-2 sm:p-3 flex justify-between text-xs sm:text-sm border-b">
          <span className="text-gray-600">NexusStore</span>
          <span className="font-bold text-gray-800">৳{amount}</span>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 py-6 sm:py-8">
          
          {/* STEP 1: Phone Number */}
          {step === 1 && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-center text-gray-600 text-xs sm:text-sm">Enter your bKash Account Number</p>
              <input 
                type="text" 
                placeholder="e.g 017..." 
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded focus:border-[#E2136E] focus:ring-1 focus:ring-[#E2136E] outline-none text-center text-base sm:text-lg tracking-widest bg-gray-50"
              />
              <p className="text-[10px] sm:text-xs text-center text-gray-400">By continuing, you agree to the <span className="underline">terms</span>.</p>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-center text-gray-600 text-xs sm:text-sm">Enter Verification Code</p>
              <p className="text-center text-[10px] sm:text-xs text-gray-400 mb-2">Sent to 017XXXXXX</p>
              <input 
                type="text" 
                placeholder="1 2 3 4 5 6" 
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded focus:border-[#E2136E] focus:ring-1 focus:ring-[#E2136E] outline-none text-center text-base sm:text-lg tracking-[8px] sm:tracking-[10px]"
              />
            </div>
          )}

          {/* STEP 3: PIN */}
          {step === 3 && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-center text-gray-600 text-xs sm:text-sm">Enter bKash PIN</p>
              <input 
                type="password" 
                placeholder="*****" 
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded focus:border-[#E2136E] focus:ring-1 focus:ring-[#E2136E] outline-none text-center text-base sm:text-lg tracking-[6px] sm:tracking-[8px]"
              />
            </div>
          )}

        </div>

        {/* FOOTER BUTTONS */}
        <div className="bg-gray-50 p-3 sm:p-4 grid grid-cols-2 gap-3 sm:gap-4 border-t">
          <button 
            onClick={onClose}
            className="w-full py-2 text-gray-500 font-bold text-xs sm:text-sm uppercase hover:text-gray-700"
          >
            Close
          </button>
          <button 
            onClick={handleNext} 
            disabled={loading}
            className="w-full py-2 bg-[#E2136E] text-white font-bold text-xs sm:text-sm uppercase rounded shadow hover:bg-[#c20f5e] disabled:opacity-50 flex justify-center"
          >
            {loading ? "..." : "Confirm"}
          </button>
        </div>

        {/* Watermark */}
        <div className="text-center p-2">
          <img src="https://freelogopng.com/images/all_img/1656235199bkash-logo-transparent.png" className="h-4 sm:h-5 mx-auto opacity-30 grayscale" alt="" />
        </div>
      </div>
    </div>
  );
};

export default BkashPayment;