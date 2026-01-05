// src/components/AdminRoute.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null); // null = loading

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        // Check if the 'role' field in database is 'admin'
        if (userSnap.exists() && userSnap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          navigate("/"); // Kick non-admins to Home
        }
      } catch (error) {
        console.error("Error checking role:", error);
        navigate("/");
      }
    };
    checkRole();
  }, [user, navigate]);

  if (isAdmin === null) return <div className="p-10 text-center">Checking permissions...</div>;
  
  return isAdmin ? children : null;
};

export default AdminRoute;