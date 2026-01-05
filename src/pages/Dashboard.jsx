// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { Package, User, Edit, Save, X } from "lucide-react"; 

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
        // 1. Force Refresh User Status
        await user.reload();

        // 2. Fetch User Profile
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) setUserData(userDoc.data());

        // 3. Fetch Orders
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

  if (!user) return <div className="p-10 text-center">Please log in.</div>;

  return (
    <div className="container mx-auto p-4 md:p-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PROFILE CARD */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><User className="w-5 h-5"/> Profile</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                  <Edit className="w-3 h-3"/> Edit
                </button>
              )}
            </div>

            {/* Verification Status Block Removed Here */}

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 font-bold">Username</label>
                  <input type="text" className="w-full p-2 border rounded" value={userData.username} onChange={e=>setUserData({...userData, username: e.target.value})} required />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Phone</label>
                  <input type="tel" className="w-full p-2 border rounded" value={userData.phone} onChange={e=>setUserData({...userData, phone: e.target.value})} required />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Address</label>
                  <textarea className="w-full p-2 border rounded" rows="2" value={userData.address} onChange={e=>setUserData({...userData, address: e.target.value})} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Save</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-bold hover:bg-gray-300">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Username</p>
                  <p className="font-medium text-gray-800">{userData.username || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                  <p className="font-medium text-gray-800">{userData.phone || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Address</p>
                  <p className="font-medium text-gray-800 text-sm">{userData.address || "No address saved"}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ORDER HISTORY */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Package className="w-5 h-5"/> Order History</h2>
          {loading ? <p>Loading...</p> : orders.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border text-center text-gray-500">No orders yet.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-gray-800">Order #{order.id.slice(0,6)}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status==="Delivered"?"bg-green-100 text-green-700":"bg-blue-50 text-blue-700"}`}>
                         {order.status}
                    </span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{item.quantity}x {item.title}</span>
                        <span>৳{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t flex justify-between font-bold">
                    <span>Total</span>
                    <span>৳{order.totalAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;