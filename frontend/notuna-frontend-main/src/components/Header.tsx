import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Sets true if token exists, false otherwise
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Remove the token from localStorage
    setIsAuthenticated(false); // Update the state to reflect the user is logged out
    navigate("/login"); // Redirect to the login page after logout
  };

  return (
    <header
      className="text-white py-3 fixed-top shadow"
      style={{ backgroundColor: "#2d2673", borderBottom: "2px solid white" }}
    >
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo */}
        <div className="logo">
          <h1 className="m-0">
            <Link to="/" className="">
              <img
                src={logo}
                alt="NoTuna Trade Platform Logo"
                style={{ height: "50px", width: "auto" }} // Adjust the size as needed
              />
            </Link>
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="d-lg-none btn text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <i className="bi bi-list" /> {/* Bootstrap icons for hamburger menu */}
        </button>

        {/* Navigation Links */}
        <nav className={`navbar navbar-expand-lg d-none d-lg-flex ${isMobileMenuOpen ? 'show' : ''}`}>
          <ul className="nav mt-1 d-flex align-items-center">
            <li className="nav-item">
              <Link to="/" className="nav-link text-white fw-bold">
                Home
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link to="/messages" className="nav-link text-white fw-bold">
                  Messages
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link
                to="/buyer-dashboard"
                className="nav-link text-white fw-bold"
              >
                Buyer Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/seller-dashboard"
                className="nav-link text-white fw-bold"
              >
                Seller Dashboard
              </Link>
            </li>
            {isAuthenticated ? (
              <li className="nav-item">
                <button
                  className="btn text-purple fw-bold"
                  style={{
                    backgroundColor: "#FFD700",
                    border: "none",
                    marginLeft: "10px", // Add some spacing
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    to="/signup"
                    className="btn text-purple fw-bold me-2"
                    style={{
                      backgroundColor: "#FFD700",
                      border: "none",
                      marginLeft: "10px", // Add spacing
                    }}
                  >
                    Sign Up
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/login"
                    className="btn text-purple fw-bold"
                    style={{
                      backgroundColor: "#FFD700",
                      border: "none",
                      marginLeft: "10px", // Add spacing
                    }}
                  >
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`d-lg-none ${isMobileMenuOpen ? 'd-block' : 'd-none'}`}>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/" className="nav-link text-white fw-bold">
              Home
            </Link>
          </li>
          {isAuthenticated && (
            <li className="nav-item">
              <Link to="/messages" className="nav-link text-white fw-bold">
                Messages
              </Link>
            </li>
          )}
          <li className="nav-item">
            <Link to="/buyer-dashboard" className="nav-link text-white fw-bold">
              Buyer Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/seller-dashboard" className="nav-link text-white fw-bold">
              Seller Dashboard
            </Link>
          </li>
          {isAuthenticated ? (
            <li className="nav-item">
              <button
                className="btn text-purple fw-bold w-100"
                style={{
                  backgroundColor: "#FFD700",
                  border: "none",
                }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <Link
                  to="/signup"
                  className="btn text-purple fw-bold w-100"
                  style={{
                    backgroundColor: "#FFD700",
                    border: "none",
                  }}
                >
                  Sign Up
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/login"
                  className="btn text-purple fw-bold w-100"
                  style={{
                    backgroundColor: "#FFD700",
                    border: "none",
                  }}
                >
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
