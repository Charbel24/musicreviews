import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [newAlbum, setNewAlbum] = useState({
    title: "",
    artist: "",
    year: "",
    genre: "",
    imageUrl:""
  });
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null)
  const [ownershipRequests, setOwnershipRequests] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchUsers();
      fetchAlbums();
      fetchReviews();
      fetchReports();
      fetchOwnershipRequests();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get("/api/reviews", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await axios.delete(`/api/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await axios.get("/api/albums");
      setAlbums(response.data.albums);
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  const handleAddAlbum = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/albums", newAlbum, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNewAlbum({ title: "", artist: "", year: "", genre: "", imageUrl:'' });
      fetchAlbums();
    } catch (error) {
      console.error("Error adding album:", error);
    }
  };

  const handleEditAlbum = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/albums/${editingAlbum.id}`, editingAlbum, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEditingAlbum(null);
      fetchAlbums();
    } catch (error) {
      console.error("Error editing album:", error);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (window.confirm("Are you sure you want to delete this album?")) {
      try {
        await axios.delete(`/api/albums/${albumId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchAlbums();
      } catch (error) {
        console.error("Error deleting album:", error);
      }
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get("/api/reports", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReports(response.data);
    } catch (error) {
      setError("Failed to fetch reports");
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      await axios.put(
        `/api/reports/${reportId}`,
        {
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchReports();
    } catch (error) {
      setError("Failed to update report status");
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      await axios.put(`/api/admin/ownership-requests/${requestId}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchOwnershipRequests();
    } catch (error) {
      setError('Failed to update request status');
    }
  };
  const fetchOwnershipRequests = async () => {
    try {
      const response = await axios.get("/api/admin/ownership-requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOwnershipRequests(response.data);
    } catch (error) {
      setError("Failed to fetch ownership requests");
    }
  };

  const handleAssignOwnership = async (userId, albumId) => {
    try {
      await axios.put(
        "/api/admin/assign-ownership",
        { userId, albumId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchAlbums();
      setSuccess("Ownership assigned successfully!")
    } catch (error) {
      setError("Failed to assign ownership");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = async () => {
    try {
      const response = await axios.put(`/api/admin/users/${editingUser.id}`, editingUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(users.map(user => user.id === editingUser.id ? response.data : user));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (!user || !user.isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="admin-dashboard">
      {error && <div className="error">{error}</div>}
      <h1>Admin Dashboard</h1>
      <div className="tab-buttons">
        <button
          onClick={() => setActiveTab("users")}
          className={activeTab === "users" ? "active" : ""}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("albums")}
          className={activeTab === "albums" ? "active" : ""}
        >
          Albums
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={activeTab === "reviews" ? "active" : ""}
        >
          Reviews
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={activeTab === "reports" ? "active" : ""}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab("ownership")}
          className={activeTab === "ownership" ? "active" : ""}
        >
          Ownership Request
        </button>
        <button
          onClick={() => setActiveTab("assign")}
          className={activeTab === "assign" ? "active" : ""}
        >
          Assign Ownership
        </button>
      </div>

      {/* ... (keep the existing users and reviews sections) */}
      {activeTab === "users" && (
        <div className="users-list">
          <h2>Users</h2>
          <ul>
            {users.map((user) => (
               <li key={user.id}>
               {editingUser && editingUser.id === user.id ? (
                 <>
                   <input 
                     type="text" 
                     value={editingUser.name} 
                     onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                   />
                   <input 
                     type="email" 
                     value={editingUser.email} 
                     onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                   />
                   <select 
                     value={editingUser.role} 
                     onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                   >
                     <option value="USER">User</option>
                     <option value="ADMIN">Admin</option>
                   </select>
                   <button className="edit-btn" onClick={handleSaveUser}>Save</button>
                   <button className="cancel-btn" onClick={() => setEditingUser(null)}>Cancel</button>
                 </>
               ) : (
                 <>
                   {user.name} ({user.email}) - Role: {user.isAdmin? "Admin": "user"}
                   <button className="edit-btn" onClick={() => handleEditUser(user)}>Edit</button>
                   <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                 </>
               )}
             </li>
           ))}
         </ul>
        </div>
      )}
      {activeTab === "albums" && (
        <div className="albums-section">
          <h2>Albums</h2>
          <form onSubmit={handleAddAlbum} className="add-album-form">
            <input
              type="text"
              placeholder="Title"
              value={newAlbum.title}
              onChange={(e) =>
                setNewAlbum({ ...newAlbum, title: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Artist"
              value={newAlbum.artist}
              onChange={(e) =>
                setNewAlbum({ ...newAlbum, artist: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Year"
              value={newAlbum.year}
              onChange={(e) =>
                setNewAlbum({ ...newAlbum, year: parseInt(e.target.value) })
              }
              required
            />
            <input
              type="text"
              placeholder="Genre"
              value={newAlbum.genre}
              onChange={(e) =>
                setNewAlbum({ ...newAlbum, genre: e.target.value })
              }
            />
            <input
              type="url"
              placeholder="Image Url"
              value={newAlbum.imageUrl}
              onChange={(e) =>
                setNewAlbum({ ...newAlbum, imageUrl: e.target.value })
              }
            />
            <button type="submit">Add Album</button>
          </form>
          <ul className="albums-list">
            {albums.map((album) => (
              <li key={album.id}>
                {editingAlbum && editingAlbum.id === album.id ? (
                  <form onSubmit={handleEditAlbum} className="edit-album-form">
                    <input
                      type="text"
                      value={editingAlbum.title}
                      onChange={(e) =>
                        setEditingAlbum({
                          ...editingAlbum,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      value={editingAlbum.artist}
                      onChange={(e) =>
                        setEditingAlbum({
                          ...editingAlbum,
                          artist: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="number"
                      value={editingAlbum.year}
                      onChange={(e) =>
                        setEditingAlbum({
                          ...editingAlbum,
                          year: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      value={editingAlbum.genre}
                      onChange={(e) =>
                        setEditingAlbum({
                          ...editingAlbum,
                          genre: e.target.value,
                        })
                      }
                    />
                     <input
                      type="url"
                      value={editingAlbum.imageUrl}
                      onChange={(e) =>
                        setEditingAlbum({
                          ...editingAlbum,
                          imageUrl: e.target.value,
                        })
                      }
                    />
                    <button type="submit">Save</button>
                    <button className="cancel-btn" type="button" onClick={() => setEditingAlbum(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    {album.title} by {album.artist} ({album.year}) -{" "}
                    {album.genre}
                    <button onClick={() => setEditingAlbum(album)}>Edit</button>
                    <button onClick={() => handleDeleteAlbum(album.id)}>
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {activeTab === "reviews" && (
        <div className="reviews-list">
          <h2>Reviews</h2>
          <ul>
            {reviews.map((review) => (
              <li key={review.id}>
                Review for {review.album.title} by {review.user.name}
                <button onClick={() => handleDeleteReview(review.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {activeTab === "reports" && (
        <div className="reports-list">
          <h1>Reports</h1>
          {error && <p className="error">{error}</p>}
          <ul>
            {reports?.map((report) => (
              <li key={report.id}>
                <p>Type: {report.type}</p>
                <p>Content: {report.content}</p>
                <p>Status: {report.status}</p>
                <p>Reported by: {report.user.name}</p>
                {report.type === "ALBUM" && <p>Album: {report.album.title}</p>}
                {report.type === "REVIEW" && (
                  <p>Review: {report.review.content.substring(0, 50)}...</p>
                )}
                <button
                  className="edit-btn"
                  onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                >
                  Mark as Resolved
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => handleUpdateStatus(report.id, "DISMISSED")}
                >
                  Dismiss
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {activeTab === "ownership" && (
        <div className="ownership-list">
          <h2>Ownership Requests</h2>
          {success && <div className="success">{success}</div>}
          <ul>
            {ownershipRequests.map((request) => (
              <li key={request.id}>
                <p>
                  User: {request.user.name} ({request.user.email})
                </p>
                <p>
                  Album: {request.album.title} by {request.album.artist}
                </p>
                <p>Status: {request.status}</p>
                {request.status === "PENDING" && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateRequestStatus(request.id, "APPROVED")
                      }
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateRequestStatus(request.id, "REJECTED")
                      }
                    >
                      Reject
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {activeTab === "assign" && (
        <div className="reports-list">
          <h2>Assign Ownership</h2>
          {success && <div className="success">{success}</div>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const userId = e.target.userId.value;
              const albumId = e.target.albumId.value;
              handleAssignOwnership(userId, albumId);
            }}
          >
            <select name="userId" required>
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <select name="albumId" required>
              <option value="">Select Album</option>
              {albums
                .filter((album) => !album.ownerId)
                .map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title} by {album.artist}
                  </option>
                ))}
            </select>
            <button type="submit">Assign Ownership</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
