// src/components/MobileViewWrapper.jsx
import { useMobileView } from "../context/MobileViewContext";

const MobileViewWrapper = ({ children }) => {
  const { isMobileViewEnabled, isActualMobile } = useMobileView();

  // If on actual mobile or mobile view is disabled, render normally
  if (isActualMobile || !isMobileViewEnabled) {
    return <div className="desktop-mode">{children}</div>;
  }

  // On desktop with mobile view enabled, show phone frame
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Mobile Mode Styles */}
      <style>{`
        .mobile-frame-content {
          font-size: 14px;
        }
        .mobile-frame-content .mobile-content {
          transform-origin: top center;
        }
        /* Scale down text sizes for mobile */
        .mobile-frame-content h1 { font-size: 1.5rem !important; line-height: 1.3 !important; }
        .mobile-frame-content h2 { font-size: 1.25rem !important; line-height: 1.3 !important; }
        .mobile-frame-content h3 { font-size: 1rem !important; }
        .mobile-frame-content p { font-size: 0.8rem !important; }
        .mobile-frame-content span { font-size: inherit; }
        .mobile-frame-content .text-5xl, 
        .mobile-frame-content .text-7xl { font-size: 1.75rem !important; line-height: 1.2 !important; }
        .mobile-frame-content .text-4xl { font-size: 1.5rem !important; }
        .mobile-frame-content .text-3xl { font-size: 1.25rem !important; }
        .mobile-frame-content .text-2xl { font-size: 1.125rem !important; }
        .mobile-frame-content .text-xl { font-size: 1rem !important; }
        .mobile-frame-content .text-lg { font-size: 0.9rem !important; }
        .mobile-frame-content .text-base { font-size: 0.8rem !important; }
        .mobile-frame-content .text-sm { font-size: 0.75rem !important; }
        .mobile-frame-content .text-xs { font-size: 0.65rem !important; }
        
        /* Adjust padding and margins for mobile */
        .mobile-frame-content .container { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        .mobile-frame-content .px-4 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        .mobile-frame-content .px-6 { padding-left: 1rem !important; padding-right: 1rem !important; }
        .mobile-frame-content .px-10 { padding-left: 1rem !important; padding-right: 1rem !important; }
        .mobile-frame-content .py-10 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
        .mobile-frame-content .py-16 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
        .mobile-frame-content .py-20 { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
        .mobile-frame-content .p-8, .mobile-frame-content .p-10, .mobile-frame-content .p-12 { padding: 1rem !important; }
        .mobile-frame-content .gap-6 { gap: 1rem !important; }
        .mobile-frame-content .gap-8 { gap: 1.25rem !important; }
        .mobile-frame-content .gap-12 { gap: 1.5rem !important; }
        .mobile-frame-content .space-x-6 > * + * { margin-left: 0.75rem !important; }
        
        /* Make grids single column on mobile */
        .mobile-frame-content .grid { grid-template-columns: 1fr !important; }
        .mobile-frame-content .lg\\:grid-cols-12 { grid-template-columns: 1fr !important; }
        .mobile-frame-content .lg\\:col-span-6 { grid-column: span 1 !important; }
        .mobile-frame-content .md\\:grid-cols-2 { grid-template-columns: 1fr !important; }
        .mobile-frame-content .md\\:grid-cols-3 { grid-template-columns: 1fr !important; }
        .mobile-frame-content .xl\\:grid-cols-3 { grid-template-columns: 1fr !important; }
        
        /* Adjust card heights */
        .mobile-frame-content .h-\\[500px\\] { height: 220px !important; }
        .mobile-frame-content .h-\\[400px\\] { height: 180px !important; }
        .mobile-frame-content .h-\\[600px\\] { height: auto !important; }
        .mobile-frame-content .lg\\:h-full { height: auto !important; }
        .mobile-frame-content .lg\\:h-auto { height: 180px !important; }
        
        /* Home page bento grid fixes */
        .mobile-frame-content .lg\\:col-span-6 { 
          grid-column: span 1 !important; 
          height: 200px !important;
        }
        .mobile-frame-content .lg\\:col-span-6 .flex-1 { 
          flex: none !important;
          height: 180px !important;
        }
        .mobile-frame-content .lg\\:col-span-6.flex.flex-col { 
          height: auto !important;
          gap: 0.75rem !important;
        }
        
        /* Hero section adjustments */
        .mobile-frame-content .py-10.md\\:py-16 { 
          padding-top: 1rem !important; 
          padding-bottom: 1rem !important; 
        }
        .mobile-frame-content .space-y-4 { gap: 0.5rem !important; }
        .mobile-frame-content .mb-2 { margin-bottom: 0.25rem !important; }
        
        /* Trust section icon fixes */
        .mobile-frame-content .w-16.h-16.flex-shrink-0 { 
          width: 2.5rem !important; 
          height: 2.5rem !important;
          min-width: 2.5rem !important;
          min-height: 2.5rem !important;
        }
        .mobile-frame-content .w-16.h-16.flex-shrink-0 svg { 
          width: 1.25rem !important; 
          height: 1.25rem !important;
        }
        .mobile-frame-content .flex.flex-col.md\\:flex-row.items-center { 
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
        }
        .mobile-frame-content .md\\:items-start { 
          align-items: center !important; 
        }
        .mobile-frame-content .md\\:text-left { 
          text-align: center !important; 
        }
        
        /* Scale rounded corners */
        .mobile-frame-content .rounded-\\[2\\.5rem\\] { border-radius: 1.25rem !important; }
        .mobile-frame-content .rounded-\\[3rem\\] { border-radius: 1.5rem !important; }
        .mobile-frame-content .rounded-2xl { border-radius: 0.75rem !important; }
        
        /* Navbar adjustments */
        .mobile-frame-content nav { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .mobile-frame-content nav .container { flex-wrap: wrap; gap: 0.5rem; }
        .mobile-frame-content nav .text-2xl { font-size: 1rem !important; }
        .mobile-frame-content nav .hidden.md\\:flex { display: none !important; }
        .mobile-frame-content nav .hidden.md\\:block { display: none !important; }
        .mobile-frame-content nav .hidden.md\\:inline { display: none !important; }
        .mobile-frame-content nav .desktop-search { display: none !important; }
        .mobile-frame-content nav .w-6 { width: 1.25rem !important; height: 1.25rem !important; }
        .mobile-frame-content nav .space-x-4 > * + * { margin-left: 0.5rem !important; }
        .mobile-frame-content nav .space-x-6 > * + * { margin-left: 0.5rem !important; }
        
        /* Mobile floating search */
        .mobile-frame-content .mobile-search-container {
          position: absolute !important;
          bottom: 0.5rem !important;
          left: 0.5rem !important;
          z-index: 50 !important;
        }
        .mobile-frame-content .mobile-search-container button {
          padding: 0.625rem !important;
        }
        .mobile-frame-content .mobile-search-container .w-6 {
          width: 1.25rem !important;
          height: 1.25rem !important;
        }
        .mobile-frame-content .mobile-search-container .w-72 {
          width: 260px !important;
        }
        .mobile-frame-content .mobile-search-container .bottom-14 {
          bottom: 3rem !important;
        }
        
        /* Product cards */
        .mobile-frame-content .h-56 { height: 10rem !important; }
        .mobile-frame-content .p-5 { padding: 0.75rem !important; }
        
        /* Sidebar adjustments - Shop page filter */
        .mobile-frame-content .lg\\:w-64 { width: 100% !important; }
        .mobile-frame-content .lg\\:sticky { position: relative !important; }
        .mobile-frame-content .lg\\:top-24 { top: 0 !important; }
        .mobile-frame-content aside, 
        .mobile-frame-content .shop-filter { 
          margin-bottom: 0.75rem !important; 
          padding: 0.75rem !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .mobile-frame-content aside .mb-4 { margin-bottom: 0.5rem !important; }
        .mobile-frame-content aside h2 { font-size: 0.85rem !important; }
        .mobile-frame-content aside h3 { font-size: 0.65rem !important; }
        .mobile-frame-content aside .space-y-1\\.5 > * + * { margin-top: 0.25rem !important; }
        .mobile-frame-content aside label span { font-size: 0.75rem !important; }
        
        /* Shop page grid - single column */
        .mobile-frame-content .grid.grid-cols-1 { 
          grid-template-columns: 1fr !important; 
          gap: 0.75rem !important;
        }
        
        /* Shop page container */
        .mobile-frame-content .lg\\:gap-8 { gap: 0.75rem !important; }
        .mobile-frame-content .gap-4 { gap: 0.5rem !important; }
        
        /* Flex direction adjustments */
        .mobile-frame-content .lg\\:flex-row { flex-direction: column !important; }
        .mobile-frame-content .md\\:flex-row { flex-direction: column !important; }
        .mobile-frame-content .sm\\:flex-row { flex-direction: column !important; }
        
        /* Cart page specific */
        .mobile-frame-content .lg\\:w-1\\/3 { 
          width: 100% !important; 
        }
        .mobile-frame-content .sm\\:items-center { 
          align-items: flex-start !important; 
        }
        .mobile-frame-content .w-20 { width: 4rem !important; }
        .mobile-frame-content .h-20 { height: 4rem !important; }
        .mobile-frame-content .space-x-4 > * + * { margin-left: 0.5rem !important; }
        .mobile-frame-content .gap-6 { gap: 0.75rem !important; }
        .mobile-frame-content .space-y-4 > * + * { margin-top: 0.75rem !important; }
        
        /* Order summary card */
        .mobile-frame-content .sticky.top-24 { 
          position: relative !important; 
          top: 0 !important; 
        }
        
        /* Product details page */
        .mobile-frame-content .md\\:w-1\\/2 { 
          width: 100% !important; 
        }
        .mobile-frame-content .max-h-96 { 
          max-height: 12rem !important; 
        }
        .mobile-frame-content .gap-10 { gap: 1rem !important; }
        
        /* Size selector buttons */
        .mobile-frame-content .gap-2 { gap: 0.375rem !important; }
        .mobile-frame-content .px-4.py-2 { 
          padding: 0.375rem 0.625rem !important; 
          font-size: 0.7rem !important;
        }
        
        /* Icon sizes */
        .mobile-frame-content .w-8.h-8 { width: 1.25rem !important; height: 1.25rem !important; }
        .mobile-frame-content .w-16.h-16 { width: 2.5rem !important; height: 2.5rem !important; }
        
        /* Trust section - ensure circles don't become ovals */
        .mobile-frame-content section.py-20.border-t { 
          padding-top: 1.5rem !important; 
          padding-bottom: 1.5rem !important; 
        }
        .mobile-frame-content section.py-20.border-t .grid { 
          gap: 1.25rem !important; 
        }
        .mobile-frame-content section.py-20.border-t .gap-6 { 
          gap: 0.5rem !important; 
        }
        
        /* Button and input scaling */
        .mobile-frame-content button { font-size: 0.75rem !important; padding: 0.5rem 0.75rem !important; }
        .mobile-frame-content input { font-size: 0.8rem !important; padding: 0.5rem !important; }
        .mobile-frame-content select { font-size: 0.75rem !important; padding: 0.5rem !important; }
        .mobile-frame-content textarea { font-size: 0.8rem !important; padding: 0.5rem !important; }
        
        /* Form styling */
        .mobile-frame-content form { gap: 0.75rem !important; }
        .mobile-frame-content label { font-size: 0.75rem !important; }
        
        /* Hide certain desktop elements */
        .mobile-frame-content .hidden.lg\\:block { display: none !important; }
        
        /* Dropdown positioning */
        .mobile-frame-content .absolute { font-size: 0.75rem !important; }
        .mobile-frame-content .w-56 { width: 12rem !important; }
        .mobile-frame-content .w-52 { width: 11rem !important; }
        
        /* Login page adjustments */
        .mobile-frame-content .max-w-md { max-width: 100% !important; padding: 1rem !important; }
        .mobile-frame-content .rounded-3xl { border-radius: 1rem !important; }
        .mobile-frame-content .shadow-2xl { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important; }
        
        /* Cart page */
        .mobile-frame-content .h-\\[60vh\\] { height: auto !important; min-height: 200px !important; }
        .mobile-frame-content .h-24 { height: 4rem !important; }
        .mobile-frame-content .w-24 { width: 4rem !important; }
        
        /* Cart item layout */
        .mobile-frame-content .flex.flex-col.sm\\:flex-row { 
          flex-direction: column !important; 
        }
        .mobile-frame-content .flex.items-center.gap-6 { 
          gap: 0.5rem !important;
          flex-wrap: wrap !important;
          justify-content: flex-start !important;
        }
        .mobile-frame-content .px-4 { 
          padding-left: 0.5rem !important; 
          padding-right: 0.5rem !important; 
        }
        .mobile-frame-content .py-3 { 
          padding-top: 0.5rem !important; 
          padding-bottom: 0.5rem !important; 
        }
        .mobile-frame-content .py-4 { 
          padding-top: 0.625rem !important; 
          padding-bottom: 0.625rem !important; 
        }
        
        /* Product details layout */
        .mobile-frame-content .md\\:p-10 { padding: 0.75rem !important; }
        .mobile-frame-content .p-6 { padding: 0.75rem !important; }
        .mobile-frame-content .bg-gray-100.rounded-xl { 
          padding: 0.5rem !important; 
          min-height: 150px !important;
        }
        .mobile-frame-content .space-y-4 > * + * { margin-top: 0.5rem !important; }
        .mobile-frame-content .space-y-3 > * + * { margin-top: 0.375rem !important; }
        
        /* Product details specific */
        .mobile-frame-content .product-details-card { 
          padding: 0.75rem !important; 
          gap: 0.75rem !important;
        }
        .mobile-frame-content .product-image-container { 
          padding: 0.5rem !important;
          min-height: auto !important;
        }
        .mobile-frame-content .product-image-container img {
          max-height: 10rem !important;
        }
        .mobile-frame-content .product-info { 
          gap: 0.5rem !important; 
        }
        
        /* Cart specific */
        .mobile-frame-content .cart-items-list { 
          gap: 0.5rem !important; 
        }
        .mobile-frame-content .cart-item { 
          padding: 0.625rem !important; 
        }
        .mobile-frame-content .cart-item img { 
          width: 3.5rem !important; 
          height: 3.5rem !important; 
        }
        .mobile-frame-content .order-summary-container { 
          width: 100% !important; 
          margin-top: 0.5rem !important;
        }
        .mobile-frame-content .order-summary-container > div { 
          padding: 0.75rem !important; 
        }
        
        /* Dashboard & Admin panels */
        .mobile-frame-content .max-w-4xl { max-width: 100% !important; }
        .mobile-frame-content .max-w-6xl { max-width: 100% !important; }
        .mobile-frame-content .min-h-screen { min-height: auto !important; }
        
        /* Table adjustments */
        .mobile-frame-content table { font-size: 0.65rem !important; }
        .mobile-frame-content th, .mobile-frame-content td { padding: 0.375rem !important; }
        .mobile-frame-content .overflow-x-auto { overflow-x: auto !important; }
        
        /* Modal/Alert adjustments */
        .mobile-frame-content .fixed.inset-0 { position: absolute !important; }
        
        /* Success page */
        .mobile-frame-content .animate-bounce { animation: none !important; }
        
        /* Product details */
        .mobile-frame-content .max-w-5xl { max-width: 100% !important; }
        .mobile-frame-content .h-96 { height: 14rem !important; }
        
        /* Flex grow elements */
        .mobile-frame-content .flex-1 { flex: 1 1 auto !important; min-width: 0 !important; }
        
        /* Chatbot scaling */
        .mobile-frame-content .chatbot-container { 
          bottom: 0.5rem !important; 
          right: 0.5rem !important; 
          position: absolute !important;
        }
        .mobile-frame-content .chatbot-window { 
          width: 280px !important; 
          height: 320px !important;
        }
        .mobile-frame-content .chatbot-container button { 
          padding: 0.625rem !important; 
        }
        .mobile-frame-content .chatbot-container .w-6 { 
          width: 1.25rem !important; 
          height: 1.25rem !important; 
        }
      `}</style>
      
      {/* Phone Frame */}
      <div className="relative">
        {/* Phone Outer Frame */}
        <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-purple-500/20">
          {/* Phone Inner Bezel */}
          <div className="bg-black rounded-[2.5rem] p-2 relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-16 h-4 bg-gray-900 rounded-full flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                <div className="w-8 h-2 rounded-full bg-gray-800"></div>
              </div>
            </div>
            
            {/* Screen Container */}
            <div 
              className="bg-white rounded-[2rem] overflow-hidden relative mobile-frame-content"
              style={{ 
                width: '375px', 
                height: '812px',
              }}
            >
              {/* Scrollable Content */}
              <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {children}
              </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* Side Buttons */}
        <div className="absolute left-0 top-28 w-1 h-8 bg-gray-700 rounded-l-lg -translate-x-full"></div>
        <div className="absolute left-0 top-44 w-1 h-16 bg-gray-700 rounded-l-lg -translate-x-full"></div>
        <div className="absolute left-0 top-64 w-1 h-16 bg-gray-700 rounded-l-lg -translate-x-full"></div>
        <div className="absolute right-0 top-36 w-1 h-20 bg-gray-700 rounded-r-lg translate-x-full"></div>

        {/* Device Label */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-gray-400 text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Mobile Preview Mode (375×812)
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-4 left-4 text-gray-500 text-sm hidden lg:block">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <p className="text-gray-400">NexusStore - Mobile View</p>
      </div>
    </div>
  );
};

export default MobileViewWrapper;
