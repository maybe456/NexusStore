// src/pages/Login.jsx
import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendEmailVerification,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { User, Lock, Phone, Mail, BadgeCheck, AlertTriangle } from "lucide-react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [adminSecret, setAdminSecret] = useState(""); 
  
  const navigate = useNavigate();

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

  if (verificationSent) {
    return (
      <div className="flex items-center justify-center h-[80vh] bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md w-96 text-center border border-green-100">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BadgeCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Verification Sent!</h2>
          <p className="text-gray-600 mb-6 text-sm">
            We have sent a secure link to:<br/>
            <span className="font-bold text-gray-800">{email}</span>
            <br/><br/>
            1. Check your email (and spam).<br/>
            2. Click the verification link.<br/>
            3. Come back here and login.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-gray-50 py-10">
      <div className="bg-white p-8 rounded-xl shadow-md w-96 border">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? "Login to Nexus" : "Create Account"}
        </h2>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-xs flex items-start gap-2 border border-red-100">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5"/> 
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Username" className="w-full pl-10 p-3 border rounded focus:outline-blue-500" value={username} onChange={(e)=>setUsername(e.target.value)} required />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input type="tel" placeholder="Phone Number" className="w-full pl-10 p-3 border rounded focus:outline-blue-500" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input type="email" placeholder="Email Address" className="w-full pl-10 p-3 border rounded focus:outline-blue-500" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input type="password" placeholder="Password" className="w-full pl-10 p-3 border rounded focus:outline-blue-500" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          
          {!isLogin && (
            <div className="pt-2 border-t mt-2">
              <label className="text-xs text-gray-500 block mb-1">Admin Access (Optional)</label>
              <input type="text" placeholder="Enter Secret Code" className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-sm" value={adminSecret} onChange={(e)=>setAdminSecret(e.target.value)} />
            </div>
          )}

          <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-400">
            {loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>

        <div className="mt-4">
          <button onClick={handleGoogleLogin} className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
             Sign in with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "New here?" : "Already have an account?"} 
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold ml-1 hover:underline">
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;