// src/context/MobileViewContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const MobileViewContext = createContext();

export const useMobileView = () => {
  const context = useContext(MobileViewContext);
  if (!context) {
    throw new Error("useMobileView must be used within a MobileViewProvider");
  }
  return context;
};

export const MobileViewProvider = ({ children }) => {
  // Check if the device is actually a mobile device
  const isActualMobile = () => {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Initialize state: default to mobile view if on actual mobile device
  const [isMobileViewEnabled, setIsMobileViewEnabled] = useState(() => {
    const saved = localStorage.getItem("mobileViewEnabled");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return isActualMobile();
  });

  // Persist preference to localStorage
  useEffect(() => {
    localStorage.setItem("mobileViewEnabled", JSON.stringify(isMobileViewEnabled));
  }, [isMobileViewEnabled]);

  // Auto-enable on actual mobile devices when first visiting
  useEffect(() => {
    if (isActualMobile() && localStorage.getItem("mobileViewEnabled") === null) {
      setIsMobileViewEnabled(true);
    }
  }, []);

  const toggleMobileView = () => {
    setIsMobileViewEnabled((prev) => !prev);
  };

  return (
    <MobileViewContext.Provider value={{ isMobileViewEnabled, toggleMobileView, isActualMobile: isActualMobile() }}>
      {children}
    </MobileViewContext.Provider>
  );
};
