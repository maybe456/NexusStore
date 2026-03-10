// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Search, User, Camera, LogOut, 
  LayoutDashboard, Settings, Menu, X, ChevronDown,
  Sparkles, Sun, Moon
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useMobileView } from "../context/MobileViewContext";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { analyzeImageForSearch } from "../lib/gemini";
import { fetchCategories } from "../lib/categories";

const Navbar = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const { isMobileViewEnabled, toggleMobileView, isActualMobile } = useMobileView();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [categoryTree, setCategoryTree] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // User Data State
  const [username, setUsername] = useState("Profile");
  const [role, setRole] = useState("user"); 
  
  const dropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories for AI detection
  useEffect(() => {
    const loadCategories = async () => {
      const categories = await fetchCategories();
      setCategoryTree(categories);
    };
    loadCategories();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync search input with URL
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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
        navigate("/shop?search=" + searchQuery.trim());
      } else {
        navigate("/shop");
      }
      setIsSearchFocused(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeImageForSearch(file, categoryTree);
      setTimeout(() => {
        navigate("/shop?category=" + result.category + "&search=" + result.subCategory);
        setIsAnalyzing(false);
      }, 2000); 
    } catch (error) {
      console.error("Visual Search Error:", error);
      alert("AI could not identify this image.");
      setIsAnalyzing(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const navClasses = "fixed top-0 left-0 right-0 z-50 transition-all duration-300 " + (
    isScrolled 
      ? "bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl shadow-soft border-b border-gray-100/50 dark:border-white/5" 
      : "bg-white/60 dark:bg-dark-950/60 backdrop-blur-md"
  );

  const searchContainerClasses = "relative flex items-center w-full rounded-2xl transition-all duration-300 desktop-search " + (
    isAnalyzing 
      ? "bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 border-2 border-primary-200 dark:border-primary-500/30" 
      : "bg-gray-50/80 dark:bg-dark-800/80 border border-gray-200/60 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
  );

  const searchIconClasses = "absolute left-4 w-5 h-5 transition-colors duration-300 " + (
    isAnalyzing ? "text-primary-500 animate-pulse" : isSearchFocused ? "text-primary-500" : "text-gray-400"
  );

  const cameraLabelClasses = "absolute right-2 p-2 rounded-xl cursor-pointer transition-all duration-300 " + (
    isAnalyzing 
      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 animate-pulse" 
      : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
  );

  const shopLinkClasses = "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 " + (
    location.pathname === "/shop" 
      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" 
      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
  );

  const userMenuClasses = "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 " + (
    isDropdownOpen 
      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" 
      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
  );

  const chevronClasses = "w-4 h-4 transition-transform duration-200 " + (isDropdownOpen ? "rotate-180" : "");

  const roleClasses = "text-xs mt-1 font-medium " + (role === 'admin' ? "text-accent-600" : "text-gray-500");

  const mobileSearchClasses = "relative flex items-center rounded-xl transition-all " + (
    isAnalyzing 
      ? "bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 border-2 border-primary-200 dark:border-primary-500/30" 
      : "bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-white/10"
  );

  const mobileShopLinkClasses = "block px-4 py-3 rounded-xl font-medium transition-colors " + (
    location.pathname === "/shop" 
      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" 
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
  );

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={navClasses}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/25"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gradient hidden sm:block">
                NexusStore
              </span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <motion.div 
                animate={{ 
                  scale: isSearchFocused ? 1.02 : 1,
                  boxShadow: isSearchFocused 
                    ? "0 10px 40px -10px rgba(99, 102, 241, 0.3)" 
                    : "0 2px 15px -3px rgba(0, 0, 0, 0.07)"
                }}
                className={searchContainerClasses}
              >
                <Search className={searchIconClasses} />
                
                <input 
                  type="text" 
                  placeholder={isAnalyzing ? "AI analyzing your image..." : "Search products..."}
                  className="w-full bg-transparent pl-12 pr-12 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  disabled={isAnalyzing}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                
                <label className={cameraLabelClasses}>
                  <Camera className="w-5 h-5" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload} 
                    disabled={isAnalyzing} 
                  />
                </label>
              </motion.div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/shop" className={shopLinkClasses}>
                Shop
              </Link>
              
              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-200"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              
              {/* Cart Button */}
              <Link 
                to="/cart" 
                className="relative p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-200 group"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-full shadow-lg"
                    >
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              
              {/* User Menu */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className={userMenuClasses}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm font-medium max-w-[100px] truncate">{username}</span>
                    <ChevronDown className={chevronClasses} />
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white/90 dark:bg-dark-800/95 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-gray-100 dark:border-white/10 py-2 overflow-hidden z-50"
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-dark-700/50 dark:to-dark-800/50 border-b border-gray-100 dark:border-white/5">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user.email}</p>
                          <p className={roleClasses}>
                            {role === 'admin' ? "✦ Administrator" : "Customer"}
                          </p>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          <Link 
                            to="/dashboard" 
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" 
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-gray-400 dark:text-gray-500" /> 
                            <span>Dashboard</span>
                          </Link>
                          
                          {role === "admin" && (
                            <Link 
                              to="/admin" 
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 font-medium transition-colors" 
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <Settings className="w-4 h-4" /> 
                              <span>Admin Panel</span>
                            </Link>
                          )}
                        </div>
                        
                        {/* Logout */}
                        <div className="border-t border-gray-100 dark:border-white/5 pt-2">
                          <button 
                            onClick={handleLogout} 
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> 
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {/* Mobile Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
              
              {/* Mobile Cart */}
              <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300">
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </Link>
              
              {/* Hamburger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-4">
                {/* Mobile Search */}
                <div className={mobileSearchClasses}>
                  <Search className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input 
                    type="text" 
                    placeholder={isAnalyzing ? "AI analyzing..." : "Search..."}
                    className="w-full bg-transparent pl-10 pr-12 py-3 text-sm text-gray-900 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={isAnalyzing}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                  />
                  <label className="absolute right-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition cursor-pointer">
                    <Camera className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isAnalyzing} />
                  </label>
                </div>

                {/* Mobile Nav Links */}
                <div className="space-y-1">
                  <Link to="/shop" className={mobileShopLinkClasses}>
                    Shop
                  </Link>
                  
                  {user ? (
                    <>
                      <Link to="/dashboard" className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        Dashboard
                      </Link>
                      {role === "admin" && (
                        <Link to="/admin" className="block px-4 py-3 rounded-xl text-accent-600 dark:text-accent-400 font-medium hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors">
                          Admin Panel
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      className="block px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center font-medium"
                    >
                      Login / Sign Up
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-18" />
    </>
  );
};

export default Navbar;
