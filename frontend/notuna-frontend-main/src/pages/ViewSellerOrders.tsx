import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

type Order = {
  orderId: string;
  orderDate: string;
  productName: string;
  price: number;
  quantity: number;
  status: string;
  buyerName: string;
};

const ViewSellerOrders: React.FC = () => {
  // const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders on component mount using useEffect
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const sellerId = localStorage.getItem("s_id");
    
        if (!sellerId) {
          console.error("sellerId not found in localStorage");
          return;
        }
        const apiKey = "NoTuna";
        const response = await fetch(
          `https://seng2021-notuna-order.vercel.app/shop/seller/orders?s_id=${sellerId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: apiKey,
            },
          }
        );
        const data = await response.json();
        console.log({ data });
        setOrders(data.orders.map((order: any) => ({
            orderId: order.order_id,
            orderDate: order.order_date,
            productName: order.product_name,
            price: order.price,
            quantity: order.quantity,
            status: order.status,
            buyerName: order.buyer_name,
        })));
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle accepting an order
  const handleAccept = async (orderId: string) => {
    try {
      const apiKey = "NoTuna";
      const response = await fetch(
        `https://seng2021-notuna-order.vercel.app/shop/seller/${orderId}/order-accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
        }
      );
      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, status: "ORDER_ACCEPTED" }
              : order
          )
        );
      } else {
        console.error("Failed to accept order");
      }
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  // Handle rejecting an order
  const handleReject = async (orderId: string) => {
    try {
      const apiKey = "NoTuna";
      const response = await fetch(
        `https://seng2021-notuna-order.vercel.app/shop/seller/${orderId}/order-reject`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
        }
      );
      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, status: "ORDER_REJECTED" }
              : order
          )
        );
      } else {
        console.error("Failed to reject order");
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  // Handle registering an order
  const handleRegister = async (orderId: string) => {
    try {
        const apiKey = "NoTuna";
        const response = await fetch(
          `https://seng2021-notuna-order.vercel.app/shop/seller/${orderId}/order-register`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: apiKey,
            },
          }
        );
        if (response.ok) {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.orderId === orderId
                ? { ...order, status: "ORDER_REGISTERED" }
                : order
            )
          );
        } else {
          console.error("Failed to register order");
        }
      } catch (error) {
        console.error("Error registering order:", error);
      }
  };

  // Handle adding details to an order
  const handleAddDetail = async (orderId: string) => {
    try {
      const apiKey = "NoTuna";
      const response = await fetch(
        `https://seng2021-notuna-order.vercel.app/shop/seller/${orderId}/order-add-detail`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
        }
      );
      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, status: "PENDING_BUYER_REVIEW" }
              : order
          )
        );
      } else {
        console.error("Failed to add detail to order");
      }
    } catch (error) {
      console.error("Error adding detail to order:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
  <h4 className="mb-4 fw-bold text-dark text-center">Seller Orders</h4>

  {orders.length === 0 ? (
    <p className="text-center text-muted">No orders found.</p>
  ) : (
    <div className="bg-light p-4 rounded shadow-sm">

      {["PENDING_SELLER_REVIEW", "SELLER_ORDER_ACCEPTED", "PENDING_BUYER_REVIEW", "ORDER_REGISTERED", "ORDER_FULFILLED"].map((status) => {
        const filteredOrders = orders.filter(order =>
          status === "OTHER"
            ? order.status !== "PENDING_SELLER_REVIEW" && order.status !== "SELLER_ORDER_ACCEPTED" && order.status !== "PENDING_BUYER_REVIEW" && order.status !== "ORDER_REGISTERED" && order.status !== "ORDER_FULFILLED"
            : order.status === status
        );

        if (filteredOrders.length === 0) return null;

        return (
          <div key={status} className="mb-5">
            <h5 className="fw-bold text-primary mb-3">
              {status === "PENDING_SELLER_REVIEW" && "Pending Seller Review"}
              {status === "SELLER_ORDER_ACCEPTED" && "Accepted Orders"}
              {status === "PENDING_BUYER_REVIEW" && "Pending Buyer Review"}
              {status === "ORDER_REGISTERED" && "Order Registered"}
              {status === "ORDER_FULFILLED" && "Order Fulfilled"}
              {status === "OTHER" && "Other Orders"}
            </h5>

            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="d-flex justify-content-between align-items-center bg-white rounded shadow-sm p-3 mb-3"
              >
                {/* Left Details */}
                <div className="flex-grow-1">
                  <p className="mb-1"><strong>Order ID:</strong> {order.orderId}</p>
                  <p className="mb-1"><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                  <p className="mb-1"><strong>Product:</strong> {order.productName}</p>
                  <p className="mb-1"><strong>Quantity:</strong> {order.quantity}</p>
                  <p className="mb-1"><strong>Price:</strong> ${order.price}</p>
                  <p className="mb-1"><strong>Status:</strong> {order.status}</p>
                  <p className="mb-0"><strong>Buyer:</strong> {order.buyerName}</p>
                </div>

                {/* Right-Side Actions */}
                <div className="text-end">
                  {order.status === "PENDING_SELLER_REVIEW" && (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleAccept(order.orderId)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => handleReject(order.orderId)}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleAddDetail(order.orderId)}
                      >
                        Add Detail
                      </button>
                    </>
                  )}
                  {order.status === "SELLER_ORDER_ACCEPTED" && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRegister(order.orderId)}
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  )}
</div>

  );
};

export default ViewSellerOrders;
