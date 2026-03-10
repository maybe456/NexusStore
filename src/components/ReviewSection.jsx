import { useState, useEffect } from "react";
import { Star, User, Send, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ReviewSection = ({ productId, reviews, setReviews }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");

  // Fetch user's username from Firestore
  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || user.email.split("@")[0]);
          } else {
            setUsername(user.displayName || user.email.split("@")[0]);
          }
        } catch (error) {
          console.error("Error fetching username:", error);
          setUsername(user.email.split("@")[0]);
        }
      }
    };
    fetchUsername();
  }, [user]);

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Handle review submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/login");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (reviewText.trim().length < 10) {
      alert("Review must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        productId,
        userId: user.uid,
        userName: username,
        userEmail: user.email,
        rating,
        text: reviewText.trim(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "reviews"), reviewData);
      
      // Add to local state for immediate UI update
      setReviews([...reviews, { ...reviewData, createdAt: new Date() }]);
      
      // Reset form
      setRating(0);
      setReviewText("");
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Star rating component
  const StarRating = ({ value, interactive = false, size = "w-5 h-5" }) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={interactive ? "cursor-pointer transition-transform hover:scale-125" : "cursor-default"}
          >
            <Star
              className={`${size} transition-colors ${
                star <= (interactive ? (hoverRating || rating) : value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-200 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 bg-white dark:bg-dark-800 rounded-3xl shadow-soft border border-gray-100 dark:border-white/5 p-5 md:p-8 review-section"
    >
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 p-5 bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-dark-700 dark:to-amber-900/10 rounded-2xl border border-gray-100 dark:border-white/5">
        <div className="text-center sm:pr-6 sm:border-r border-gray-200 dark:border-white/10">
          <div className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{averageRating}</div>
          <div className="my-2">
            <StarRating value={Math.round(averageRating)} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-gray-600 dark:text-gray-400 font-medium">{star}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2.5 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: star * 0.1 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                  />
                </div>
                <span className="w-8 text-gray-500 text-xs font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Form */}
      <div className="mb-8 p-5 border border-gray-100 dark:border-white/5 rounded-2xl bg-gray-50/50 dark:bg-dark-700/50">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Write a Review</h3>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Your Rating</label>
              <StarRating value={rating} interactive={true} size="w-9 h-9" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                rows={4}
                required
                minLength={10}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 hover:-translate-y-0.5 transition-all disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:transform-none shadow-lg shadow-gray-900/20 dark:shadow-white/10">
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-600 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to write a review</p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 hover:-translate-y-0.5 transition-all shadow-lg shadow-gray-900/20 dark:shadow-white/10"
            >
              <LogIn className="w-4 h-4" />
              Log In to Review
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">All Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-dark-700 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
            <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {reviews
                .sort((a, b) => {
                  const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                  const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                  return dateB - dateA;
                })
                .map((review, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 border border-gray-100 dark:border-white/5 rounded-2xl bg-white dark:bg-dark-700 hover:shadow-soft transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">{review.userName}</span>
                          <StarRating value={review.rating} size="w-4 h-4" />
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-dark-600 px-2 py-0.5 rounded-full">{formatDate(review.createdAt)}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{review.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewSection;
