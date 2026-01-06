// src/pages/Shop.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Star, Filter, X, ShoppingBag } from "lucide-react";

const CATEGORIES = ["Electronics", "Fashion", "Home"];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");

  // Fetch Data
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const items = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Random rating for demo visual
          rating: data.rating || (Math.random() * (5 - 4) + 4).toFixed(1)
        };
      });
      setProducts(items);
      setLoading(false);
    };
    fetchProducts();
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
      const lowerQ = query.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(lowerQ) || 
        p.category.toLowerCase().includes(lowerQ) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(lowerQ))
      );
    }

    // Category
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="container mx-auto p-4 md:p-10 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
             <ShoppingBag className="w-8 h-8 text-blue-600"/> Shop
           </h1>
           <p className="text-gray-500">
             {filteredProducts.length} products found {searchParams.get("search") && `for "${searchParams.get("search")}"`}
           </p>
        </div>
        
        <select 
          className="p-2 border rounded-lg bg-white shadow-sm outline-none cursor-pointer hover:border-blue-500 transition"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="featured">Sort by: Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-64 bg-white p-4 lg:p-6 rounded-2xl shadow-sm border h-fit lg:sticky lg:top-24 shop-filter">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h2 className="font-bold text-base flex items-center gap-2"><Filter className="w-4 h-4"/> Filters</h2>
            <button onClick={() => {handleCategoryChange("All"); setSearchParams({});}} className="text-xs text-red-500 hover:underline">Clear</button>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <h3 className="font-bold text-xs text-gray-700 mb-2 uppercase tracking-wider">Categories</h3>
            <div className="space-y-1.5">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="radio" name="cat" checked={selectedCategory === "All"} onChange={() => handleCategoryChange("All")} className="accent-blue-600" />
                <span className={`text-sm ${selectedCategory==="All" ? "font-bold text-blue-600" : "text-gray-600 group-hover:text-blue-600"}`}>All</span>
              </label>
              {CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center space-x-2 cursor-pointer group">
                  <input type="radio" name="cat" checked={selectedCategory === cat} onChange={() => handleCategoryChange(cat)} className="accent-blue-600" />
                  <span className={`text-sm ${selectedCategory===cat ? "font-bold text-blue-600" : "text-gray-600 group-hover:text-blue-600"}`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-4">
            <h3 className="font-bold text-xs text-gray-700 mb-2 uppercase tracking-wider">Price Range</h3>
            <div className="flex gap-2 items-center">
              <input type="number" className="w-full p-2 border rounded text-sm bg-gray-50" placeholder="0" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })} />
              <span className="text-gray-400">-</span>
              <input type="number" className="w-full p-2 border rounded text-sm bg-gray-50" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })} />
            </div>
          </div>
        </aside>

        {/* GRID */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-2xl border-2 border-dashed">
              <p className="text-gray-400 font-medium">No products match your criteria.</p>
              <button onClick={() => {handleCategoryChange("All"); setSearchParams({});}} className="mt-2 text-blue-600 font-bold hover:underline">Reset Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="h-56 overflow-hidden bg-gray-100 relative">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    {product.stock <= 0 && <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md">Sold Out</div>}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">{product.title}</h3>
                       <div className="flex items-center gap-1 text-xs font-bold text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                         <Star className="w-3 h-3 fill-current" /> {product.rating}
                       </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-extrabold text-blue-600">৳{product.price.toLocaleString()}</span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition">Buy Now</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;