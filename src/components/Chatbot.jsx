// src/components/Chatbot.jsx
import { useState, useEffect } from "react"; // Added useEffect
import { MessageCircle, X, Send } from "lucide-react";
import { askRealAI } from "../lib/gemini"; // Import the REAL function
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I can check stock & prices. Ask me anything!", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Store inventory string here
  const [inventoryText, setInventoryText] = useState("");

  // 1. Fetch Inventory on Load (So the AI knows what we have)
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        // Create a readable string list: "iPhone 15 - $1200 (Category: electronics)"
        const text = querySnapshot.docs.map(doc => {
          const d = doc.data();
          return `- ${d.title}: ৳${d.price} (${d.category})`; 
        }).join("\n");
        
        setInventoryText(text);
      } catch (error) {
        console.error("Failed to load inventory for AI");
      }
    };
    fetchInventory();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add User Message
    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // 2. Call REAL AI with Inventory Context
    try {
      const responseText = await askRealAI(userMsg.text, inventoryText);
      const botMsg = { text: responseText, sender: "bot" };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: "My brain is offline. Sorry!", sender: "bot" }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end chatbot-container">
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border mb-4 flex flex-col overflow-hidden animate-fade-in-up chatbot-window">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center font-bold">
            <span>Nexus AI Agent</span>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white self-end ml-auto rounded-br-none" 
                    : "bg-white border text-gray-800 self-start rounded-bl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="text-xs text-gray-400 italic ml-2">Reading database...</div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t bg-white flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Do you have iPhones?" 
              className="flex-grow p-2 border rounded-full text-sm outline-none focus:border-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default Chatbot;