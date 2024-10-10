import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MusicReview
        </Link>
        <button className="navbar-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <ul className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <li className="navbar-item">
            <Link
              to="/"
              className="navbar-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Albums
            </Link>
          </li>
          {user && user.isAdmin && (
            <li className="navbar-item">
              <Link
                to="/admin"
                className="navbar-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            </li>
          )}
          {user ? (
            <>
              <li className="navbar-item">
                <Link
                  to="/profile"
                  className="navbar-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              </li>
              <li className="navbar-item">
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="navbar-button"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link
                  to="/login"
                  className="navbar-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link
                  to="/register"
                  className="navbar-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
