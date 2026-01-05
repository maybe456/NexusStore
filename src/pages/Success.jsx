// src/pages/Success.jsx
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Success = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
      <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Successful!</h1>
      <p className="text-gray-600 mb-8 text-lg">
        Thank you for your purchase. Your order is being processed.
      </p>
      <Link 
        to="/" 
        className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default Success;