// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, Zap, Sparkles, Star, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { ScatteredFloatingIcons } from "../components/Interactive3D";

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.6, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient orbs
const GradientOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 dark:opacity-20"
      style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
        top: "-200px",
        left: "-200px",
      }}
      animate={{
        x: [0, 100, 0],
        y: [0, 50, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-25 dark:opacity-15"
      style={{
        background: "linear-gradient(135deg, #00f5ff 0%, #6366f1 100%)",
        top: "30%",
        right: "-150px",
      }}
      animate={{
        x: [0, -80, 0],
        y: [0, 100, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-20 dark:opacity-15"
      style={{
        background: "linear-gradient(135deg, #d946ef 0%, #ff00ff 100%)",
        bottom: "-100px",
        left: "30%",
      }}
      animate={{
        x: [0, 60, 0],
        y: [0, -50, 0],
        scale: [1.1, 1, 1.1],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
    />
  </div>
);

// Animated text with gradient
const AnimatedTitle = ({ children, className }) => (
  <motion.span
    className={`bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-accent-500 to-neon-cyan bg-[length:200%_200%] ${className}`}
    animate={{
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    }}
    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
  >
    {children}
  </motion.span>
);

// Feature card with glow effect
const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative flex flex-col items-center gap-4 p-6 md:p-8 rounded-3xl glass-card border border-white/10 dark:border-white/5">
      <motion.div
        className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        <Icon className="w-8 h-8 md:w-10 md:h-10" />
      </motion.div>
      <div className="text-center">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

// Category card with stunning hover effects
const CategoryCard = ({ to, image, category, tagline, tagColor, isLarge }) => (
  <Link to={to} className={`group relative overflow-hidden cursor-pointer block h-full ${isLarge ? 'rounded-[2rem] md:rounded-[3rem]' : 'rounded-2xl md:rounded-[2.5rem]'}`}>
    {/* Image background */}
    <div className="absolute inset-0 bg-gray-900">
      <motion.img
        src={image}
        alt={category}
        className="w-full h-full object-cover opacity-80"
        whileHover={{ scale: 1.1, opacity: 0.6 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
    
    {/* Animated gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
    
    {/* Neon border on hover */}
    <motion.div
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isLarge ? 'rounded-[2rem] md:rounded-[3rem]' : 'rounded-2xl md:rounded-[2.5rem]'}`}
      style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(217, 70, 239, 0.3), rgba(0, 245, 255, 0.3))',
        padding: '2px',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
      }}
    />
    
    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8 lg:p-10">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="transform group-hover:-translate-y-2 transition-transform duration-500"
      >
        <span className={`${tagColor} font-bold tracking-widest uppercase text-xs md:text-sm mb-2 block`}>
          {tagline}
        </span>
        <h2 className={`font-bold text-white leading-tight ${isLarge ? 'text-2xl md:text-4xl lg:text-5xl mb-4' : 'text-xl md:text-3xl lg:text-4xl'}`}>
          {category}
        </h2>
        <motion.div
          className="flex items-center gap-3 text-white font-semibold text-sm md:text-base"
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ x: 5 }}
        >
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Shop Now</span>
          <motion.div
            className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
          >
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
    
    {/* Shimmer effect on hover */}
    <motion.div
      className="absolute inset-0 opacity-0 group-hover:opacity-100"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      }}
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 0.5,
      }}
    />
  </Link>
);

const Home = () => {
  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
      {/* Animated background elements */}
      <FloatingParticles />
      <GradientOrbs />
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-50 dark:opacity-30 z-0" />
      
      {/* Scattered floating icons */}
      <ScatteredFloatingIcons density="dense" />
      
      {/* Main content */}
      <div className="relative z-10">
        
        {/* 1. HERO SECTION */}
        <section className="px-4 md:px-6 lg:px-10 pt-4 md:pt-6 pb-10 md:pb-20 max-w-[1600px] mx-auto">
          
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center py-8 md:py-12 lg:py-20 space-y-4 md:space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20 dark:border-white/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </motion.div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                New Arrivals 2026
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              </motion.div>
            </motion.div>
            
            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]"
            >
              <span className="text-gray-900 dark:text-white">Redefine Your </span>
              <br className="hidden sm:block" />
              <AnimatedTitle className="font-black">
                Lifestyle.
              </AnimatedTitle>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium px-4"
            >
              Explore our curated collections of premium tech, trendsetting fashion, and modern home essentials.
            </motion.p>
            
            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Link to="/shop">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary flex items-center gap-2 justify-center w-full sm:w-auto"
                >
                  Explore Collection
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/shop?category=Electronics">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary flex items-center gap-2 justify-center w-full sm:w-auto"
                >
                  View Tech
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* BENTO GRID LAYOUT */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-auto lg:h-[650px]"
          >
            
            {/* CARD 1: ELECTRONICS */}
            <div className="lg:col-span-6 h-[260px] md:h-[500px] lg:h-full">
              <CategoryCard
                to="/shop?category=Electronics"
                image="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=85"
                category="Electronics"
                tagline="Next Gen Tech"
                tagColor="text-neon-cyan"
                isLarge={true}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-6 flex flex-col gap-4 md:gap-6 h-full">
              
              {/* CARD 2: FASHION */}
              <div className="flex-1 h-[200px] md:h-[280px] lg:h-auto min-h-[200px]">
                <CategoryCard
                  to="/shop?category=Fashion"
                  image="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=85"
                  category="Fashion"
                  tagline="Trending Now"
                  tagColor="text-neon-pink"
                  isLarge={false}
                />
              </div>

              {/* CARD 3: HOME */}
              <div className="flex-1 h-[200px] md:h-[280px] lg:h-auto min-h-[200px]">
                <CategoryCard
                  to="/shop?category=Home"
                  image="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85"
                  category="Home & Living"
                  tagline="Interior Design"
                  tagColor="text-neon-orange"
                  isLarge={false}
                />
              </div>
            </div>

          </motion.div>
        </section>

        {/* 2. TRUST INDICATORS */}
        <section className="py-16 md:py-24 relative">
          {/* Section background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 dark:via-dark-900/50 to-transparent" />
          
          <div className="container mx-auto px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose <AnimatedTitle>NexusStore</AnimatedTitle>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                Experience premium shopping with unmatched service and innovation
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <FeatureCard
                icon={Truck}
                title="Express Delivery"
                description="Lightning fast shipping across Dhaka with real-time tracking updates."
                color="bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/30"
                delay={0.1}
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Secure Payments"
                description="Verified Cash on Delivery and encrypted online transactions."
                color="bg-gradient-to-br from-accent-500 to-accent-600 shadow-accent-500/30"
                delay={0.2}
              />
              <FeatureCard
                icon={Zap}
                title="AI Discovery"
                description="Smart visual search to help you find exactly what you need."
                color="bg-gradient-to-br from-yellow-500 to-orange-500 shadow-yellow-500/30"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* 3. CTA SECTION */}
        <section className="py-16 md:py-24 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center relative"
          >
            {/* Glow effect behind */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-neon-cyan/20 blur-3xl rounded-full" />
            
            <div className="relative glass-card rounded-3xl p-8 md:p-16 border border-white/20 dark:border-white/5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 md:top-8 md:right-8"
              >
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 opacity-50" />
              </motion.div>
              
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                Ready to <AnimatedTitle>Shop?</AnimatedTitle>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Discover thousands of premium products at unbeatable prices. Start your shopping journey today.
              </p>
              <Link to="/shop">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 30px 60px -15px rgba(217, 70, 239, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary text-lg px-10 py-4"
                >
                  Start Shopping
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
};

export default Home;