// src/pages/Success.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Sparkles } from "lucide-react";

const Success = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-gray-50 via-white to-green-50/30 dark:from-dark-950 dark:via-dark-900 dark:to-emerald-900/10">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/20 dark:bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative text-center max-w-md"
      >
        {/* Success Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mx-auto mb-8"
        >
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30 mx-auto">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          
          {/* Floating decorations */}
          <motion.div 
            animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-amber-400" />
          </motion.div>
          <motion.div 
            animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
            className="absolute -bottom-2 -left-2"
          >
            <Package className="w-7 h-7 text-primary-400" />
          </motion.div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Order Confirmed!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
            Thank you for your purchase! Your order has been received and is being processed.
          </p>
        </motion.div>

        {/* Status cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-soft">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Status</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">Processing</p>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-soft">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Delivery</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">2-3 Days</p>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link 
            to="/dashboard" 
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 font-semibold border border-gray-200 dark:border-white/10 shadow-soft hover:shadow-soft-lg hover:border-gray-300 dark:hover:border-white/20 transition-all"
          >
            View Order Status
          </Link>
          <Link 
            to="/shop" 
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Success;