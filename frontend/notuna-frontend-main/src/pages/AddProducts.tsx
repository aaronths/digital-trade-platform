import React, { useState, useEffect } from "react";

const AddProducts: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    tax: "",
    description: "",
    sellerId: "", 
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const sellerId = localStorage.getItem("s_id");
    if (sellerId) {
      setFormData(prev => ({ ...prev, sellerId }));
    } else {
      setMessage("Seller ID not found. Please log in.");
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); // reset

    try {
        const apiUrl = `https://seng2021-notuna-order.vercel.app/shop/${formData.sellerId}/add-new-product-v2`;

      console.log("Sending to:", apiUrl);
      console.log("Payload:", formData);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "SENG2021",
        },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          tax: formData.tax,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Product added successfully!");
        setFormData(prev => ({
          ...prev,
          name: "",
          price: "",
          tax: "",
          description: "",
        }));
      } else {
        setMessage(`${data.message || "Failed to add product."}`);
      }
    } catch (error: any) {
      console.error("Request error:", error);
      setMessage(`Unexpected error: ${error.message}`);
    }
  };

  return (
    <div className="container mt-4 text-white">
      <h2>Add a New Product</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        {/* Hidden sellerId input (read from localStorage) */}
        <input type="hidden" name="sellerId" value={formData.sellerId} />

        <div className="mb-3">
          <label htmlFor="name" className="form-label">Product Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="tax" className="form-label">Tax</label>
          <input
            type="text"
            className="form-control"
            id="tax"
            name="tax"
            value={formData.tax}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-light">Submit</button>
      </form>

      {message && (
        <div className="alert mt-3 text-white bg-dark p-3 rounded">
          {message}
        </div>
      )}
    </div>
  );
};

export default AddProducts;
