// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Zap, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. HERO COLLECTION GRID */}
      <section className="px-4 md:px-6 lg:px-10 pt-6 pb-20 max-w-[1600px] mx-auto">
        
        {/* Hero Header */}
        <div className="text-center py-10 md:py-16 space-y-4 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
             <Sparkles className="w-3 h-3 text-yellow-500 fill-current"/> New Arrivals 2026
           </div>
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-tight">
             Redefine Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Lifestyle.</span>
           </h1>
           <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
             Explore our curated collections of premium tech, trendsetting fashion, and modern home essentials.
           </p>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
          
          {/* CARD 1: ELECTRONICS (Large - Spans 6 cols) */}
          <Link to="/shop?category=Electronics" className="lg:col-span-6 group relative rounded-[2.5rem] overflow-hidden cursor-pointer h-[500px] lg:h-full">
            <div className="absolute inset-0 bg-gray-900">
              <img 
                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=85" 
                alt="Electronics" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000 ease-out"
              />
            </div>
            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-black/90 via-transparent to-transparent">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-2 block">Next Gen Tech</span>
                <h2 className="text-4xl md:text-5xl font-white font-bold text-white mb-4 leading-tight">Electronics</h2>
                <div className="flex items-center gap-3 text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  Shop Now <ArrowRight className="w-5 h-5 bg-white text-black rounded-full p-1"/>
                </div>
              </div>
            </div>
          </Link>

          {/* RIGHT COLUMN WRAPPER (Spans 6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6 h-full">
            
            {/* CARD 2: FASHION (Top Half) */}
            <Link to="/shop?category=Fashion" className="flex-1 group relative rounded-[2.5rem] overflow-hidden cursor-pointer h-[400px] lg:h-auto">
              <div className="absolute inset-0 bg-gray-900">
                 <img 
                   src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=85" 
                   alt="Fashion" 
                   className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000 ease-out"
                 />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center p-10 bg-black/20 group-hover:bg-black/40 transition-colors duration-500">
                <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
                  <span className="text-purple-300 font-bold tracking-widest uppercase text-xs mb-2 block">Trending Now</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Fashion</h2>
                  <p className="text-gray-200 mt-2 max-w-sm text-sm md:text-base opacity-90">Timeless styles for the modern individual.</p>
                </div>
              </div>
            </Link>

            {/* CARD 3: HOME (Bottom Half) */}
            <Link to="/shop?category=Home" className="flex-1 group relative rounded-[2.5rem] overflow-hidden cursor-pointer h-[400px] lg:h-auto">
              <div className="absolute inset-0 bg-gray-900">
                 <img 
                   src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85" 
                   alt="Home" 
                   className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000 ease-out"
                 />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center p-10 bg-black/20 group-hover:bg-black/40 transition-colors duration-500">
                <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
                   <span className="text-orange-300 font-bold tracking-widest uppercase text-xs mb-2 block">Interior Design</span>
                   <h2 className="text-3xl md:text-4xl font-bold text-white">Home & Living</h2>
                   <p className="text-gray-200 mt-2 max-w-sm text-sm md:text-base opacity-90">Elevate your space with our curated decor.</p>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. TRUST INDICATORS (Fixed Circles) */}
      <section className="py-20 border-t border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            
            {/* 1. EXPRESS DELIVERY */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 group">
              {/* Added flex-shrink-0 to prevent oval shape */}
              <div className="w-16 h-16 flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Express Delivery</h3>
                <p className="text-gray-500 leading-relaxed">Lightning fast shipping across Dhaka with real-time tracking.</p>
              </div>
            </div>

            {/* 2. SECURE PAYMENTS */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 group">
              <div className="w-16 h-16 flex-shrink-0 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-gray-500 leading-relaxed">Verified Cash on Delivery and encrypted online transactions.</p>
              </div>
            </div>

            {/* 3. AI DISCOVERY */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 group">
              <div className="w-16 h-16 flex-shrink-0 bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-yellow-200 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Discovery</h3>
                <p className="text-gray-500 leading-relaxed">Smart visual search to help you find exactly what you need.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;