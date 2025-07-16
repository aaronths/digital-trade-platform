import React from "react";
import { Navigate } from "react-router-dom";

interface RequireSellerIdProps {
  children: React.ReactNode;
}

const RequireSellerId = ({ children }: RequireSellerIdProps) => {
  const token = localStorage.getItem("token");
  const sellerId = localStorage.getItem("s_id");

  if (!token) {
    return <Navigate to="/login" />;
  }
  if (isNaN(Number(sellerId))) {
    return <Navigate to="/seller-details" />;
  }
  return children;
};

export default RequireSellerId;
