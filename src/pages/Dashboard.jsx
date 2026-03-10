// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { Package, User, Edit, Save, X, ShoppingBag, MapPin, Phone, Mail, Clock, CheckCircle, Truck, AlertCircle, Sparkles, Crown, Zap } from "lucide-react";
import { ScatteredFloatingIcons } from "../components/Interactive3D"; 

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [userData, setUserData] = useState({ username: "", phone: "", address: "" });
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        await user.reload();

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) setUserData(userDoc.data());

        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        ordersList.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: userData.username,
        phone: userData.phone,
        address: userData.address
      });
      setIsEditing(false);
      alert("Profile Updated Successfully!");
    } catch (error) { alert("Error updating profile"); }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case "delivered": return "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400";
      case "shipped": return "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400";
      case "processing": return "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400";
      default: return "bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case "delivered": return CheckCircle;
      case "shipped": return Truck;
      case "processing": return Clock;
      default: return AlertCircle;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950 relative overflow-hidden">
        <motion.div 
          className="absolute top-20 left-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div 
            className="w-24 h-24 bg-gray-100 dark:bg-dark-800 rounded-3xl flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Please log in to view your dashboard.</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-dark-700 border-t-primary-500 animate-spin"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 relative overflow-hidden">
      {/* Scattered floating icons */}
      <ScatteredFloatingIcons density="sparse" />
      
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-10"
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3"
            whileHover={{ scale: 1.01 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="w-10 h-10 text-yellow-500"/>
            </motion.div>
            <span className="bg-gradient-to-r from-gray-900 via-primary-600 to-accent-500 dark:from-white dark:via-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
              My Account
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>
          </motion.h1>
          <motion.p 
            className="text-gray-500 dark:text-gray-400 mt-2 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Manage your profile and view orders
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* PROFILE CARD */}
          <motion.div 
            initial={{ opacity: 0, x: -50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="lg:col-span-1"
            style={{ perspective: "1000px" }}
          >
            <div className="relative group">
              {/* Animated glow */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 rounded-[28px] blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500"
              />
              
              <div className="relative bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <motion.h2 
                    className="text-lg font-bold flex items-center gap-3 text-gray-900 dark:text-white"
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <User className="w-5 h-5 text-white"/>
                    </motion.div>
                    Profile
                  </motion.h2>
                  {!isEditing && (
                    <motion.button 
                      onClick={() => setIsEditing(true)} 
                      className="text-primary-600 dark:text-primary-400 text-sm font-bold hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit className="w-4 h-4"/> Edit
                    </motion.button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.form 
                      key="edit-form"
                      onSubmit={handleUpdateProfile} 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-2 uppercase tracking-wider">Username</label>
                        <motion.input 
                          type="text" 
                          className="w-full p-4 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400" 
                          value={userData.username} 
                          onChange={e=>setUserData({...userData, username: e.target.value})} 
                          required
                          whileFocus={{ scale: 1.02 }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-2 uppercase tracking-wider">Phone</label>
                        <motion.input 
                          type="tel" 
                          className="w-full p-4 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400" 
                          value={userData.phone} 
                          onChange={e=>setUserData({...userData, phone: e.target.value})} 
                          required
                          whileFocus={{ scale: 1.02 }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-2 uppercase tracking-wider">Address</label>
                        <motion.textarea 
                          className="w-full p-4 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all resize-none text-gray-900 dark:text-white placeholder:text-gray-400" 
                          rows="3" 
                          value={userData.address} 
                          onChange={e=>setUserData({...userData, address: e.target.value})}
                          whileFocus={{ scale: 1.02 }}
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <motion.button 
                          type="submit" 
                          className="flex-1 bg-gradient-to-r from-primary-600 to-accent-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Save className="w-5 h-5" /> Save
                        </motion.button>
                        <motion.button 
                          type="button" 
                          onClick={() => setIsEditing(false)} 
                          className="flex-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <X className="w-5 h-5" /> Cancel
                        </motion.button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="profile-view"
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {[
                        { icon: User, label: "Username", value: userData.username || "Not set" },
                        { icon: Mail, label: "Email", value: user.email },
                        { icon: Phone, label: "Phone", value: userData.phone || "Not set" },
                        { icon: MapPin, label: "Address", value: userData.address || "Not set" }
                      ].map((item, index) => (
                        <motion.div 
                          key={item.label}
                          className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-dark-700 rounded-xl group hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                          >
                            <item.icon className="w-5 h-5 text-primary-500 mt-0.5" />
                          </motion.div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm break-all">{item.value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* ORDERS SECTION */}
          <motion.div 
            initial={{ opacity: 0, x: 50, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
            className="lg:col-span-2"
            style={{ perspective: "1000px" }}
          >
            <div className="relative group">
              {/* Animated glow */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-accent-500 via-purple-500 to-pink-500 rounded-[28px] blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500"
              />
              
              <div className="relative bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div 
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <ShoppingBag className="w-5 h-5 text-white"/>
                  </motion.div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order History</h2>
                  <motion.span 
                    className="ml-auto px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-sm font-bold shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {orders.length} orders
                  </motion.span>
                </div>

                {orders.length === 0 ? (
                  <motion.div 
                    className="text-center py-16"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Package className="w-20 h-20 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                    </motion.div>
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">No orders yet</p>
                    <p className="text-gray-400 dark:text-gray-500 mt-2">Your order history will appear here</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-4 max-h-[500px] overflow-y-auto pr-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {orders.map((order, index) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <motion.div 
                          key={order.id}
                          variants={itemVariants}
                          className="p-5 bg-gray-50 dark:bg-dark-700 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary-200 dark:hover:border-primary-500/30 transition-all group/order"
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Order ID</p>
                              <p className="font-mono text-sm text-gray-900 dark:text-white">{order.id.slice(0,8)}...</p>
                            </div>
                            <motion.span 
                              className={"px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg " + getStatusColor(order.status)}
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <StatusIcon className="w-4 h-4" />
                              {order.status}
                            </motion.span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {order.items?.slice(0, 3).map((item, i) => (
                              <motion.div 
                                key={i} 
                                className="w-14 h-14 bg-white dark:bg-dark-600 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-md"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                              >
                                <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                              </motion.div>
                            ))}
                            {order.items?.length > 3 && (
                              <motion.div 
                                className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-600 dark:to-dark-500 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-bold shadow-md"
                                whileHover={{ scale: 1.1 }}
                              >
                                +{order.items.length - 3}
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {order.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                            </span>
                            <motion.span 
                              className="font-extrabold text-lg bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent"
                              whileHover={{ scale: 1.05 }}
                            >
                              ৳{order.totalAmount?.toLocaleString()}
                            </motion.span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;