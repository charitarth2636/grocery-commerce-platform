import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductStore, useCartStore } from '../store';
import { Plus, Minus, ShoppingCart, ArrowLeft, Star } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, fetchProduct, isLoading } = useProductStore();
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct(id);
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
      try {
          const res = await fetch(`http://localhost:8000/api/products/${id}/reviews`);
          const data = await res.json();
          if (data.success) setReviews(data.data);
      } catch (e) {
          console.error("Reviews load failed");
      }
  };

  const handleSubmitReview = async (e) => {
      e.preventDefault();
      if (!newReviewText.trim()) return;
      setIsSubmittingReview(true);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:8000/api/products/${id}/reviews`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ rating: newReviewRating, comment: newReviewText })
          });
          if (res.ok) {
              setNewReviewText("");
              fetchReviews();
              fetchProduct(id); // refresh for new avg rating
          } else {
              alert("Please login to leave a review");
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsSubmittingReview(false);
      }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(id, quantity);
    setIsAdding(false);
  };

  if (isLoading || !currentProduct) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const discountPercent = currentProduct.discountPercent || 
    Math.round(((currentProduct.mrp - currentProduct.sellingPrice) / currentProduct.mrp) * 100);

  return (
    <div className="animate-fade-in pb-10">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={currentProduct.thumbnail || currentProduct.images?.[0] || 'https://via.placeholder.com/400'}
              alt={currentProduct.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-gray-500 mb-1">{currentProduct.brand}</p>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{currentProduct.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-5 h-5 ${star <= (currentProduct.averageRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-500">
                  {currentProduct.averageRating ? currentProduct.averageRating.toFixed(1) : "0.0"} 
                  <span className="mx-1">•</span> 
                  {currentProduct.reviewCount || 0} reviews
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-800">₹{currentProduct.sellingPrice}</span>
              {currentProduct.mrp > currentProduct.sellingPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{currentProduct.mrp}</span>
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-6">
              {currentProduct.unitValue} {currentProduct.unit}
            </p>

            {/* Stock Status */}
            <div className="mb-6">
              {currentProduct.stockStatus === 'out_of_stock' ? (
                <span className="text-red-500 font-medium">Out of Stock</span>
              ) : currentProduct.stockStatus === 'low_stock' ? (
                <span className="text-orange-500 font-medium">Only {currentProduct.stockQuantity} left!</span>
              ) : (
                <span className="text-green-600 font-medium">In Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            {currentProduct.stockStatus !== 'out_of_stock' && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-600">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            {currentProduct.stockStatus !== 'out_of_stock' && (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-6 h-6" />
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
            )}

            {/* Description */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600">{currentProduct.description}</p>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 pt-10 border-t border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Customer Reviews</h2>
            
            <div className="grid md:grid-cols-3 gap-10">
                {/* Submit Form */}
                <div className="md:col-span-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 h-max">
                    <h3 className="font-bold text-slate-900 mb-4">Leave a Review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
                            <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(star => (
                                    <button 
                                        type="button" 
                                        key={star} 
                                        onClick={() => setNewReviewRating(star)}
                                        className="focus:outline-none hover:scale-110 transition-transform"
                                    >
                                        <Star className={`w-8 h-8 ${newReviewRating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Experience</label>
                            <textarea 
                                rows="3" 
                                value={newReviewText}
                                onChange={(e) => setNewReviewText(e.target.value)}
                                placeholder="What did you like or dislike?"
                                className="w-full rounded-xl border-slate-200 bg-white px-4 py-3 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmittingReview}
                            className="w-full btn-primary py-3 px-4 shadow-sm"
                        >
                            {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                        </button>
                    </form>
                </div>

                {/* Reviews List */}
                <div className="md:col-span-2 space-y-6">
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold text-slate-900">{review.userName || 'Verified Buyer'}</p>
                                    <p className="text-xs font-medium text-slate-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium text-sm leading-relaxed">{review.comment}</p>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
