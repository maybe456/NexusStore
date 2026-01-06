// src/components/MobileSearch.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Camera, X } from "lucide-react";
import { analyzeImageForSearch } from "../lib/gemini";

const MobileSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync search input with URL
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery.trim()}`);
      setIsExpanded(false);
    } else {
      navigate("/shop");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeImageForSearch(file);
      setTimeout(() => {
        alert(`AI Detected: ${result.subCategory} (${result.category})`);
        navigate(`/shop?category=${result.category}&search=${result.subCategory}`);
        setIsAnalyzing(false);
        setIsExpanded(false);
      }, 2000);
    } catch (error) {
      console.error("Visual Search Error:", error);
      alert("AI could not identify this image.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 mobile-search-container">
      {/* Expanded Search Panel */}
      {isExpanded && (
        <div className="absolute bottom-14 left-0 bg-white rounded-2xl shadow-2xl border p-4 w-72 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm">Search Products</h3>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handleSearchSubmit}>
            <div 
              className={`flex items-center px-3 py-2 rounded-full transition-all ${
                isAnalyzing 
                  ? "bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300" 
                  : "bg-gray-100 border focus-within:border-blue-500"
              }`}
            >
              <Search className={`w-4 h-4 ${isAnalyzing ? "text-purple-600 animate-pulse" : "text-gray-500"}`} />
              <input 
                type="text" 
                placeholder={isAnalyzing ? "AI analyzing..." : "Search..."}
                className="bg-transparent border-none outline-none ml-2 w-full text-gray-700 placeholder-gray-400 text-sm"
                disabled={isAnalyzing}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <label className={`cursor-pointer p-1.5 rounded-full hover:bg-gray-200 transition ${isAnalyzing ? 'animate-pulse text-purple-600' : 'text-gray-500'}`}>
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                  disabled={isAnalyzing} 
                />
              </label>
            </div>
            
            <button 
              type="submit"
              className="w-full mt-3 bg-blue-600 text-white py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Search"}
            </button>
          </form>
          
          <p className="text-xs text-gray-400 mt-3 text-center">
            Tap camera for AI visual search
          </p>
        </div>
      )}

      {/* Floating Search Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-4 rounded-full shadow-lg transition hover:scale-110 flex items-center justify-center ${
          isExpanded 
            ? "bg-gray-200 text-gray-700" 
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isExpanded ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default MobileSearch;
