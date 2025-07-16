import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

type Order = {
  orderId: string;
  orderDate: string;
  productDesc: string;
  price: number;
  quantity: number;
  sellerName: string;
  status: string;
  buyerCompanyName?: string;
  sellerCompanyName?: string;
  productId?: string;
  paymentDetails?: string;
  deliveryAddress?: string;
  contractData?: string;
};

const ViewBuyerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [formData, setFormData] = useState({
    buyerCompanyName: "",
    sellerCompanyName: "",
    productId: "",
    paymentDetails: "",
    deliveryAddress: "",
    contractData: "",
    quantity: 0,
    price: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const buyerId = localStorage.getItem("b_id");

        if (!buyerId) {
          console.error("buyerId not found in localStorage");
          return;
        }

        const res = await fetch(
          `https://seng2021-notuna-order.vercel.app/shop/buyer/orders?b_id=${buyerId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        const normalized = (data.orders || []).map((order: any) => ({
          orderId: order.order_id,
          orderDate: order.order_date,
          productDesc: order.product_description,
          price: order.price,
          quantity: order.quantity,
          status: order.status,
          sellerName: order.seller_name,
          buyerCompanyName: order.buyer_company_name,
          sellerCompanyName: order.seller_company_name,
          productId: order.product_id,
          paymentDetails: order.payment_details,
          deliveryAddress: order.delivery_address,
          contractData: order.contract_data,
        }));
        setOrders(normalized);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleAccept = async (orderId: string) => {
    try {
      const apiKey = "NoTuna";
      const response = await fetch(
        `https://seng2021-notuna-order.vercel.app/shop/buyer/${orderId}/order-accept`,
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

  const handleCancel = async (orderId: string) => {
    try {
      const apiKey = "NoTuna";
      const response = await fetch(
        `https://seng2021-notuna-order.vercel.app/shop/buyer/${orderId}/order-cancel`,
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
              ? { ...order, status: "ORDER_CANCELLED" }
              : order
          )
        );
      } else {
        console.error("Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const handleChange = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      buyerCompanyName: order.buyerCompanyName || "",
      sellerCompanyName: order.sellerCompanyName || "",
      productId: order.productId || "",
      paymentDetails: order.paymentDetails || "",
      deliveryAddress: order.deliveryAddress || "",
      contractData: order.contractData || "",
      quantity: order.quantity,
      price: order.price,
    });
    setShowModal(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;
    try {
      const apiKey = "NoTuna";
      const res = await fetch(
        `https://seng2021-notuna-order.vercel.app/shop/buyer/${selectedOrder.orderId}/order-change`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === selectedOrder.orderId
              ? { ...order, ...formData }
              : order
          )
        );
        setShowModal(false);
      } else {
        console.error("Failed to change order");
      }
    } catch (err) {
      console.error("Error changing order:", err);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div>Loading orders...</div>
      </div>
    );

  return (
    <div className="container mt-4">
      <h4 className="mb-4 fw-bold text-dark text-center">Buyer Orders</h4>

      {orders.length === 0 ? (
        <p className="text-center text-muted">No orders found.</p>
      ) : (
        <div className="bg-light p-4 rounded shadow-sm">
          {["PENDING_BUYER_REVIEW", "PENDING_SELLER_REVIEW", "SELLER_ORDER_ACCEPTED", "ORDER_REGISTERED", "ORDER_FULFILLED"].map((status) => {
            const filteredOrders = orders.filter((order) => order.status === status);
            if (filteredOrders.length === 0) return null;

            return (
              <div key={status} className="mb-5">
                <h5 className="fw-bold text-primary mb-3">
                  {status.replaceAll("_", " ")}
                </h5>

                {filteredOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="d-flex justify-content-between align-items-center bg-white rounded shadow-sm p-3 mb-3"
                  >
                    <div className="flex-grow-1">
                      <p className="mb-1"><strong>Order ID:</strong> {order.orderId}</p>
                      <p className="mb-1"><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                      <p className="mb-1"><strong>Product:</strong> {order.productDesc}</p>
                      <p className="mb-1"><strong>Quantity:</strong> {order.quantity}</p>
                      <p className="mb-1"><strong>Price:</strong> ${order.price}</p>
                      <p className="mb-1"><strong>Status:</strong> {order.status}</p>
                      <p className="mb-0"><strong>Seller:</strong> {order.sellerName}</p>
                    </div>

                    <div className="text-end">
                      {order.status === "PENDING_BUYER_REVIEW" && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleAccept(order.orderId)}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-danger btn-sm me-2"
                            onClick={() => handleCancel(order.orderId)}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleChange(order)}
                          >
                            Change
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {Object.entries(formData).map(([key, value]) => (
              <Form.Group key={key} className="mb-3">
                <Form.Label>{key}</Form.Label>
                <Form.Control
                  type={typeof value === "number" ? "number" : "text"}
                  value={value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: typeof value === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                    }))
                  }
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewBuyerOrders;
