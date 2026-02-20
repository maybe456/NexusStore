import { useState, useEffect } from "react";
import { Star, User, Send, LogIn } from "lucide-react";
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
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          >
            <Star
              className={`${size} ${
                star <= (interactive ? (hoverRating || rating) : value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
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
    <div className="mt-8 bg-white rounded-xl shadow border p-4 md:p-6 review-section">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-800">{averageRating}</div>
          <StarRating value={Math.round(averageRating)} />
          <p className="text-sm text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3">{star}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Form */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-bold mb-3">Write a Review</h3>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <StarRating value={rating} interactive={true} size="w-8 h-8" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
                minLength={10}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-3">Please log in to write a review</p>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 mx-auto bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              <LogIn className="w-4 h-4" />
              Log In to Review
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-bold">All Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews
            .sort((a, b) => {
              const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
              const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
              return dateB - dateA;
            })
            .map((review, index) => (
              <div key={index} className="p-4 border rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{review.userName}</span>
                      <StarRating value={review.rating} size="w-4 h-4" />
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-gray-600 mt-2">{review.text}</p>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
