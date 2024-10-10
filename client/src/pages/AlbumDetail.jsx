import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReviewForm from "../components/ReviewForm";
import { useAuth } from "../contexts/AuthContext";
import CommentList from "../components/CommentList";
import ReportForm from "../components/ReportForm";

const AlbumDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAlbum, setEditedAlbum] = useState(null);

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  const fetchAlbum = async () => {
    try {
      const response = await axios.get(`/api/albums/${id}`);
      setAlbum(response.data.albums);
      setLoading(false);
    } catch (err) {
      setError("Error fetching album details");
      setLoading(false);
    }
  };

  const handleReportSubmitted = () => {
    setShowReportForm(false);
    // Optionally, show a success message
  };

  // const handleClaimOwnership = async () => {
  //   try {
  //     const response = await axios.post(
  //       `/api/albums/${id}/claim`,
  //       {},
  //       {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }
  //     );
  //     setAlbum(response.data);
  //   } catch (error) {
  //     setError("Error claiming ownership");
  //   }
  // };

  const handleRequestOwnership = async () => {
    try {
      await axios.post(
        `/api/albums/${id}/request-ownership`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Ownership request submitted successfully");
    } catch (error) {
      setError("Error requesting ownership");
    }
  };

  const handleEditAlbum = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/albums/${id}`, editedAlbum, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAlbum(response.data);
      setIsEditing(false);
    } catch (error) {
      setError("Error updating album");
    }
  };

  if (loading) return <div>Loading...</div>;
  // if (error) return <div>{error}</div>;
  if (!album) return <div>Album not found</div>;

  return (
    <div className="album-detail">
      {error && <div className="error">{error}</div>}
      {isEditing ? (
        <form onSubmit={handleEditAlbum}>
          <input
            type="text"
            value={editedAlbum.title}
            onChange={(e) =>
              setEditedAlbum({ ...editedAlbum, title: e.target.value })
            }
          />
          <input
            type="text"
            value={editedAlbum.artist}
            onChange={(e) =>
              setEditedAlbum({ ...editedAlbum, artist: e.target.value })
            }
          />
          <input
            type="number"
            value={editedAlbum.year}
            onChange={(e) =>
              setEditedAlbum({ ...editedAlbum, year: parseInt(e.target.value) })
            }
          />
          <input
            type="text"
            value={editedAlbum.genre}
            onChange={(e) =>
              setEditedAlbum({ ...editedAlbum, genre: e.target.value })
            }
          />
          <input
            type="url"
            value={editedAlbum.imageUrl}
            onChange={(e) =>
              setEditedAlbum({ ...editedAlbum, imageUrl: e.target.value })
            }
          />
          <button className="edit-btn" type="submit">Save Changes</button>
          <button className="cancel-btn" type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <img src={album.imageUrl} alt={album.title} />
          <h1>{album.title}</h1>
          <p>Artist: {album.artist}</p>
          <p>Year: {album.year}</p>
          <p>Genre: {album.genre}</p>
          <p>
            Average Rating:{" "}
            {album.averageRating
              ? `${album.averageRating} / 5`
              : "No ratings yet"}
          </p>
          {user && user.id === album.ownerId && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditedAlbum(album);
              }}
            >
              Edit Album
            </button>
          )}
          {user && !album.ownerId && (
            <button onClick={handleRequestOwnership}>Request Ownership</button>
          )}
        </>
      )}

      <h2>Reviews ({album.reviews?.length})</h2>
      {user && <ReviewForm albumId={id} onReviewSubmitted={fetchAlbum} />}
      {success && <div className="success">{success}</div>}
      <button onClick={() => setShowReportForm(!showReportForm)}>
        {showReportForm ? "Cancel Report" : "Report Album"}
      </button>
      {showReportForm && (
        <ReportForm
          type="ALBUM"
          itemId={album.id}
          onReportSubmitted={handleReportSubmitted}
        />
      )}

      {album.reviews?.map((review) => (
        <div key={review.id} className="review">
          <p>{review.content}</p>
          <p>Rating: {review.rating} / 5</p>
          <p>By: {review.user.name}</p>

          <button
            onClick={() => setShowReportForm({ type: "REVIEW", id: review.id })}
          >
            Report Review
          </button>
          {showReportForm &&
            showReportForm.type === "REVIEW" &&
            showReportForm.id === review.id && (
              <ReportForm
                type="REVIEW"
                itemId={review.id}
                onReportSubmitted={() => setShowReportForm(null)}
              />
            )}

          {/* <h3>Comments</h3>
          {user && <CommentForm reviewId={review.id} onCommentAdded={(content) => handleAddComment(review.id, content)} />}
          {review.comments && review.comments?.map((comment) => (
            <div key={comment.id} className="comment">
              <p>{comment.content}</p>
              <p>By: {comment.user.name}</p>
            </div>
          ))} */}
          <CommentList reviewId={review.id} album={album} />
        </div>
      ))}
    </div>
  );
};

export default AlbumDetail;
