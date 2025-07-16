import React from "react";

const HighlightText: React.FC = () => {
  return (
    <div
      className="text-center text-white d-flex flex-column justify-content-center align-items-center"
      style={{
        height: "100vh", // Full screen height
        backgroundColor: "#2d2673", // Purple background
        padding: "40px 70px",
      }}
    >
      <h2
        className="fw-bold"
        style={{
          fontFamily: "DM Sans",
          fontSize: "3rem", // Adjusted size to be more prominent
          marginBottom: "20px",
        }}
      >
        Empower Your Trade with Seamless Digital Solutions
      </h2>
      <p
        style={{
          fontSize: "1.25rem",
          lineHeight: "1.8",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        Welcome to your all-in-one platform for efficient and organized trade
        management. Create and track orders, generate invoices, manage
        despatches, and oversee your product inventory—all in one place. Whether
        you're a seller streamlining operations or a buyer simplifying
        purchases, our intuitive tools make trade effortless and secure.
        Transform the way you trade today!
      </p>
    </div>
  );
};

export default HighlightText;
