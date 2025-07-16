import React, { useState, useEffect } from "react";

interface Product {
  p2_id: string;
  p2_name: string;
  p2_price: string;
  p2_tax: string;
  p2_desc: string;
  seller_id: string;
}

const CreateOrder: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    productId: "",
    sellerId: "",
    quantity: "",
    contractData: "",
    paymentDetails: "",
    deliveryAddress: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const apiKey = "NoTuna";
      try {
        const response = await fetch("https://seng2021-notuna-order.vercel.app/shop/products/allProduct-v2", {
          method: "GET",
          headers: {
            Authorization: apiKey,
          },
        });

        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const createOrder = async () => {
    const apiKey = "NoTuna";
    const rawBuyerId = localStorage.getItem("b_id");
    const buyerId = Number(rawBuyerId);

    if (isNaN(buyerId)) {
      setMessage("Invalid or missing buyer ID in localStorage.");
      return;
    }

    try {
      const response = await fetch(
        "https://seng2021-notuna-order.vercel.app/v2/shop/buyer/order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
          body: JSON.stringify({
            ...form,
            quantity: Number(form.quantity),
            buyerId,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage(`Order created successfully with ID: ${data.orderId || "N/A"}`);
        setForm({
          productId: "",
          sellerId: "",
          quantity: "",
          contractData: "",
          paymentDetails: "",
          deliveryAddress: "",
        });
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      setMessage("Failed to create order");
    }
  };

  return (
    <div className="mt-5 mb-5 text-white">
      <h2 className="mb-4">Create a New Order (v2)</h2>

      <div className="container mt-5">
        <h3 className="text-white mb-4">Available Products</h3>
        <div className="row">
          {products.map((product) => (
            <div key={product.p2_id} className="col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.p2_name}</h5>
                  <p className="card-text">{product.p2_desc}</p>
                  <p className="card-text">
                    <strong>Price:</strong> ${product.p2_price}
                  </p>
                  <p className="card-text">
                    <strong>Tax:</strong> {product.p2_tax}
                  </p>
                  <p className="card-text">
                    <strong>Seller ID:</strong> {product.seller_id}
                  </p>
                  <button
                    className="btn btn-outline-primary mt-auto"
                    onClick={() =>
                      setForm((prevForm) => ({
                        ...prevForm,
                        productId: product.p2_id,
                        sellerId: product.seller_id,
                      }))
                    }
                  >
                    Select Product
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mt-5">
        <h3 className="text-white mb-4">Order Details</h3>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Product ID</label>
              <input
                type="text"
                className="form-control"
                name="productId"
                value={form.productId}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Seller ID</label>
              <input
                type="text"
                className="form-control"
                name="sellerId"
                value={form.sellerId}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Contract Data</label>
              <input
                type="text"
                className="form-control"
                name="contractData"
                value={form.contractData}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Payment Details</label>
              <input
                type="text"
                className="form-control"
                name="paymentDetails"
                value={form.paymentDetails}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Delivery Address</label>
              <input
                type="text"
                className="form-control"
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <button className="btn btn-primary mt-4" onClick={createOrder}>
          Create Order
        </button>
        {message && <p className="mt-3">{message}</p>}
      </div>
    </div>
  );
};

export default CreateOrder;
