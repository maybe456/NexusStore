// src/pages/Shop.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Star, Filter, X, ShoppingBag, Sparkles, Zap, TrendingUp } from "lucide-react";
import { fetchCategories } from "../lib/categories";
import { ScatteredFloatingIcons } from "../components/Interactive3D";

// Helper to calculate average rating from reviews
const calculateAverageRating = (reviews, productId) => {
  const productReviews = reviews.filter(r => r.productId === productId);
  if (productReviews.length === 0) return "0.0";
  const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  return avg.toFixed(1);
};

// Animation variants
const sidebarVariants = {
  hidden: { opacity: 0, x: -100, scale: 0.9 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 10 }
  }
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);

  // Filter States
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 }); // High default, will be adjusted after products load
  const [maxProductPrice, setMaxProductPrice] = useState(100000000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");

  // Fetch Data
  useEffect(() => {
    const fetchProductsAndReviews = async () => {
      // Fetch products, reviews, and categories in parallel
      const [productsSnap, reviewsSnap, categoryTree] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "reviews")),
        fetchCategories()
      ]);
      
      // Set categories from Firestore
      setCategories(Object.keys(categoryTree));
      
      const reviews = reviewsSnap.docs.map(doc => doc.data());
      
      const items = productsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Calculate actual average rating from reviews
          rating: calculateAverageRating(reviews, doc.id)
        };
      });
      setProducts(items);
      
      // Calculate and set max price from products
      if (items.length > 0) {
        const highestPrice = Math.max(...items.map(p => p.price || 0));
        setMaxProductPrice(highestPrice);
        setPriceRange(prev => ({ ...prev, max: highestPrice }));
      }
      
      setLoading(false);
    };
    fetchProductsAndReviews();
  }, []);

  // Sync URL
  useEffect(() => {
    const catFromUrl = searchParams.get("category");
    if (catFromUrl) setSelectedCategory(catFromUrl);
    else setSelectedCategory("All");
  }, [searchParams]);

  // Filtering Engine
  useEffect(() => {
    let result = products;

    // Search
    const query = searchParams.get("search");
    if (query) {
      const lowerQ = query.toLowerCase().trim();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(lowerQ) || 
        p.category?.toLowerCase().includes(lowerQ) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(lowerQ))
      );
    }

    // Category (case-insensitive comparison with trimming)
    if (selectedCategory !== "All") {
      const selectedCatNormalized = selectedCategory.toLowerCase().trim();
      result = result.filter(p => p.category?.toLowerCase().trim() === selectedCatNormalized);
    }

    // Price
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Rating
    if (minRating > 0) result = result.filter(p => Number(p.rating) >= minRating);

    // Sort
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);

    setFilteredProducts(result);
  }, [products, searchParams, selectedCategory, priceRange, minRating, sortBy]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") newParams.delete("category");
    else newParams.set("category", cat);
    setSearchParams(newParams);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-950">
      <motion.div 
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-primary-500 border-r-accent-500"></div>
        <motion.div 
          className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-pink-500"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-500 animate-pulse" />
      </motion.div>
      <motion.p 
        className="mt-6 text-gray-600 dark:text-gray-400 font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading amazing products...
      </motion.p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-10 min-h-screen relative overflow-hidden">
      {/* Scattered floating icons */}
      <ScatteredFloatingIcons density="sparse" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 0.8, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 relative z-10"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div>
           <motion.h1 
             className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3"
             whileHover={{ scale: 1.02 }}
           >
             <motion.div
               animate={{ rotate: [0, 10, -10, 0] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             >
               <ShoppingBag className="w-10 h-10 text-primary-600"/>
             </motion.div>
             <span className="bg-gradient-to-r from-primary-600 via-accent-500 to-purple-600 bg-clip-text text-transparent">
               Shop
             </span>
             <motion.div
               animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
               transition={{ duration: 3, repeat: Infinity }}
             >
               <Sparkles className="w-6 h-6 text-yellow-500" />
             </motion.div>
           </motion.h1>
           <motion.p 
             className="text-gray-500 dark:text-gray-400 mt-1"
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
           >
             <span className="font-bold text-primary-600">{filteredProducts.length}</span> products found {searchParams.get("search") && `for "${searchParams.get("search")}"`}
           </motion.p>
        </div>
        
        <motion.select 
          className="p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white shadow-lg outline-none cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-all font-medium"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <option value="featured">Sort by: Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </motion.select>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 relative z-10">
        
        {/* SIDEBAR */}
        <motion.aside 
          className="w-full lg:w-64 bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl p-4 lg:p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 h-fit lg:sticky lg:top-24"
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-white/10 pb-3">
              <motion.h2 
                className="font-bold text-base flex items-center gap-2 text-gray-900 dark:text-white"
                whileHover={{ x: 5 }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Filter className="w-4 h-4 text-primary-500"/>
                </motion.div>
                Filters
              </motion.h2>
              <motion.button 
                onClick={() => {handleCategoryChange("All"); setSearchParams({});}} 
                className="text-xs text-red-500 font-bold hover:text-red-400 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Clear All
              </motion.button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-bold text-xs text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                Categories
              </h3>
              <div className="space-y-2">
                <motion.label 
                  className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input type="radio" name="cat" checked={selectedCategory === "All"} onChange={() => handleCategoryChange("All")} className="accent-primary-600 w-4 h-4" />
                  <span className={`text-sm font-medium ${selectedCategory==="All" ? "text-primary-600" : "text-gray-600 dark:text-gray-400"}`}>All Products</span>
                  {selectedCategory === "All" && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </motion.label>
                {categories.map((cat, index) => (
                  <motion.label 
                    key={cat} 
                    className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input type="radio" name="cat" checked={selectedCategory === cat} onChange={() => handleCategoryChange(cat)} className="accent-primary-600 w-4 h-4" />
                    <span className={`text-sm font-medium ${selectedCategory===cat ? "text-primary-600" : "text-gray-600 dark:text-gray-400"}`}>{cat}</span>
                    {selectedCategory === cat && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-4">
              <h3 className="font-bold text-xs text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                Price Range
              </h3>
              <div className="flex gap-2 items-center">
                <motion.input 
                  type="number" 
                  className="w-full p-2.5 border-2 border-gray-200 dark:border-white/10 rounded-lg text-sm bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all" 
                  placeholder="Min" 
                  value={priceRange.min} 
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  whileFocus={{ scale: 1.02 }}
                />
                <span className="text-gray-400 font-bold">-</span>
                <motion.input 
                  type="number" 
                  className="w-full p-2.5 border-2 border-gray-200 dark:border-white/10 rounded-lg text-sm bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all" 
                  placeholder="Max" 
                  value={priceRange.max} 
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </div>
          </div>
        </motion.aside>

        {/* GRID */}
        <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-50 dark:bg-dark-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10">
                <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-400 dark:text-gray-500 font-medium text-lg">No products match your criteria.</p>
                <button 
                  onClick={() => {handleCategoryChange("All"); setSearchParams({});}} 
                  className="mt-4 px-6 py-2 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group hover:-translate-y-2 transition-transform duration-300"
                  >
                    <Link 
                      to={`/product/${product.id}`} 
                      className="block bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="h-56 overflow-hidden bg-gray-100 dark:bg-dark-700 relative">
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {product.stock <= 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                            Sold Out
                          </div>
                        )}
                        
                        {index < 3 && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> New
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition text-lg">{product.title}</h3>
                          <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 px-2.5 py-1.5 rounded-full">
                            <Star className="w-3.5 h-3.5 fill-current" /> {product.rating}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider font-medium">{product.category}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                            ৳{product.price.toLocaleString()}
                          </span>
                          <span className="bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full text-xs font-bold group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                            Buy Now
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Shop;