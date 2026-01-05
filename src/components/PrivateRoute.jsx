// src/components/PrivateRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // 1. Not Logged In? -> Go to Login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. Logged In BUT Not Verified? -> Go to Login (effectively blocking them)
  if (!user.emailVerified) {
    // You could also redirect to a specific "Verify Email" page, 
    // but sending them back to login is the strict behavior you asked for.
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;