// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop"; // Import the new page
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import Dashboard from "./pages/Dashboard";
import ProductDetails from "./pages/ProductDetails";
import SeedData from "./pages/SeedData";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Chatbot from "./components/Chatbot";
import MobileSearch from "./components/MobileSearch";
import MobileViewWrapper from "./components/MobileViewWrapper";
import LavaLampBackground from "./components/LavaLampBackground";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { MobileViewProvider, useMobileView } from "./context/MobileViewContext";
import { ThemeProvider } from "./context/ThemeContext";

// Inner component to access mobile view context
const AppContent = () => {
  const { isMobileViewEnabled, isActualMobile } = useMobileView();
  const showMobileSearch = isMobileViewEnabled && !isActualMobile;

  return (
    <MobileViewWrapper>
      <LavaLampBackground />
      <div className="min-h-screen transition-colors duration-300 font-sans mobile-content relative z-10">
        <Navbar />
        <Routes>
          {/* Home is now the Landing Page */}
          <Route path="/" element={<Home />} />
          
          {/* Shop is the Discover/Filter Page */}
          <Route path="/shop" element={<Shop />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/success" element={<PrivateRoute><Success /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/seed" element={<SeedData />} />
        </Routes>
        <Chatbot />
        {showMobileSearch && <MobileSearch />}
      </div>
    </MobileViewWrapper>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MobileViewProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </MobileViewProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;