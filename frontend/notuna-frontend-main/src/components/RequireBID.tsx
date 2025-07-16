import React from "react";
import { Navigate } from "react-router-dom"; // Correct spelling

interface RequireBuyerIdProps {
  children: React.ReactNode;
}

const RequireBuyerId = ({ children }: RequireBuyerIdProps) => {
  const token = localStorage.getItem("token");
  const buyerId = localStorage.getItem("b_id");

  if (!token) {
    return <Navigate to="/login" />;
  }
  if (isNaN(Number(buyerId))) {
    return <Navigate to="/buyer-details" />;
  }
  return children;
};

export default RequireBuyerId;
