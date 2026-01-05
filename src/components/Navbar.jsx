// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCart, Search, User, Camera, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { analyzeImageForSearch } from "../lib/gemini"; 

const Navbar = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  // User Data State
  const [username, setUsername] = useState("Profile");
  const [role, setRole] = useState("user"); 
  
  const dropdownRef = useRef(null);

  // Sync search input with URL
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Fetch User Data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUsername(data.username || "User");
            setRole(data.role || "user");
          }
        } catch (error) { console.error(error); }
      } else {
        setUsername("Profile");
        setRole("user");
      }
    };
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      if (searchQuery.trim()) {
        navigate(`/shop?search=${searchQuery.trim()}`);
      } else {
        navigate("/shop");
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeImageForSearch(file);
      // Delay to show the effect
      setTimeout(() => {
        alert(`AI Detected: ${result.subCategory} (${result.category})`);
        navigate(`/shop?category=${result.category}&search=${result.subCategory}`);
        setIsAnalyzing(false);
      }, 2000); 
    } catch (error) {
      console.error("Visual Search Error:", error);
      alert("AI could not identify this image.");
      setIsAnalyzing(false);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* CUSTOM ANIMATION STYLES */}
      <style>{`
        @keyframes rainbow-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .analyzing-ring {
          border: 2px solid transparent; /* Thinner border for subtlety */
          border-radius: 9999px;
          background: 
            linear-gradient(#f3f4f6, #f3f4f6) padding-box,
            linear-gradient(90deg, #ff9a9e, #fad0c4, #fbc2eb, #a18cd1, #8fd3f4, #84fab0) border-box; /* Softer pastel gradient */
          background-size: 200% 200%;
          animation: rainbow-move 4s ease infinite; /* Slower animation (4s) */
        }
      `}</style>

      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        <Link to="/" className="text-2xl font-bold text-blue-600">NexusStore</Link>

        {/* SEARCH BAR */}
        <div 
          className={`hidden md:flex items-center px-4 py-2 w-1/3 transition-all relative ${
            isAnalyzing 
              ? "analyzing-ring" 
              : "bg-gray-100 rounded-full border focus-within:border-blue-500"
          }`}
        >
          {/* STATIC ICON THAT PULSES COLOR */}
          <Search className={`${isAnalyzing ? "text-purple-600 animate-pulse" : "text-gray-500"} w-5 h-5 transition-colors duration-500`} />
          
          <input 
            type="text" 
            placeholder={isAnalyzing ? "AI is analyzing image..." : "Search keyword..."}
            className="bg-transparent border-none outline-none ml-2 w-full text-gray-700 placeholder-gray-400"
            disabled={isAnalyzing}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit} 
          />
          
          <label className={`cursor-pointer p-2 rounded-full hover:bg-gray-200 transition ${isAnalyzing ? 'animate-pulse text-purple-600' : 'text-gray-500'}`}>
            <Camera className="w-5 h-5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isAnalyzing} />
          </label>
        </div>

        {/* ICONS */}
        <div className="flex items-center space-x-6">
          <Link to="/shop" className="hidden md:block font-medium text-gray-600 hover:text-blue-600">Shop</Link>
          
          <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition">
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition focus:outline-none">
                <User className="w-6 h-6" />
                <span className="hidden md:inline font-medium text-sm max-w-[100px] truncate">{username}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-2 animate-fade-in-up">
                  <div className="px-4 py-2 border-b bg-gray-50">
                    <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                    <p className={`text-xs capitalize mt-1 ${role === 'admin' ? "text-purple-600 font-bold" : "text-gray-500"}`}>{role === 'admin' ? "Administrator" : "Customer"}</p>
                  </div>
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition" onClick={() => setIsDropdownOpen(false)}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  {role === "admin" && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-purple-600 hover:bg-purple-50 font-semibold transition" onClick={() => setIsDropdownOpen(false)}>
                      <Settings className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <div className="border-t mt-1">
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <User className="w-6 h-6" />
              <span className="hidden md:inline font-medium">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;