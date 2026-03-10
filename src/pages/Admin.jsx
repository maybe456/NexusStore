// src/pages/Admin.jsx
import { useState, useEffect, useMemo } from "react";
import { db } from "../lib/firebase"; 
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"; 
import { generateDescription, askRealAI } from "../lib/gemini"; 
import { fetchCategories, addCategory, addSubCategory, deleteCategory, removeSubCategory, DEFAULT_CATEGORY_TREE } from "../lib/categories";
import { Sparkles, Edit, Trash2, X, Database, PlusSquare, TrendingUp, DollarSign, AlertTriangle, PackageCheck, Phone, MapPin, Calendar, CreditCard, CheckCircle, Clock, Search, Filter, ArrowUpDown, FolderPlus, Tag, Plus, Shield, Zap, BarChart3 } from "lucide-react"; 
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

// --- INTERNAL CONSTANTS ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const STATUS_COLORS = { Pending: '#f59e0b', Processing: '#3b82f6', Shipped: '#8b5cf6', Delivered: '#10b981', Cancelled: '#ef4444' };

const hasSizes = (category) => category === "Fashion";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("analytics");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null); 
  
  // Dynamic Categories State
  const [categoryTree, setCategoryTree] = useState(DEFAULT_CATEGORY_TREE);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "", price: "", category: "Electronics", subCategory: "Smartphones", 
    image: "", description: "", stock: 10, sizes: { S: 0, M: 0, L: 0, XL: 0 } 
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [analystQuestion, setAnalystQuestion] = useState("");
  const [analystAnswer, setAnalystAnswer] = useState("");

  // Product Filter State
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All"); // All, Low, Out, InStock
  const [sortBy, setSortBy] = useState("name"); // name, price-asc, price-desc, stock-asc, stock-desc

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Search filter
    if (productSearch.trim()) {
      const search = productSearch.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(search) ||
        p.subCategory?.toLowerCase().includes(search)
      );
    }
    
    // Category filter (case-insensitive with trimming)
    if (categoryFilter !== "All") {
      const filterNormalized = categoryFilter.toLowerCase().trim();
      result = result.filter(p => p.category?.toLowerCase().trim() === filterNormalized);
    }
    
    // Stock filter
    if (stockFilter === "Out") {
      result = result.filter(p => p.stock === 0);
    } else if (stockFilter === "Low") {
      result = result.filter(p => p.stock > 0 && p.stock <= 5);
    } else if (stockFilter === "InStock") {
      result = result.filter(p => p.stock > 5);
    }
    
    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "stock-asc":
        result.sort((a, b) => a.stock - b.stock);
        break;
      case "stock-desc":
        result.sort((a, b) => b.stock - a.stock);
        break;
      default:
        result.sort((a, b) => a.title?.localeCompare(b.title));
    }
    
    return result;
  }, [products, productSearch, categoryFilter, stockFilter, sortBy]);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories first
        const categories = await fetchCategories();
        setCategoryTree(categories);
        
        // Set default form values based on fetched categories
        const firstCat = Object.keys(categories)[0] || "Electronics";
        const firstSub = categories[firstCat]?.[0] || "";
        setFormData(prev => ({ ...prev, category: firstCat, subCategory: firstSub }));
        setSelectedCategoryForSub(firstCat);
        
        const prodSnap = await getDocs(collection(db, "products"));
        setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        
        const orderSnap = await getDocs(collection(db, "orders"));
        const ordersData = orderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by date (Newest first)
        ordersData.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(ordersData);
      } catch (error) { console.error("Error loading admin data:", error); }
    };
    fetchData();
  }, [activeTab]);

  // --- CATEGORY MANAGEMENT ---
  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return alert("Category name required");
    if (categoryTree[trimmedName]) return alert("Category already exists");
    
    try {
      const success = await addCategory(trimmedName);
      if (success) {
        setCategoryTree({ ...categoryTree, [trimmedName]: [] });
        setNewCategoryName("");
        alert("Category added!");
      } else {
        alert("Failed to add category. Please check your connection and try again.");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("An error occurred while adding the category.");
    }
  };

  const handleAddSubCategory = async () => {
    if (!selectedCategoryForSub) return alert("Select a category first");
    if (!newSubCategoryName.trim()) return alert("Subcategory name required");
    if (categoryTree[selectedCategoryForSub]?.includes(newSubCategoryName.trim())) {
      return alert("Subcategory already exists");
    }
    
    const success = await addSubCategory(selectedCategoryForSub, newSubCategoryName.trim());
    if (success) {
      setCategoryTree({
        ...categoryTree,
        [selectedCategoryForSub]: [...(categoryTree[selectedCategoryForSub] || []), newSubCategoryName.trim()]
      });
      setNewSubCategoryName("");
      alert("Subcategory added!");
    }
  };

  const handleDeleteCategory = async (catName) => {
    if (!window.confirm(`Delete category "${catName}" and all its subcategories?`)) return;
    const success = await deleteCategory(catName);
    if (success) {
      const newTree = { ...categoryTree };
      delete newTree[catName];
      setCategoryTree(newTree);
    }
  };

  const handleRemoveSubCategory = async (catName, subName) => {
    if (!window.confirm(`Remove subcategory "${subName}"?`)) return;
    const success = await removeSubCategory(catName, subName);
    if (success) {
      setCategoryTree({
        ...categoryTree,
        [catName]: categoryTree[catName].filter(s => s !== subName)
      });
    }
  };

  // --- ANALYTICS ENGINE ---
  const analyticsData = useMemo(() => {
    if (orders.length === 0 || products.length === 0) return null;

    let revenue = 0;
    const daysMap = {};
    const statusMap = { Pending: 0, Processing: 0, Shipped: 0, Delivered: 0 };
    const categoryRevenueMap = {};
    const productSalesMap = {};

    orders.forEach(order => {
      revenue += order.totalAmount;
      const date = new Date(order.createdAt?.seconds * 1000).toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[date] = (daysMap[date] || 0) + order.totalAmount;
      
      const status = order.status || "Pending";
      statusMap[status] = (statusMap[status] || 0) + 1;

      order.items?.forEach(item => {
        const cat = item.category || "Other";
        categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + (item.price * item.quantity);
        
        const pid = item.title;
        productSalesMap[pid] = (productSalesMap[pid] || 0) + item.quantity;
      });
    });

    const dailyData = Object.keys(daysMap).map(day => ({ name: day, sales: daysMap[day] })).reverse().slice(0, 7);
    const statusData = Object.keys(statusMap).map(key => ({ name: key, value: statusMap[key] }));
    const categoryData = Object.keys(categoryRevenueMap).map(key => ({ name: key, value: categoryRevenueMap[key] }));

    const lowStockData = [...products]
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
      .map(p => ({ name: p.title.substring(0, 15) + "...", stock: p.stock }));

    const topSellingData = Object.keys(productSalesMap)
      .map(key => ({ name: key.substring(0, 15) + "...", sales: productSalesMap[key] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return { dailyData, statusData, categoryData, lowStockData, topSellingData, totalRevenue: revenue };
  }, [orders, products]);

  // --- AI ANALYST LOGIC ---
  const handleAskAnalyst = async () => {
    if (!analystQuestion) return;
    setAiLoading(true);

    const inventoryContext = products.map(p => 
      `- ${p.title} (${p.category}): Price ৳${p.price}, Total Stock: ${p.stock}${hasSizes(p.category) ? `, Sizes: ${JSON.stringify(p.sizes)}` : ''}`
    ).join("\n");

    const recentOrders = orders.slice(0, 10).map(o => 
      `Order ${o.id.slice(0,4)}: ৳${o.totalAmount} (${o.status})`
    ).join("\n");

    const fullPrompt = `
      You are the AI Business Manager for NexusStore.
      CURRENT INVENTORY DATA:
      ${inventoryContext}
      RECENT SALES DATA:
      ${recentOrders}
      USER QUESTION: "${analystQuestion}"
      INSTRUCTIONS:
      - Answer specifically based on the data provided above.
      - If asked about low stock, check the 'Total Stock' and 'Sizes'.
      - If asked about revenue, summarize the sales data.
      - Be professional but concise.
    `;

    const answer = await askRealAI(fullPrompt, ""); 
    setAnalystAnswer(answer);
    setAiLoading(false);
  };

  // --- CRUD HANDLERS ---
  const resetForm = () => {
    const firstCat = Object.keys(categoryTree)[0] || "Electronics";
    const firstSub = categoryTree[firstCat]?.[0] || "";
    setFormData({ title: "", price: "", category: firstCat, subCategory: firstSub, image: "", description: "", stock: 10, sizes: { S: 5, M: 5, L: 5, XL: 5 } });
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    let safeCategory = Object.keys(categoryTree)[0] || "Electronics";
    if (categoryTree[product.category]) safeCategory = product.category;
    let safeSub = product.subCategory || categoryTree[safeCategory]?.[0] || "";

    setFormData({
      title: product.title || "",
      price: product.price || 0,
      category: safeCategory,
      subCategory: safeSub,
      image: product.image || "",
      description: product.description || "",
      stock: product.stock || 0,
      sizes: product.sizes || { S: 0, M: 0, L: 0, XL: 0 }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts(products.filter(p => p.id !== id));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    let finalStock = Number(formData.stock);
    if (hasSizes(formData.category)) finalStock = Object.values(formData.sizes).reduce((a, b) => Number(a) + Number(b), 0);
    const payload = { ...formData, price: Number(formData.price), stock: finalStock, updatedAt: new Date() };
    
    if (editingId) {
      await updateDoc(doc(db, "products", editingId), payload);
      setProducts(products.map(p => p.id === editingId ? { id: editingId, ...payload } : p));
    } else {
      const ref = await addDoc(collection(db, "products"), { ...payload, createdAt: new Date() });
      setProducts([...products, { id: ref.id, ...payload }]);
    }
    resetForm();
    alert("Saved!");
  };

  const updateOrderStatus = async (oid, status) => {
    await updateDoc(doc(db, "orders", oid), { status });
    setOrders(orders.map(o => o.id === oid ? { ...o, status } : o));
  };

  const cancelOrder = async (oid) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    await deleteDoc(doc(db, "orders", oid));
    setOrders(orders.filter(o => o.id !== oid));
  };

  // Toggle Payment Status (Paid / Pending)
  const togglePaymentStatus = async (order) => {
    const newStatus = order.paymentStatus === "Paid" ? "Pending" : "Paid";
    // If it was "Verify TrxID", also change it to Paid
    await updateDoc(doc(db, "orders", order.id), { paymentStatus: newStatus });
    setOrders(orders.map(o => o.id === order.id ? { ...o, paymentStatus: newStatus } : o));
  };

  const handleAIGenerate = async () => {
    if (!formData.title) return alert("Title required");
    setAiLoading(true);
    const desc = await generateDescription(`${formData.title} ${formData.subCategory}`);
    setFormData(p => ({...p, description: desc}));
    setAiLoading(false);
  };

  const handleSeed = () => alert("Use /seed route");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const metricVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-10 max-w-7xl min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 relative overflow-hidden">
      
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-20 -left-20 w-96 h-96 bg-primary-300/20 dark:bg-primary-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent-300/20 dark:bg-accent-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-300/15 dark:bg-purple-500/5 rounded-full blur-3xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* HEADER */}
      <motion.div 
        className="relative flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-200 dark:border-white/10 pb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <motion.h1 
          className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent"
          whileHover={{ scale: 1.02 }}
        >
          Admin Command
        </motion.h1>
        <motion.div 
          className="flex gap-1 bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg p-1.5 rounded-2xl shadow-lg border border-gray-100 dark:border-white/10"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
           {["analytics", "products", "categories", "orders"].map((tab, index) => (
             <motion.button 
               key={tab}
               onClick={() => setActiveTab(tab)} 
               className={`px-5 py-2.5 rounded-xl font-semibold capitalize transition-all ${activeTab===tab ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-700 dark:hover:text-white"}`}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * index }}
             >
               {tab}
             </motion.button>
           ))}
        </motion.div>
      </motion.div>

      {/* === ANALYTICS TAB === */}
      {activeTab === "analytics" && analyticsData && (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6 relative"
        >
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div 
              variants={metricVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-blue-200 dark:border-blue-500/20 relative overflow-hidden group cursor-pointer"
            >
               <motion.div 
                 className="absolute right-0 top-0 p-10 bg-blue-100 dark:bg-blue-500/20 rounded-bl-full"
                 animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                 transition={{ duration: 3, repeat: Infinity }}
               />
               <motion.div
                 className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"
               />
               <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider relative">Total Revenue</p>
               <motion.h3 
                 className="text-3xl font-black text-gray-900 dark:text-white mt-2 relative"
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
               >
                 ৳{analyticsData.totalRevenue.toLocaleString()}
               </motion.h3>
               <motion.div 
                 className="mt-2 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 relative"
                 animate={{ x: [0, 3, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
               >
                 <TrendingUp className="w-3 h-3"/> +12% vs last week
               </motion.div>
            </motion.div>
            
            <motion.div 
              variants={metricVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-purple-200 dark:border-purple-500/20 relative overflow-hidden group cursor-pointer"
            >
               <motion.div 
                 className="absolute right-0 top-0 p-10 bg-purple-100 dark:bg-purple-500/20 rounded-bl-full"
                 animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                 transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
               />
               <motion.div
                 className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"
               />
               <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider relative">Total Orders</p>
               <motion.h3 
                 className="text-3xl font-black text-gray-900 dark:text-white mt-2 relative"
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
               >
                 {orders.length}
               </motion.h3>
            </motion.div>
            
            <motion.div 
              variants={metricVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-orange-200 dark:border-orange-500/20 relative overflow-hidden group cursor-pointer"
            >
               <motion.div 
                 className="absolute right-0 top-0 p-10 bg-orange-100 dark:bg-orange-500/20 rounded-bl-full"
                 animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                 transition={{ duration: 3, repeat: Infinity, delay: 1 }}
               />
               <motion.div
                 className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"
               />
               <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider relative">Low Stock Items</p>
               <motion.h3 
                 className="text-3xl font-black text-orange-600 dark:text-orange-400 mt-2 relative"
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
               >
                 {products.filter(p => p.stock < 5).length}
               </motion.h3>
               {products.filter(p => p.stock < 5).length > 0 && (
                 <motion.div
                   className="absolute top-3 right-3 w-3 h-3 bg-orange-500 rounded-full"
                   animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                   transition={{ duration: 1, repeat: Infinity }}
                 />
               )}
            </motion.div>
            
            <motion.div 
              variants={metricVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-green-200 dark:border-green-500/20 relative overflow-hidden group cursor-pointer"
            >
               <motion.div 
                 className="absolute right-0 top-0 p-10 bg-green-100 dark:bg-green-500/20 rounded-bl-full"
                 animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                 transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
               />
               <motion.div
                 className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"
               />
               <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider relative">Avg Order Value</p>
               <motion.h3 
                 className="text-3xl font-black text-gray-900 dark:text-white mt-2 relative"
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
               >
                 ৳{orders.length ? Math.round(analyticsData.totalRevenue/orders.length) : 0}
               </motion.h3>
            </motion.div>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-soft border border-gray-100 dark:border-white/5 h-[400px]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary-500"/> Revenue Trend</h3>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={analyticsData.dailyData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151"/>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#9ca3af" />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v)=>`৳${v}`} stroke="#9ca3af"/>
                  <Tooltip contentStyle={{background:'#1f2937', color:'#fff', borderRadius:'12px', border:'none'}}/>
                  <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-soft border border-gray-100 dark:border-white/5 h-[400px]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue by Category</h3>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={analyticsData.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {analyticsData.categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI ANALYST */}
          <motion.div 
            variants={cardVariants}
            className="relative bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-purple-200 dark:border-purple-500/20 overflow-hidden"
          >
            {/* Animated background */}
            <motion.div 
              className="absolute -top-20 -right-20 w-64 h-64 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <motion.div 
              className="absolute -bottom-20 -left-20 w-48 h-48 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            
            <div className="relative flex items-center gap-3 mb-4">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="text-white w-6 h-6"/>
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Business Intelligence</h3>
                <p className="text-xs text-purple-600 dark:text-purple-400">Powered by advanced analytics</p>
              </div>
            </div>
            
            <div className="relative bg-gray-50 dark:bg-dark-700 rounded-2xl p-4 h-48 overflow-y-auto mb-4 border border-gray-200 dark:border-white/10 font-mono text-sm">
              <AnimatePresence mode="wait">
                {analystAnswer ? (
                  <motion.div 
                    key="answer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed"
                  >
                    {analystAnswer}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-400 h-full flex items-center justify-center italic"
                  >
                    "I have access to your full inventory & sales data. Ask me anything."
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative flex gap-2">
              <input 
                className="flex-grow bg-white dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition placeholder-gray-400" 
                placeholder="e.g., Which size of Nike Shoes is running low?" 
                value={analystQuestion} 
                onChange={e=>setAnalystQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskAnalyst()}
              />
              <motion.button 
                onClick={handleAskAnalyst} 
                disabled={aiLoading} 
                className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-bold transition shadow-lg shadow-purple-500/30 disabled:opacity-50 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                <span className="relative flex items-center gap-2">
                  {aiLoading ? (
                    <>
                      <motion.div 
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Analyze
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* === PRODUCTS TAB === */}
      {activeTab === "products" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative"
        >
           <motion.div 
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="lg:col-span-1 relative"
           >
             {/* Glow effect */}
             <motion.div 
               className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-[28px] blur-lg opacity-0 group-hover:opacity-30 transition-opacity"
             />
             <div className="relative bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/10 lg:sticky lg:top-24 z-10">
              <div className="flex justify-between items-center mb-4">
                <motion.h2 
                  className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {editingId ? (
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                      <Edit className="w-5 h-5 text-primary-600"/>
                    </motion.div>
                  ) : (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                      <PlusSquare className="w-5 h-5 text-green-600"/>
                    </motion.div>
                  )}
                  {editingId ? "Edit" : "Add"}
                </motion.h2>
                {editingId && (
                  <motion.button 
                    onClick={resetForm} 
                    className="text-xs text-red-500 flex items-center gap-1 hover:underline font-bold"
                    whileHover={{ scale: 1.1 }}
                  >
                    <X className="w-3 h-3"/> Cancel
                  </motion.button>
                )}
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Title</label><input className="w-full p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-dark-700 text-gray-900 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Category</label><select className="w-full p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-dark-700 text-gray-900 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, subCategory: categoryTree[e.target.value]?.[0] || ""})}>{Object.keys(categoryTree).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sub</label><select className="w-full p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-dark-700 text-gray-900 dark:text-white" value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})}>{categoryTree[formData.category]?.map(sc => <option key={sc} value={sc}>{sc}</option>)}</select></div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-2xl border border-gray-100 dark:border-white/10"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2 uppercase">Stock</label>{hasSizes(formData.category) ? (<div className="grid grid-cols-4 gap-2">{Object.keys(formData.sizes).map(size => (<div key={size}><span className="text-xs block text-center font-bold text-gray-600 dark:text-gray-400">{size}</span><input type="number" className="w-full p-2 border-2 border-gray-200 dark:border-white/10 rounded-xl text-center text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-600 text-gray-900 dark:text-white" value={formData.sizes[size]} onChange={e => setFormData({...formData, sizes: {...formData.sizes, [size]: Number(e.target.value)}})} /></div>))}</div>) : ( <input type="number" placeholder="Total Qty" className="w-full p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /> )}</div>
                <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Price</label><input type="number" className="w-full p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required /></div><div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Image</label><input type="text" className="w-full p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required /></div></div>
                <div className="relative"><textarea className="w-full p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description..."></textarea><motion.button type="button" onClick={handleAIGenerate} className="absolute top-3 right-3 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}><Sparkles className="w-3 h-3"/> AI</motion.button></div>
                <motion.button 
                  type="submit" 
                  className={`relative w-full py-4 rounded-xl font-bold text-white transition shadow-lg overflow-hidden ${editingId ? "bg-primary-600 shadow-primary-500/30" : "bg-green-600 shadow-green-500/30"}`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <span className="relative">{editingId ? "Update Product" : "Create Product"}</span>
                </motion.button>
              </form>
             </div>
           </motion.div>
           
           {/* Products List with Search & Filters */}
           <motion.div 
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="lg:col-span-2 space-y-4"
           >
             
             {/* Search & Filter Bar */}
             <div className="bg-white dark:bg-dark-800 p-5 rounded-3xl shadow-soft border border-gray-100 dark:border-white/5 space-y-4">
               {/* Search Input */}
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search products by name..." 
                   className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                   value={productSearch}
                   onChange={(e) => setProductSearch(e.target.value)}
                 />
               </div>
               
               {/* Filter Row */}
               <div className="flex flex-wrap gap-2">
                 {/* Category Filter */}
                 <div className="flex items-center gap-1.5">
                   <Filter className="w-3.5 h-3.5 text-gray-400" />
                   <select 
                     className="text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                     value={categoryFilter}
                     onChange={(e) => setCategoryFilter(e.target.value)}
                   >
                     <option value="All">All Categories</option>
                     {Object.keys(categoryTree).map(cat => (
                       <option key={cat} value={cat}>{cat}</option>
                     ))}
                   </select>
                 </div>
                 
                 {/* Stock Filter */}
                 <select 
                   className="text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                   value={stockFilter}
                   onChange={(e) => setStockFilter(e.target.value)}
                 >
                   <option value="All">All Stock</option>
                   <option value="InStock">In Stock (&gt;5)</option>
                   <option value="Low">Low Stock (1-5)</option>
                   <option value="Out">Out of Stock</option>
                 </select>
                 
                 {/* Sort By */}
                 <div className="flex items-center gap-1.5 ml-auto">
                   <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                   <select 
                     className="text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                   >
                     <option value="name">Name (A-Z)</option>
                     <option value="price-asc">Price: Low to High</option>
                     <option value="price-desc">Price: High to Low</option>
                     <option value="stock-asc">Stock: Low to High</option>
                     <option value="stock-desc">Stock: High to Low</option>
                   </select>
                 </div>
               </div>
               
               {/* Results Count */}
               <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                 <span>Showing {filteredProducts.length} of {products.length} products</span>
                 {(productSearch || categoryFilter !== "All" || stockFilter !== "All") && (
                   <button 
                     onClick={() => { setProductSearch(""); setCategoryFilter("All"); setStockFilter("All"); setSortBy("name"); }}
                     className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
                   >
                     Clear filters
                   </button>
                 )}
               </div>
             </div>
             
             {/* Product Cards */}
             <AnimatePresence mode="popLayout">
               {filteredProducts.length === 0 ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-white/10 text-center"
                 >
                   <div className="text-gray-400 mb-2">No products found</div>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                 </motion.div>
               ) : (
                 filteredProducts.map((p, index) => (
                   <motion.div 
                     key={p.id} 
                     layout
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                     whileHover={{ scale: 1.02, x: 5 }}
                     className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-white/10 flex gap-4 items-center transition-all group cursor-pointer"
                   >
                     <motion.img 
                       src={p.image} 
                       className="w-14 h-14 rounded-xl object-cover shadow-md"
                       alt={p.title}
                       whileHover={{ scale: 1.1, rotate: 3 }}
                     />
                     <div className="flex-grow min-w-0">
                       <h3 className="font-bold truncate text-gray-900 dark:text-white">{p.title}</h3>
                       <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2 mt-1">
                         <motion.span 
                           className={`px-2 py-0.5 rounded-full font-bold ${
                             p.stock === 0 ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' : 
                             p.stock <= 5 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400' : 
                             'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                           }`}
                           animate={p.stock === 0 ? { scale: [1, 1.1, 1] } : {}}
                           transition={{ duration: 1, repeat: Infinity }}
                         >
                           {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                         </motion.span>
                         <span className="font-bold text-gray-700 dark:text-gray-300">৳{p.price}</span>
                         <span className="text-gray-300 dark:text-gray-600">•</span>
                         <span className="text-gray-400">{p.category}</span>
                       </div>
                     </div>
                     <div className="flex gap-2 shrink-0">
                       <motion.button 
                         onClick={()=>handleEdit(p)} 
                         className="p-2.5 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 rounded-xl transition"
                         whileHover={{ scale: 1.1, rotate: 5 }}
                         whileTap={{ scale: 0.9 }}
                       >
                         <Edit className="w-4 h-4"/>
                       </motion.button>
                       <motion.button 
                         onClick={()=>handleDelete(p.id)} 
                         className="p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl transition"
                         whileHover={{ scale: 1.1, rotate: -5 }}
                         whileTap={{ scale: 0.9 }}
                       >
                         <Trash2 className="w-4 h-4"/>
                       </motion.button>
                     </div>
                   </motion.div>
                 ))
               )}
             </AnimatePresence>
           </motion.div>
        </motion.div>
      )}

      {/* === CATEGORIES TAB === */}
      {activeTab === "categories" && (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6 relative"
        >
          
          {/* Add Category Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.01 }}
              className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/10 relative overflow-hidden"
            >
              <motion.div 
                className="absolute -top-10 -right-10 w-32 h-32 bg-primary-300/20 dark:bg-primary-500/10 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white relative">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <FolderPlus className="w-5 h-5 text-primary-600" />
                </motion.div>
                Add New Category
              </h2>
              <div className="relative flex gap-2">
                <input 
                  type="text" 
                  placeholder="Category name (e.g., Sports)" 
                  className="flex-1 p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <motion.button 
                  onClick={handleAddCategory}
                  className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" /> Add
                </motion.button>
              </div>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.01 }}
              className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/10 relative overflow-hidden"
            >
              <motion.div 
                className="absolute -top-10 -right-10 w-32 h-32 bg-green-300/20 dark:bg-green-500/10 rounded-full blur-2xl"
                animate={{ scale: [1.2, 1, 1.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white relative">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                  <Tag className="w-5 h-5 text-green-600" />
                </motion.div>
                Add Subcategory
              </h2>
              <div className="relative flex gap-2">
                <select 
                  className="p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition"
                  value={selectedCategoryForSub}
                  onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                >
                  {Object.keys(categoryTree).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  placeholder="Subcategory name" 
                  className="flex-1 p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition"
                  value={newSubCategoryName}
                  onChange={(e) => setNewSubCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubCategory()}
                />
                <motion.button 
                  onClick={handleAddSubCategory}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" /> Add
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Category List */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/10"
          >
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">All Categories & Subcategories</h2>
            <div className="space-y-4">
              {Object.entries(categoryTree).map(([category, subCategories], index) => (
                <motion.div 
                  key={category} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="bg-gray-50 dark:bg-dark-700 px-5 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <motion.div 
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      >
                        <FolderPlus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </motion.div>
                      <span className="font-bold text-gray-900 dark:text-white">{category}</span>
                      <motion.span 
                        className="text-xs bg-gray-200 dark:bg-dark-600 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full font-bold"
                        whileHover={{ scale: 1.1 }}
                      >
                        {subCategories.length} subcategories
                      </motion.span>
                    </div>
                    <motion.button 
                      onClick={() => handleDeleteCategory(category)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition"
                      title="Delete category"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="p-5 bg-white dark:bg-dark-800">
                    {subCategories.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">No subcategories yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {subCategories.map((sub, subIndex) => (
                          <motion.span 
                            key={sub} 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: subIndex * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="bg-gray-100 dark:bg-dark-700 px-3.5 py-2 rounded-xl text-sm flex items-center gap-2 group hover:bg-gray-200 dark:hover:bg-dark-600 transition font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            {sub}
                            <motion.button 
                              onClick={() => handleRemoveSubCategory(category, sub)}
                              className="text-gray-400 hover:text-red-500 transition"
                              title="Remove subcategory"
                              whileHover={{ scale: 1.2, rotate: 90 }}
                              whileTap={{ scale: 0.8 }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </motion.button>
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Info */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ scale: 1.01 }}
            className="relative bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-500/20 p-5 rounded-2xl overflow-hidden"
          >
            <motion.div 
              className="absolute -top-10 -right-10 w-40 h-40 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <div className="relative flex items-start gap-3">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-purple-900 dark:text-purple-300 text-lg">AI Image Detection</h3>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  The AI visual search will automatically use all categories and subcategories listed above when detecting products from images.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* === ORDERS TAB (UPDATED FOR BKASH) === */}
      {activeTab === "orders" && (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6 relative"
        >
          {orders.map((o, index) => (
             <motion.div 
               key={o.id} 
               variants={cardVariants}
               whileHover={{ scale: 1.01, x: 5 }}
               className="relative bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg rounded-3xl border border-gray-100 dark:border-white/10 shadow-lg transition-all overflow-hidden group"
             >
               {/* Animated glow on hover */}
               <motion.div 
                 className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 rounded-[28px] blur-lg opacity-0 group-hover:opacity-20 transition-opacity"
               />
               
               {/* Order Header */}
               <div className="relative bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-dark-700 dark:to-dark-700/50 px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-white/10">
                 <div className="flex items-center gap-3">
                   <div className="bg-white dark:bg-dark-600 p-2.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                      <PackageCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                   </div>
                   <div>
                     <p className="font-bold text-gray-900 dark:text-white text-lg">Order #{o.id.slice(0,6).toUpperCase()}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3"/> 
                        {o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleString() : "Just Now"}
                     </p>
                   </div>
                 </div>

                 <div className="flex items-center gap-3">
                    {/* Payment Status Badge (CLICKABLE TO TOGGLE) */}
                    <button 
                      onClick={() => togglePaymentStatus(o)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all hover:scale-105 ${
                        o.paymentStatus === "Paid" 
                          ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30" 
                          : o.paymentStatus === "Verify TrxID" 
                            ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30 animate-pulse" // Bright Orange for TrxID
                            : "bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30"
                      }`}
                    >
                      {o.paymentStatus === "Paid" ? <CheckCircle className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>}
                      {o.paymentStatus || "Pending"}
                    </button>

                    {/* Order Status Dropdown */}
                    <select 
                      value={o.status} 
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)} 
                      className={`px-4 py-2 rounded-xl text-sm font-bold border outline-none cursor-pointer transition ${
                        o.status === 'Delivered' ? 'bg-green-600 text-white border-green-600' : 
                        o.status === 'Shipped' ? 'bg-purple-600 text-white border-purple-600' : 
                        o.status === 'Cancelled' ? 'bg-red-600 text-white border-red-600' :
                        'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10'
                      }`}
                    >
                      <option className="text-gray-900 bg-white" value="Pending">Pending</option>
                      <option className="text-gray-900 bg-white" value="Processing">Processing</option>
                      <option className="text-gray-900 bg-white" value="Shipped">Shipped</option>
                      <option className="text-gray-900 bg-white" value="Delivered">Delivered</option>
                      <option className="text-red-600 bg-white" value="Cancelled">Cancelled</option>
                    </select>

                    {/* Cancel/Delete Order Button */}
                    <button 
                      onClick={() => cancelOrder(o.id)}
                      className="p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                 </div>
               </div>

               {/* Order Body */}
               <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                 
                 {/* Customer Info */}
                 <div className="space-y-2">
                   <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                   <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-500/20 dark:to-accent-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
                        {o.userEmail?.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{o.userEmail}</span>
                   </p>
                   {o.userPhone && (
                     <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 ml-1">
                       <Phone className="w-3.5 h-3.5 text-gray-400"/> {o.userPhone}
                     </p>
                   )}
                 </div>

                 {/* Shipping Info */}
                 <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shipping To</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"/>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-dark-700 p-3 rounded-xl w-full border border-gray-100 dark:border-white/10">
                        {o.address || "No address provided"}
                      </p>
                    </div>
                 </div>

                 {/* Payment & Total */}
                 <div className="space-y-2 md:text-right">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Details</p>
                    <div className="flex flex-col md:items-end gap-1">
                       {/* Shows TrxID specifically */}
                       <span className={`text-sm font-semibold flex items-center gap-1.5 ${o.paymentMethod?.includes('bKash') ? 'text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          <CreditCard className="w-4 h-4"/> {o.paymentMethod || "Cash on Delivery"}
                       </span>
                       <span className="text-3xl font-black text-gray-900 dark:text-white">৳{o.totalAmount}</span>
                    </div>
                 </div>
               </div>

               {/* Order Items */}
               <div className="relative bg-gray-50 dark:bg-dark-700 px-6 py-4 border-t border-gray-100 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-2 items-center">
                  <span className="font-bold mr-2 text-gray-700 dark:text-gray-300">Items:</span>
                  {o.items?.map((item, idx) => (
                    <motion.span 
                      key={idx} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="bg-white dark:bg-dark-600 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-xl text-xs shadow-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                       {item.quantity}x {item.title}
                    </motion.span>
                  ))}
               </div>
             </motion.div>
           ))}
        </motion.div>
      )}
    </div>
  );
};

export default Admin;