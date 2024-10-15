import { useState, useEffect } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const UserProfile = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [edit, setEdit] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUserInfo(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch user profile");
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setUpdateMessage("");
    try {
      const response = await axios.put(
        "/api/users/profile",
        { name, email },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // setUserInfo(response.data);
      setUpdateMessage("Profile updated successfully!");
      setEdit(false)
    } catch (err) {      
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handleEditReview = (review) => {
    setEditingReview({ ...review });
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/reviews/${editingReview.id}`, {
        content: editingReview.content,
        rating: editingReview.rating
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEditingReview(null);
      fetchUserProfile();
    } catch (err) {
      console.log(err);
      
      setError('Error updating review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
      try {
        await axios.delete(`/api/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchUserProfile();
      } catch (err) {
        setError('Error deleting review');
      }
  };

  const handleEditComment = (comment) => {
    setEditingComment({ ...comment });
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/comments/${editingComment.id}`, {
        content: editingComment.content
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEditingComment(null);
      fetchUserProfile();
    } catch (err) {
      setError('Error updating comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
      try {
        await axios.delete(`/api/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchUserProfile();
      } catch (err) {
        setError('Error deleting comment');
      }
  };

  if (!user) return <Navigate to="/login" />;
  if (loading) return <div>Loading...</div>;
  // if (error) return <div style={{ color: "red", textAlign: 'center', margin: '1rem' }}>{error}</div>;

  return (
    <div className="user-profile">
      {error && <div style={{ color: "red", textAlign: 'center', margin: '1rem' }}>{error}</div>}
      <h1>User Profile</h1>
      {updateMessage && <div style={{ color: "green" }}>{updateMessage}</div>}

      {!edit ? (
        <div className="user-info">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button onClick={()=>setEdit(true)}>Edit</button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <button type="submit">Update Profile</button>
          <button onClick={()=>setEdit(false)} className="cancel-btn">Cancel</button>
        </form>
      )}

      <h2>My Reviews</h2>
      {userInfo?.reviews?.length === 0 ? (
        <p>You haven't written any reviews yet.</p>
      ) : (
        <div className="user-reviews">
          {userInfo?.reviews.map((review) => (
            <div key={review.id} className="review-card">
               {/* <h3>
                 <Link to={`/albums/${review.album.id}`}>
                   {review.album.title}
                 </Link>
               </h3>
               <p>
                 <strong>Artist:</strong> {review.album.artist}
               </p>
               <p>
                 <strong>Rating:</strong> {review.rating}/5
               </p>
               <p>{review.content}</p>
               <p className="review-date">
                 Reviewed on {new Date(review.createdAt).toLocaleDateString()}
               </p> */}
               {editingReview && editingReview.id === review.id ? (
               <form className="review_edit_form" onSubmit={handleUpdateReview}>
                  <textarea
                    value={editingReview.content}
                    onChange={(e) => setEditingReview({ ...editingReview, content: e.target.value })}
                    required
                  />
                  <select
                    value={editingReview.rating}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: parseInt(e.target.value) })}
                    required
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <button type="submit">Save</button>
                  <button type="button" className="cancel-btn" onClick={() => setEditingReview(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <h3>
                    <Link to={`/albums/${review.album.id}`}>{review.album.title}</Link>
                  </h3>
                  <p><strong>Artist:</strong> {review.album.artist}</p>
                  <p><strong>Rating:</strong> {review.rating}/5</p>
                  <p>{review.content}</p>
                  <p className="review-date">
                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <button className="edit-btn" onClick={() => handleEditReview(review)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteReview(review.id)}>Delete</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

<h2>My Comments</h2>
      {userInfo?.comments?.length === 0 ? (
        <p>You haven't written any comments yet.</p>
      ) : (
        <div className="user-comments">
          {userInfo?.comments?.map((comment) => (
            <div key={comment.id} className="comment-card">
              {editingComment && editingComment.id === comment.id ? (
                <form onSubmit={handleUpdateComment}>
                  <textarea
                    value={editingComment.content}
                    onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                    required
                  />
                  <button type="submit">Save</button>
                  <button  className="cancel-btn" type="button" onClick={() => setEditingComment(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <p>{comment.content}</p>
                  <p>On review for: <Link to={`/albums/${comment?.review?.album.id}`}>{comment?.review?.album.title}</Link></p>
                  <p className="comment-date">
                    Commented on {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                  <button className="edit-btn" onClick={() => handleEditComment(comment)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
