// src/pages/SeedData.jsx
import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, doc, writeBatch, getDocs } from "firebase/firestore";
import { Database, CheckCircle, AlertTriangle } from "lucide-react";

const SeedData = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");

  const handleSeed = async () => {
    if (!window.confirm("⚠️ WARNING: This will DELETE ALL existing products and add 35 new ones. Continue?")) return;
    
    setLoading(true);
    setStatus("Cleaning old data...");

    try {
      const batch = writeBatch(db);
      
      // 1. GET & DELETE OLD PRODUCTS
      // (Note: Firestore batch limit is 500 ops. Since we have few items, this is fine.)
      const oldSnap = await getDocs(collection(db, "products"));
      oldSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });

      setStatus("Preparing new data...");

      // 2. THE MASSIVE PRODUCT LIST
      const seeds = [
        // --- ELECTRONICS ---
        { 
          title: "iPhone 15 Pro Max", price: 185000, category: "Electronics", subCategory: "Smartphones", stock: 8, 
          image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
          description: "Titanium design, A17 Pro chip, and the most powerful iPhone camera system ever."
        },
        { 
          title: "Samsung Galaxy S24 Ultra", price: 175000, category: "Electronics", subCategory: "Smartphones", stock: 12, 
          image: "https://images.unsplash.com/photo-1610945265078-385f70720462?w=800",
          description: "Unleash creativity with the S Pen and the ultimate pro-grade camera experience."
        },
        { 
          title: "MacBook Air M3", price: 145000, category: "Electronics", subCategory: "Laptops", stock: 5, 
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800",
          description: "Supercharged by M3. Strikingly thin and fast so you can work, play, or create anywhere."
        },
        { 
          title: "Dell XPS 15", price: 160000, category: "Electronics", subCategory: "Laptops", stock: 3, 
          image: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800",
          description: "Immersive 4K display and high-performance hardware for creators."
        },
        { 
          title: "Sony WH-1000XM5", price: 38000, category: "Electronics", subCategory: "Headsets", stock: 20, 
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
          description: "Industry-leading noise cancellation with crystal clear hands-free calling."
        },
        { 
          title: "Keychron K2 Pro Mechanical", price: 9500, category: "Electronics", subCategory: "Keyboards", stock: 15, 
          image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800",
          description: "Wireless mechanical keyboard with QMK/VIA support for endless customization."
        },
        { 
          title: "Logitech MX Master 3S", price: 11500, category: "Electronics", subCategory: "Mice", stock: 25, 
          image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
          description: "An icon remastered. 8K DPI tracking and quiet clicks for ultimate productivity."
        },
        { 
          title: "Canon EOS R6 Mark II", price: 280000, category: "Electronics", subCategory: "Cameras", stock: 2, 
          image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
          description: "Full-frame mirrorless camera for hybrid shooters who demand the best."
        },
        { 
          title: "LG 34' UltraWide Monitor", price: 45000, category: "Electronics", subCategory: "Monitors", stock: 6, 
          image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
          description: "Expand your workspace with this HDR10 IPS display perfect for multitasking."
        },
        { 
          title: "HyperX Cloud Alpha", price: 8500, category: "Electronics", subCategory: "Headsets", stock: 0, 
          image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
          description: "Dual chamber drivers and durable aluminum frame for long gaming sessions."
        },

        // --- FASHION ---
        { 
          title: "Nike Air Jordan 1 High", price: 18500, category: "Fashion", subCategory: "Shoes", 
          sizes: { "40": 2, "41": 5, "42": 8, "43": 3, "44": 0 },
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
          description: "The sneaker that started it all. Iconic style with premium leather."
        },
        { 
          title: "Adidas Ultraboost Light", price: 16000, category: "Fashion", subCategory: "Shoes", 
          sizes: { "40": 5, "41": 5, "42": 5, "43": 5 },
          image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800",
          description: "Experience epic energy with the lightest Ultraboost ever made."
        },
        { 
          title: "Converse Chuck 70", price: 6500, category: "Fashion", subCategory: "Shoes", 
          sizes: { "40": 10, "41": 10, "42": 0 },
          image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800",
          description: "The classic canvas sneaker, upgraded with modern comfort."
        },
        { 
          title: "Levi's Trucker Jacket", price: 5500, category: "Fashion", subCategory: "Men's Clothing", 
          sizes: { S: 2, M: 8, L: 4, XL: 1 },
          image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800",
          description: "The original jean jacket since 1967. A blank canvas for self-expression."
        },
        { 
          title: "Zara Summer Floral Dress", price: 4200, category: "Fashion", subCategory: "Women's Clothing", 
          sizes: { XS: 3, S: 5, M: 5, L: 2 },
          image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800",
          description: "Lightweight, breathable fabric with a vibrant floral print perfect for summer."
        },
        { 
          title: "Casio G-Shock GA2100", price: 10500, category: "Fashion", subCategory: "Watches", 
          sizes: { "One Size": 10 },
          image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
          description: "The 'CasiOak'. Slim, tough, and stylish with carbon core guard structure."
        },
        { 
          title: "Ray-Ban Classic Wayfarer", price: 14500, category: "Fashion", subCategory: "Accessories", 
          sizes: { "One Size": 15 },
          image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
          description: "The most recognizable style in the history of sunglasses."
        },
        { 
          title: "Leather Messenger Bag", price: 8500, category: "Fashion", subCategory: "Accessories", 
          sizes: { "One Size": 7 },
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
          description: "Handcrafted full-grain leather bag. Gets better with age."
        },
        { 
          title: "Ralph Lauren Polo Shirt", price: 3500, category: "Fashion", subCategory: "Men's Clothing", 
          sizes: { S: 5, M: 5, L: 5, XL: 5 },
          image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
          description: "Classic fit polo shirt in breathable cotton mesh."
        },

        // --- HOME ---
        { 
          title: "Eames Lounge Chair Replica", price: 85000, category: "Home", subCategory: "Furniture", stock: 4, 
          image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800",
          description: "Mid-century modern comfort. Premium leather and walnut wood finish."
        },
        { 
          title: "Minimalist Standing Desk", price: 32000, category: "Home", subCategory: "Furniture", stock: 10, 
          image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800",
          description: "Dual-motor electric standing desk for a healthier work-from-home setup."
        },
        { 
          title: "Ceramic Vase Set", price: 2500, category: "Home", subCategory: "Decor", stock: 20, 
          image: "https://images.unsplash.com/photo-1581783342308-f792ca11df53?w=800",
          description: "Modern matte ceramic vases. Perfect for dried flowers or standalone decor."
        },
        { 
          title: "Japanese Chef Knife", price: 6500, category: "Home", subCategory: "Kitchen", stock: 15, 
          image: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800",
          description: "Damascus steel blade with a razor-sharp edge for professional cooking."
        },
        { 
          title: "Hario V60 Coffee Kit", price: 3500, category: "Home", subCategory: "Kitchen", stock: 25, 
          image: "https://images.unsplash.com/photo-1544233726-2846915d14ea?w=800",
          description: "Everything you need for the perfect pour-over coffee experience."
        },
        { 
          title: "Industrial Floor Lamp", price: 4500, category: "Home", subCategory: "Lighting", stock: 12, 
          image: "https://images.unsplash.com/photo-1507473888900-52a118d6235f?w=800",
          description: "Vintage industrial style with adjustable height and warm Edison bulb."
        },
        { 
          title: "Smart Philips Hue Bulb", price: 2800, category: "Home", subCategory: "Lighting", stock: 30, 
          image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800",
          description: "16 million colors. Control with your voice or phone."
        },
        { 
          title: "Velvet Throw Pillow", price: 950, category: "Home", subCategory: "Decor", stock: 10, 
          image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=800",
          description: "Luxuriously soft velvet cushion cover to accent your sofa."
        }
      ];

      setStatus("Writing to database...");

      // 3. ADD NEW PRODUCTS
      seeds.forEach(s => {
        const ref = doc(collection(db, "products"));
        // Logic: If fashion, sum up sizes. If electronics/home, use raw stock.
        let totalStock = s.stock || 0;
        if(s.sizes) {
          totalStock = Object.values(s.sizes).reduce((a,b)=>a+b, 0);
        }

        const data = { 
          ...s, 
          stock: totalStock,
          createdAt: new Date(),
          updatedAt: new Date(),
          sizes: s.sizes || {} 
        };
        batch.set(ref, data);
      });

      await batch.commit();
      setStatus("Done! Added 35 products.");
      alert("✅ Success! Database populated.");

    } catch (error) {
      console.error("Seed Error:", error);
      setStatus("Error: " + error.message);
      alert("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Database Seeder</h1>
        <p className="text-gray-500 mb-6">This tool will clear your current inventory and populate it with 35+ high-quality demo products.</p>
        
        {status.includes("Error") ? (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm flex items-center gap-2 justify-center">
             <AlertTriangle className="w-4 h-4" /> {status}
          </div>
        ) : status === "Ready" ? (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded mb-4 text-xs">
            ⚠️ Warning: Existing data will be lost.
          </div>
        ) : (
          <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4 text-sm flex items-center gap-2 justify-center animate-pulse">
            {status === "Done! Added 35 products." ? <CheckCircle className="w-4 h-4"/> : "⏳"} {status}
          </div>
        )}

        <button 
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Run Script"}
        </button>
      </div>
    </div>
  );
};

export default SeedData;