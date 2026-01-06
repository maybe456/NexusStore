// src/pages/Admin.jsx
import { useState, useEffect, useMemo } from "react";
import { db } from "../lib/firebase"; 
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"; 
import { generateDescription, askRealAI } from "../lib/gemini"; 
import { Sparkles, Edit, Trash2, X, Database, PlusSquare, TrendingUp, DollarSign, AlertTriangle, PackageCheck, Phone, MapPin, Calendar, CreditCard, CheckCircle, Clock } from "lucide-react"; 
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from "framer-motion";

// --- INTERNAL CONSTANTS ---
const CATEGORY_TREE = {
  Electronics: ["Smartphones", "Laptops", "Headsets", "Keyboards", "Mice", "Cameras", "Monitors"],
  Fashion: ["Men's Clothing", "Women's Clothing", "Shoes", "Watches", "Accessories"],
  Home: ["Furniture", "Decor", "Kitchen", "Lighting"]
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const STATUS_COLORS = { Pending: '#f59e0b', Processing: '#3b82f6', Shipped: '#8b5cf6', Delivered: '#10b981', Cancelled: '#ef4444' };

const hasSizes = (category) => category === "Fashion";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("analytics");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null); 

  // Form State
  const [formData, setFormData] = useState({
    title: "", price: "", category: "Electronics", subCategory: "Smartphones", 
    image: "", description: "", stock: 10, sizes: { S: 0, M: 0, L: 0, XL: 0 } 
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [analystQuestion, setAnalystQuestion] = useState("");
  const [analystAnswer, setAnalystAnswer] = useState("");

  // 1. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
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
    setFormData({ title: "", price: "", category: "Electronics", subCategory: "Smartphones", image: "", description: "", stock: 10, sizes: { S: 5, M: 5, L: 5, XL: 5 } });
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    let safeCategory = "Electronics";
    if (CATEGORY_TREE[product.category]) safeCategory = product.category;
    let safeSub = product.subCategory || CATEGORY_TREE[safeCategory][0];

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

  return (
    <div className="container mx-auto p-4 md:p-10 max-w-7xl min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Admin Command</h1>
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border">
           {["analytics", "products", "orders"].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)} 
               className={`px-4 py-2 rounded-lg font-bold capitalize transition-all ${activeTab===tab ? "bg-gray-900 text-white shadow" : "text-gray-500 hover:bg-gray-100"}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {/* === ANALYTICS TAB === */}
      {activeTab === "analytics" && analyticsData && (
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden group">
               <div className="absolute right-0 top-0 p-10 bg-blue-50 rounded-bl-full opacity-50 group-hover:scale-110 transition"></div>
               <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Revenue</p>
               <h3 className="text-3xl font-black text-gray-900 mt-2">৳{analyticsData.totalRevenue.toLocaleString()}</h3>
               <div className="mt-2 text-blue-600 text-xs font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12% vs last week</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
               <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Orders</p>
               <h3 className="text-3xl font-black text-gray-900 mt-2">{orders.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
               <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Low Stock Items</p>
               <h3 className="text-3xl font-black text-orange-600 mt-2">{products.filter(p => p.stock < 5).length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
               <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Avg Order Value</p>
               <h3 className="text-3xl font-black text-gray-900 mt-2">৳{orders.length ? Math.round(analyticsData.totalRevenue/orders.length) : 0}</h3>
            </div>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border h-[400px]">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><DollarSign className="w-5 h-5"/> Revenue Trend</h3>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={analyticsData.dailyData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v)=>`৳${v}`}/>
                  <Tooltip contentStyle={{background:'#1f2937', color:'#fff', borderRadius:'8px', border:'none'}}/>
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border h-[400px]">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue by Category</h3>
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
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-purple-600 w-5 h-5 animate-pulse"/>
              <h3 className="text-lg font-bold text-gray-800">AI Business Intelligence</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 h-48 overflow-y-auto mb-4 border border-gray-200 font-mono text-sm shadow-inner">
              {analystAnswer ? (
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">{analystAnswer}</div>
              ) : (
                <div className="text-gray-400 h-full flex items-center justify-center italic">
                  "I have access to your full inventory & sales data. Ask me anything."
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input 
                className="flex-grow bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition placeholder-gray-400" 
                placeholder="e.g., Which size of Nike Shoes is running low?" 
                value={analystQuestion} 
                onChange={e=>setAnalystQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskAnalyst()}
              />
              <button onClick={handleAskAnalyst} disabled={aiLoading} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-md disabled:opacity-50">
                {aiLoading ? "Thinking..." : "Analyze"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* === PRODUCTS TAB === */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
           <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border lg:sticky lg:top-24 z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">{editingId ? <Edit className="w-5 h-5 text-blue-600"/> : <PlusSquare className="w-5 h-5 text-green-600"/>}{editingId ? "Edit" : "Add"}</h2>
              {editingId && <button onClick={resetForm} className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3"/> Cancel</button>}
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-500 uppercase">Title</label><input className="w-full p-2 border rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-bold text-gray-500 uppercase">Category</label><select className="w-full p-2 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, subCategory: CATEGORY_TREE[e.target.value][0]})}>{Object.keys(CATEGORY_TREE).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Sub</label><select className="w-full p-2 border rounded" value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})}>{CATEGORY_TREE[formData.category]?.map(sc => <option key={sc} value={sc}>{sc}</option>)}</select></div>
              </div>
              <div className="bg-gray-50 p-3 rounded border"><label className="text-xs font-bold text-gray-500 block mb-2 uppercase">Stock</label>{hasSizes(formData.category) ? (<div className="grid grid-cols-4 gap-2">{Object.keys(formData.sizes).map(size => (<div key={size}><span className="text-xs block text-center font-semibold text-gray-600">{size}</span><input type="number" className="w-full p-1 border rounded text-center text-sm" value={formData.sizes[size]} onChange={e => setFormData({...formData, sizes: {...formData.sizes, [size]: Number(e.target.value)}})} /></div>))}</div>) : ( <input type="number" placeholder="Total Qty" className="w-full p-2 border rounded" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /> )}</div>
              <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-bold text-gray-500 uppercase">Price</label><input type="number" className="w-full p-2 border rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required /></div><div><label className="text-xs font-bold text-gray-500 uppercase">Image</label><input type="text" className="w-full p-2 border rounded" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required /></div></div>
              <div className="relative"><textarea className="w-full p-2 border rounded" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description..."></textarea><button type="button" onClick={handleAIGenerate} className="absolute top-2 right-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI</button></div>
              <button type="submit" className={`w-full py-3 rounded-lg font-bold text-white transition ${editingId ? "bg-blue-600" : "bg-green-600"}`}>{editingId ? "Update" : "Create"}</button>
            </form>
           </div>
           <div className="lg:col-span-2 space-y-4">{products.map(p => (<div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 items-center"><img src={p.image} className="w-12 h-12 rounded object-cover"/><div className="flex-grow"><h3 className="font-bold">{p.title}</h3><div className="text-xs text-gray-500">{p.stock} in stock • ৳{p.price}</div></div><div className="flex gap-2"><button onClick={()=>handleEdit(p)} className="p-2 text-blue-600 bg-blue-50 rounded"><Edit className="w-4 h-4"/></button><button onClick={()=>handleDelete(p.id)} className="p-2 text-red-600 bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button></div></div>))}</div>
        </div>
      )}

      {/* === ORDERS TAB (UPDATED FOR BKASH) === */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {orders.map(o => (
             <div key={o.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
               
               {/* Order Header */}
               <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b">
                 <div className="flex items-center gap-3">
                   <div className="bg-white p-2 rounded-lg border shadow-sm">
                      <PackageCheck className="w-6 h-6 text-blue-600" />
                   </div>
                   <div>
                     <p className="font-bold text-gray-800 text-lg">Order #{o.id.slice(0,6).toUpperCase()}</p>
                     <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3"/> 
                        {o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleString() : "Just Now"}
                     </p>
                   </div>
                 </div>

                 <div className="flex items-center gap-3">
                    {/* Payment Status Badge (CLICKABLE TO TOGGLE) */}
                    <button 
                      onClick={() => togglePaymentStatus(o)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 transition-all hover:scale-105 ${
                        o.paymentStatus === "Paid" 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : o.paymentStatus === "Verify TrxID" 
                            ? "bg-orange-100 text-orange-700 border-orange-200 animate-pulse" // Bright Orange for TrxID
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {o.paymentStatus === "Paid" ? <CheckCircle className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                      {o.paymentStatus || "Pending"}
                    </button>

                    {/* Order Status Dropdown */}
                    <select 
                      value={o.status} 
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)} 
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold border outline-none cursor-pointer ${
                        o.status === 'Delivered' ? 'bg-green-600 text-white' : 
                        o.status === 'Shipped' ? 'bg-purple-600 text-white' : 
                        o.status === 'Cancelled' ? 'bg-red-600 text-white' :
                        'bg-white text-gray-700'
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
                      className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                 </div>
               </div>

               {/* Order Body */}
               <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                 
                 {/* Customer Info */}
                 <div className="space-y-1">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                   <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {o.userEmail?.charAt(0).toUpperCase()}
                      </div>
                      {o.userEmail}
                   </p>
                   {o.userPhone && (
                     <p className="text-sm text-gray-600 flex items-center gap-2 ml-1">
                       <Phone className="w-3 h-3 text-gray-400"/> {o.userPhone}
                     </p>
                   )}
                 </div>

                 {/* Shipping Info */}
                 <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping To</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"/>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-2 rounded w-full border">
                        {o.address || "No address provided"}
                      </p>
                    </div>
                 </div>

                 {/* Payment & Total */}
                 <div className="space-y-1 md:text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details</p>
                    <div className="flex flex-col md:items-end gap-1">
                       {/* Shows TrxID specifically */}
                       <span className={`text-sm font-semibold flex items-center gap-1 ${o.paymentMethod?.includes('bKash') ? 'text-pink-600' : 'text-gray-700'}`}>
                          <CreditCard className="w-3 h-3"/> {o.paymentMethod || "Cash on Delivery"}
                       </span>
                       <span className="text-2xl font-black text-gray-900">৳{o.totalAmount}</span>
                    </div>
                 </div>
               </div>

               {/* Order Items */}
               <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-600 flex flex-wrap gap-2 items-center">
                  <span className="font-bold mr-2">Items:</span>
                  {o.items?.map((item, idx) => (
                    <span key={idx} className="bg-white border px-2 py-1 rounded text-xs shadow-sm">
                       {item.quantity}x {item.title}
                    </span>
                  ))}
               </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default Admin;