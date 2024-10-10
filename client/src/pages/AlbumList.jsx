import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AlbumList = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/albums`, {
        params: { search },
      });
      setAlbums(response.data.albums);
      setLoading(false);
    } catch (err) {
      setError("Error fetching albums");
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    fetchAlbums();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="album-list">
      <h1>Albums</h1>
      <div className="search">
        <input
          type="text"
          placeholder="Search albums..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="album-grid">
        {albums.map((album) => (
          <Link
            to={`/albums/${album.id}`}
            key={album.id}
            className="album-card"
          >
            <img src={album.imageUrl} alt={album.title} />
            <h2>{album.title}</h2>
            <p>
              Average Rating:{" "}
              {album.averageRating
                ? `${album.averageRating} / 5`
                : "No ratings yet"}
            </p>
            <p>Reviews: {album.reviewCount}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AlbumList;
