import React from "react";
import Pricing from "../components/Pricing";
import HighlightText from "../components/HighlightText"; // Import the new component

const Home: React.FC = () => {
  // Handle smooth scroll to a specific section
  const handleScrollToPricing = () => {
    const pricingSection = document.getElementById("pricing-section");
    pricingSection?.scrollIntoView({
      behavior: "smooth", // Smooth scroll
      block: "start", // Align the section to the top
    });
  };

  return (
    <div
      style={{
        scrollSnapType: "y mandatory", // Enable vertical scroll snapping
        overflowY: "scroll", // Enable vertical scrolling
        height: "100vh", // Ensure it takes the full height of the viewport
      }}
    >
      {/* Splash Section */}
      <div
        className="text-left vh-100 p-5 text-white"
        style={{
          scrollSnapAlign: "start", // Snap to the start of this section
        }}
      >
        <div
          style={{
            width: "70%",
            paddingLeft: "70px",
            paddingTop: "70px",
          }}
        >
          <h1
            className="fw-bold"
            style={{ fontFamily: "TM", fontSize: "4.5rem", lineHeight: "1.5" }}
          >
            Your one stop digital trade{" "}
            <span className="text-warning">solution</span>
          </h1>
        </div>
        <div style={{ paddingLeft: "70px" }}>
          <h3 className="fst-italic mt-4">No fishy business.</h3>
        </div>
        <div style={{ paddingLeft: "70px" }}>
          <h3 className="mt-3">
            Focus on the things that matter and we’ll focus on the things that
            make it happen.
          </h3>
          <button
            onClick={handleScrollToPricing} // Use the scroll handler here
            className="btn text-purple fw-bold my-5"
            style={{
              backgroundColor: "#FFD700",
              border: "none",
              fontFamily: "DM Sans",
              fontSize: "1.5rem",
              borderRadius: "30px",
            }}
          >
            <span className="p-4">See Pricing</span>
          </button>
        </div>
      </div>

      {/* Pricing Section */}
      <div
        id="pricing-section"
        style={{
          scrollSnapAlign: "start", // Snap to the start of this section
        }}
      >
        <Pricing />
      </div>

      {/* Highlight Text Section */}
      <div
        style={{
          scrollSnapAlign: "start", // Snap to the start of this section
        }}
      >
        <HighlightText />
      </div>
    </div>
  );
};

export default Home;
