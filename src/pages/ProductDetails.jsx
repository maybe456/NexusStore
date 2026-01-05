import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Star, ShoppingCart, AlertCircle } from "lucide-react";
import { hasSizes } from "../lib/categories"; // Import helper

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
      
      const q = query(collection(db, "reviews"), where("productId", "==", id));
      const rSnap = await getDocs(q);
      setReviews(rSnap.docs.map(d => d.data()));
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    // Validation
    if (product.stock <= 0) return alert("Out of stock!");
    
    // Size Logic
    if (hasSizes(product.category)) {
      if (!selectedSize) return alert("Please select a size!");
      // Check stock for specific size
      if (product.sizes[selectedSize] <= 0) return alert(`Size ${selectedSize} is out of stock!`);
      
      // Add product with specific size name
      addToCart({ ...product, title: `${product.title} (Size: ${selectedSize})`, id: `${product.id}-${selectedSize}` });
    } else {
      addToCart(product);
    }
  };

  if (loading || !product) return <div className="p-10 text-center">Loading...</div>;

  const isFashion = hasSizes(product.category);

  return (
    <div className="container mx-auto p-4 md:p-10">
      <div className="bg-white rounded-xl shadow border p-6 md:p-10 flex flex-col md:flex-row gap-10">
        <div className="md:w-1/2 bg-gray-100 rounded-xl flex items-center justify-center p-4">
          <img src={product.image} className="max-h-96 object-contain" />
        </div>

        <div className="md:w-1/2 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <p className="text-gray-500">{product.category} &gt; {product.subCategory}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <p className="text-3xl font-bold text-blue-600">৳{product.price}</p>
          <p className="text-gray-600 bg-gray-50 p-4 rounded border">{product.description}</p>

          {/* SIZE SELECTOR (Only for Fashion) */}
          {isFashion && (
            <div>
              <label className="font-bold block mb-2">Select Size:</label>
              <div className="flex gap-2">
                {product.sizes && Object.keys(product.sizes).map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={product.sizes[size] <= 0}
                    className={`px-4 py-2 border rounded transition ${
                      selectedSize === size ? "bg-black text-white border-black" : "hover:bg-gray-100"
                    } ${product.sizes[size] <= 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="text-xs text-gray-500 mt-1">
                  {product.sizes[selectedSize]} items left in Size {selectedSize}
                </p>
              )}
            </div>
          )}

          <button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:bg-gray-400 flex justify-center gap-2"
          >
            <ShoppingCart /> {product.stock > 0 ? "Add to Cart" : "Sold Out"}
          </button>
        </div>
      </div>
      
      {/* Reviews Section (Existing code...) */}
    </div>
  );
};

export default ProductDetails;