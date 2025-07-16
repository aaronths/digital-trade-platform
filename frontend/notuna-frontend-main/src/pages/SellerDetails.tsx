import React, { useState } from "react";

const SellerDetails: React.FC = () => {
  const [formData, setFormData] = useState({
    sellerCompanyName: "",
    sellerAddress: "",
    sellerPhoneNumber: "",
    sellerTax: "",
    sellerEmail: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await fetch(
        "https://seng2021-notuna-order.vercel.app/shop/user/create-seller",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            id: localStorage.getItem("id"),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("s_id", data.sellerId);
        setMessage("Seller details added");
        window.location.href = "/seller-dashboard";
      } else {
        setMessage(data.message || "Seller Detail Input Failed");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-5 shadow"
        style={{
          width: "100%",
          maxWidth: "600px",
          borderRadius: "15px",
        }}
      >
        <h3 className="text-center mb-3">Seller Details</h3>
        {message && <div className="alert alert-info">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontFamily: "DM Sans" }}>
              Company Name
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-building"></i>
              </span>
              <input
                type="text"
                name="sellerCompanyName"
                className="form-control"
                value={formData.sellerCompanyName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontFamily: "DM Sans" }}>
              Address
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-geo-alt"></i>
              </span>
              <input
                type="text"
                name="sellerAddress"
                className="form-control"
                value={formData.sellerAddress}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontFamily: "DM Sans" }}>
              Phone Number
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-telephone"></i>
              </span>
              <input
                type="text"
                name="sellerPhoneNumber"
                className="form-control"
                value={formData.sellerPhoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontFamily: "DM Sans" }}>
              Tax Number
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-receipt"></i>
              </span>
              <input
                type="text"
                name="sellerTax"
                className="form-control"
                value={formData.sellerTax}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontFamily: "DM Sans" }}>
              Email
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                name="sellerEmail"
                className="form-control"
                value={formData.sellerEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-warning w-100 mt-4"
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              fontFamily: "DM Sans",
              color: "black",
              transition: "all 0.3s ease",
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.color = "white";
                (e.target as HTMLButtonElement).style.fontSize = "1.3rem";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.color = "black";
                (e.target as HTMLButtonElement).style.fontSize = "1.2rem";
              }
            }}
          >
            {loading ? (
              <div
                className="spinner-border text-light"
                role="status"
                style={{ width: "1.5rem", height: "1.5rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerDetails;
