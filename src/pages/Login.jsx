// src/pages/Login.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Phone, Mail, BadgeCheck, AlertTriangle, ArrowRight, Sparkles, ArrowLeft, KeyRound, Zap, Shield } from "lucide-react";
import { ScatteredFloatingIcons } from "../components/Interactive3D";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [adminSecret, setAdminSecret] = useState(""); 
  
  const navigate = useNavigate();

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') setError("No account found with this email.");
      else if (err.code === 'auth/invalid-email') setError("Please enter a valid email address.");
      else setError("Error: " + err.message);
    }
    setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC (STRICT) ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 1. Force a check with the server to see if they clicked the link
        await user.reload(); 

        // 2. THE STRICT CHECK: If not verified, KICK THEM OUT.
        if (!user.emailVerified) {
           await signOut(auth); // Logout immediately
           setError("Email not verified! Please check your inbox and click the link.");
           setLoading(false);
           return; // Stop execution here
        }

        // 3. Only if verified, proceed to dashboard
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }

      } else {
        // --- SIGN UP LOGIC ---
        
        // 1. Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Send Verification Link
        await sendEmailVerification(user);
        
        // 3. Save Profile
        const role = (adminSecret && adminSecret.trim() === "admin123") ? "admin" : "user";
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: email,
          username: username,
          phone: phone,
          role: role, 
          createdAt: new Date(),
          cart: [] 
        });

        // 4. CRITICAL: Sign Out immediately. Do not allow auto-login.
        await signOut(auth);
        
        // 5. Show Success Screen
        setVerificationSent(true);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError("Email already exists.");
      else if (err.code === 'auth/weak-password') setError("Password must be at least 6 characters.");
      else if (err.code === 'auth/invalid-credential') setError("Invalid email or password.");
      else setError("Error: " + err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Google accounts are auto-verified, so we don't need the check here
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          username: result.user.displayName || "User",
          phone: "",
          role: "user",
          createdAt: new Date(),
          cart: []
        });
      }
      
      const role = userSnap.exists() ? userSnap.data().role : "user";
      navigate(role === "admin" ? "/admin" : "/dashboard");

    } catch (err) {
      setError(err.message);
    }
  };

  // Password Reset Email Sent Screen
  if (resetEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900 px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 -left-20 w-96 h-96 bg-amber-300/30 dark:bg-amber-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 -right-20 w-80 h-80 bg-orange-300/30 dark:bg-orange-500/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="relative"
        >
          {/* Glow border */}
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-[28px] blur-lg opacity-30"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="relative bg-white/90 dark:bg-dark-800/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-100 dark:border-white/10">
            <motion.div 
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/40"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <KeyRound className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.h2 
              className="text-3xl font-bold mb-3 text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Reset Link Sent!
            </motion.h2>
            <motion.p 
              className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              We sent a password reset link to:<br/>
              <span className="font-bold text-gray-800 dark:text-white">{email}</span>
            </motion.p>
            
            <motion.div 
              className="bg-gray-50 dark:bg-dark-700 rounded-2xl p-5 mb-6 text-left space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                "Check your inbox (and spam)",
                "Click the reset link",
                "Create a new password"
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <motion.span 
                    className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold"
                    whileHover={{ scale: 1.2 }}
                  >
                    {i + 1}
                  </motion.span>
                  {step}
                </motion.div>
              ))}
            </motion.div>
            
            <motion.button 
              onClick={() => { setResetEmailSent(false); setShowForgotPassword(false); }} 
              className="relative w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-bold shadow-xl overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative">Back to Login</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Verification Sent Success Screen
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900 px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 -left-20 w-96 h-96 bg-green-300/30 dark:bg-green-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 -right-20 w-80 h-80 bg-emerald-300/30 dark:bg-emerald-500/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Confetti-like particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: i % 2 === 0 ? '#22c55e' : '#10b981',
                left: `${10 + i * 10}%`,
                top: `${30 + (i % 3) * 20}%`,
                opacity: 0.4
              }}
              animate={{
                y: [0, -50, 0],
                x: [0, i % 2 === 0 ? 20 : -20, 0],
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="relative"
        >
          {/* Glow border */}
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-[28px] blur-lg opacity-30"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="relative bg-white/90 dark:bg-dark-800/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-100 dark:border-white/10">
            <motion.div 
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/40"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <BadgeCheck className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.h2 
              className="text-3xl font-bold mb-3 text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Verification Sent!
            </motion.h2>
            <motion.p 
              className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              We sent a verification link to:<br/>
              <span className="font-bold text-gray-800 dark:text-white">{email}</span>
            </motion.p>
            
            <motion.div 
              className="bg-gray-50 dark:bg-dark-700 rounded-2xl p-5 mb-6 text-left space-y-3"
              initial={{ opacity: 0, y: 10  }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                "Check your inbox (and spam)",
                "Click the verification link",
                "Return here and login"
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <motion.span 
                    className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold"
                    whileHover={{ scale: 1.2 }}
                  >
                    {i + 1}
                  </motion.span>
                  {step}
                </motion.div>
              ))}
            </motion.div>
            
            <motion.button 
              onClick={() => window.location.reload()} 
              className="relative w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-bold shadow-xl overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative">Back to Login</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Forgot Password Screen
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 px-4 py-10 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 -left-20 w-96 h-96 bg-amber-300/30 dark:bg-amber-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 -right-20 w-80 h-80 bg-orange-300/30 dark:bg-orange-500/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Floating key particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-amber-500/30 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${25 + (i % 3) * 20}%`
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 3 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="relative"
        >
          {/* Glow border */}
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-[28px] blur-lg opacity-30"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="relative bg-white/90 dark:bg-dark-800/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-white/10">
            <motion.button 
              onClick={() => { setShowForgotPassword(false); setError(""); }}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold mb-6 group transition-colors"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform" />
              Back to Login
            </motion.button>
            
            <motion.div 
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/40"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <KeyRound className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.h2 
              className="text-2xl font-bold mb-2 text-gray-900 dark:text-white text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Forgot Password?
            </motion.h2>
            <motion.p 
              className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              No worries! Enter your email and we'll send you a reset link.
            </motion.p>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm flex items-start gap-3 border border-red-100 dark:border-red-500/20"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5"/> 
                  </motion.div>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <motion.div 
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                <motion.input 
                  type="email" 
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email address" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400" 
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  required 
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.div>
              
              <motion.button 
                disabled={loading} 
                className="relative w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-5 rounded-2xl font-bold shadow-xl shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Shine effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                
                {loading ? (
                  <>
                    <motion.div 
                      className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="relative">Sending...</span>
                  </>
                ) : (
                  <>
                    <span className="relative">Send Reset Link</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 relative" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabClass = (active) => {
    return "flex-1 py-3 rounded-xl font-semibold text-sm transition-all " + (active ? "bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 px-4 py-10 relative overflow-hidden">
      {/* Scattered floating icons */}
      <ScatteredFloatingIcons density="sparse" />
      
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 -left-20 w-96 h-96 bg-primary-300/30 dark:bg-primary-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 -right-20 w-80 h-80 bg-accent-300/30 dark:bg-accent-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-500/30 dark:bg-primary-400/20 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="relative"
      >
        {/* Animated glow border */}
        <motion.div 
          className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 rounded-[28px] blur-lg opacity-30"
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <div className="relative bg-white/90 dark:bg-dark-800/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-white/10">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <motion.span 
              className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              NexusStore
            </motion.span>
          </Link>
          
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-dark-700/50 rounded-2xl p-1.5 mb-8">
            <motion.button 
              onClick={() => setIsLogin(true)} 
              className={tabClass(isLogin)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
            <motion.button 
              onClick={() => setIsLogin(false)} 
              className={tabClass(!isLogin)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Up
            </motion.button>
          </div>
          
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm flex items-start gap-3 border border-red-100 dark:border-red-500/20"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                </motion.div>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-4" autoComplete="on">
            
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <motion.div 
                    className="relative group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                    <motion.input 
                      type="text" 
                      name="username"
                      autoComplete="username"
                      placeholder="Username" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400" 
                      value={username} 
                      onChange={(e)=>setUsername(e.target.value)} 
                      required
                      whileFocus={{ scale: 1.02 }}
                    />
                  </motion.div>
                  <motion.div 
                    className="relative group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                    <motion.input 
                      type="tel" 
                      name="phone"
                      autoComplete="tel"
                      placeholder="Phone Number" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400" 
                      value={phone} 
                      onChange={(e)=>setPhone(e.target.value)} 
                      required
                      whileFocus={{ scale: 1.02 }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          <motion.div 
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
            <motion.input 
              type="email" 
              name="email"
              autoComplete="email"
              placeholder="Email Address" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400" 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
              required
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>
          <motion.div 
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
            <motion.input 
              type="password" 
              name="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="Password" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400" 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
              required
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>
          
          {!isLogin && (
            <motion.div 
              className="pt-4 border-t border-gray-100 dark:border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2 font-bold uppercase tracking-wider">Admin Access (Optional)</label>
              <input 
                type="text" 
                placeholder="Enter Secret Code" 
                className="w-full p-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-sm bg-gray-50 dark:bg-dark-700 focus:outline-none focus:border-primary-500 transition-colors text-gray-900 dark:text-white placeholder:text-gray-400" 
                value={adminSecret} 
                onChange={(e)=>setAdminSecret(e.target.value)} 
              />
            </motion.div>
          )}

          {isLogin && (
            <div className="text-right -mt-2 mb-2">
              <motion.button 
                type="button"
                onClick={() => { setShowForgotPassword(true); setError(""); }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold"
                whileHover={{ scale: 1.05, x: 3 }}
              >
                Forgot Password?
              </motion.button>
            </div>
          )}

          <motion.button 
            disabled={loading} 
            className="relative w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Animated shine effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ x: ["-200%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            
            {loading ? (
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
                <Zap className="w-5 h-5 relative" />
                <span className="relative">{isLogin ? "Login" : "Create Account"}</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 relative" />
                </motion.div>
              </>
            )}
          </motion.button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-dark-800 px-4 text-gray-400 font-medium">or continue with</span>
          </div>
        </div>

        <motion.button 
          onClick={handleGoogleLogin} 
          className="w-full bg-white dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold hover:border-gray-300 dark:hover:border-white/20 transition-all flex items-center justify-center gap-3 shadow-lg"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </motion.button>
        
        {/* Trust badges */}
        <motion.div 
          className="flex justify-center gap-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Shield className="w-4 h-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Zap className="w-4 h-4" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Easy</span>
          </div>
        </motion.div>
        
        {/* Info text */}
        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
