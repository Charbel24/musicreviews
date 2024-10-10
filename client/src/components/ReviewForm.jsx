import { useState } from "react";
import axios from "axios";

const ReviewForm = ({ albumId, onReviewSubmitted }) => {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/reviews",
        { content, rating, albumId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setContent("");
      setRating(5);
      onReviewSubmitted();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add_review_form">
      {error && <p style={{ color: "red" }}>{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your review here"
        required
      />
      <select value={rating} onChange={(e) => setRating(e.target.value)}>
        {[1, 2, 3, 4, 5].map((num) => (
          <option key={num} value={num}>
            {num} Star{num !== 1 ? "s" : ""}
          </option>
        ))}
      </select>
      <button type="submit">Submit Review</button>
    </form>
  );
};

export default ReviewForm;
