// src/pages/ProductDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Star, ShoppingCart, AlertCircle, CheckCircle, ArrowLeft, Truck, Shield, RotateCcw, Sparkles, Zap, Heart } from "lucide-react";
import { hasSizes } from "../lib/categories";
import ReviewSection from "../components/ReviewSection";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);

  // Calculate average rating from reviews
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch product
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() };
          setProduct(productData);
          
          // Set default size for Fashion items
          if (hasSizes(productData.category) && productData.sizes) {
            const availableSizes = Object.entries(productData.sizes)
              .filter(([_, qty]) => qty > 0)
              .map(([size]) => size);
            if (availableSizes.length > 0) {
              setSelectedSize(availableSizes[0]);
            }
          }
        }

        // Fetch reviews for this product
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("productId", "==", id)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        setReviews(reviewsSnapshot.docs.map(d => d.data()));
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (hasSizes(product?.category) && !selectedSize) {
      alert("Please select a size");
      return;
    }
    addToCart(product, selectedSize || null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950 relative overflow-hidden">
        {/* Animated background */}
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <div className="text-center relative z-10">
          <motion.div 
            className="relative mx-auto mb-6"
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
            className="text-gray-500 dark:text-gray-400 font-medium text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading product details...
          </motion.p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-950 px-4 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </motion.div>
        
        <motion.div 
          className="w-24 h-24 rounded-3xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <AlertCircle className="w-12 h-12 text-red-500" />
          </motion.div>
        </motion.div>
        <motion.h2 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Product Not Found
        </motion.h2>
        <motion.p 
          className="text-gray-500 dark:text-gray-400 mb-8 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          The item you are looking for does not exist.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link 
            to="/shop" 
            className="px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-2xl font-bold hover:-translate-y-1 transition-all shadow-xl inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const showSizeSelector = hasSizes(product.category) && product.sizes;

  const getSizeButtonClasses = (size, qty) => {
    if (selectedSize === size) {
      return "px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400";
    }
    if (qty === 0) {
      return "px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-dark-800 text-gray-300 dark:text-gray-600 cursor-not-allowed";
    }
    return "px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20";
  };

  const getStarClasses = (star) => {
    return "w-5 h-5 " + (star <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-600");
  };

  const addToCartClasses = "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all " + (
    isOutOfStock 
      ? "bg-gray-200 dark:bg-dark-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
      : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 hover:-translate-y-0.5 shadow-xl shadow-gray-900/20 dark:shadow-white/10"
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <motion.div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-green-500/30 flex items-center gap-3"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle className="w-6 h-6" />
              </motion.div>
              <span className="font-bold text-lg">Added to cart!</span>
              <Sparkles className="w-5 h-5" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium mb-6 group transition-colors"
          >
            <motion.div whileHover={{ x: -5 }}>
              <ArrowLeft className="w-5 h-5" />
            </motion.div>
            Back to Shop
          </Link>
        </motion.div>

        {/* Product Content */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="relative"
        >
          {/* Glow effect */}
          <motion.div 
            className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-purple-500/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="relative bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image Section */}
              <motion.div 
                className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-800 p-6 md:p-10"
                onHoverStart={() => setImageHovered(true)}
                onHoverEnd={() => setImageHovered(false)}
              >
                <motion.div 
                  className="aspect-square rounded-3xl overflow-hidden bg-white dark:bg-dark-900 shadow-xl relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <motion.img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-contain p-6"
                    animate={imageHovered ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Zoom overlay on hover */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0"
                    animate={imageHovered ? { opacity: 1 } : { opacity: 0 }}
                  />
                </motion.div>
                
                {/* Wishlist button */}
                <motion.button
                  className="absolute top-8 right-8 w-12 h-12 bg-white dark:bg-dark-800 rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className="w-6 h-6" />
                </motion.button>
                
                {/* Badges */}
                <div className="absolute top-8 left-8 flex flex-col gap-2">
                  {isOutOfStock && (
                    <motion.span 
                      className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Out of Stock
                    </motion.span>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <motion.span 
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Zap className="w-4 h-4" /> Only {product.stock} left!
                    </motion.span>
                  )}
                </div>
              </motion.div>

              {/* Details Section */}
              <motion.div 
                className="p-6 md:p-10 flex flex-col"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Category Badge */}
                <motion.div 
                  className="flex items-center gap-2 mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="px-4 py-1.5 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full">
                    {product.category}
                  </span>
                  <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full">
                    {product.subCategory}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1 
                  className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {product.title}
                </motion.h1>

                {/* Rating */}
                <motion.div 
                  className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.div
                        key={star}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + star * 0.05 }}
                        whileHover={{ scale: 1.2, rotate: 15 }}
                      >
                        <Star className={getStarClasses(star)} />
                      </motion.div>
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{averageRating}</span>
                  <span className="text-sm text-gray-400 dark:text-gray-500">({reviews.length} reviews)</span>
                </motion.div>

                {/* Price */}
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <motion.span 
                    className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary-600 via-accent-500 to-purple-600 bg-clip-text text-transparent"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ৳{product.price?.toLocaleString()}
                  </motion.span>
                </motion.div>

                {/* Description */}
                <motion.p 
                  className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {product.description}
                </motion.p>

                {/* Size Selector */}
                {showSizeSelector && (
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Select Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(product.sizes).map(([size, qty], index) => (
                        <motion.button
                          key={size}
                          onClick={() => qty > 0 && setSelectedSize(size)}
                          disabled={qty === 0}
                          className={getSizeButtonClasses(size, qty)}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.05 }}
                          whileHover={qty > 0 ? { scale: 1.05, y: -2 } : {}}
                          whileTap={qty > 0 ? { scale: 0.95 } : {}}
                        >
                          {size}
                          {qty === 0 && <span className="ml-1 text-xs">(Out)</span>}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Add to Cart Button */}
                <motion.button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={addToCartClasses + " relative overflow-hidden"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={!isOutOfStock ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
                >
                  {/* Animated shine effect */}
                  {!isOutOfStock && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                  )}
                  <ShoppingCart className="w-6 h-6 relative" />
                  <span className="relative">{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                  {!isOutOfStock && <Sparkles className="w-5 h-5 relative" />}
                </motion.button>

                {/* Trust Features */}
                <motion.div 
                  className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {[
                    { icon: Truck, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20", label: "Free Shipping" },
                    { icon: Shield, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20", label: "Secure Pay" },
                    { icon: RotateCcw, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20", label: "Easy Returns" }
                  ].map((feature, i) => (
                    <motion.div 
                      key={feature.label}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div 
                        className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mx-auto mb-2 shadow-lg`}
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      >
                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </motion.div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{feature.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <ReviewSection productId={id} reviews={reviews} setReviews={setReviews} />
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;
