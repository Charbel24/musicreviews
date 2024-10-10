import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CommentForm from './CommentForm';


const CommentList = ({ reviewId, album }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/review/${reviewId}`);
      setComments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching comments');
      setLoading(false);
    }
  };

  const handleAddComment = async (content, isOwnerResponse = false) => {
    try {
      const response = await axios.post(
        "/api/comments",
        {
          reviewId: reviewId,
          albumId:album.id,
          content,
          isOwnerResponse,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setComments([response.data, ...comments]);
    } catch (error) {
      setError("Error adding comment");
    }
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="comment-list">
      <h4>Comments</h4>
      {user && <CommentForm onCommentAdded={handleAddComment} />}
      {user && user.id === album.ownerId && (
        <CommentForm onCommentAdded={(content) => handleAddComment(content, true)} label="Respond as Owner" />
      )}
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <p>{comment.content}</p>
          <p className="comment-author">By: {comment.user.name}</p>
          <p className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentList;