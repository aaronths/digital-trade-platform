import React, { useState } from "react";

const BuyerDetails: React.FC = () => {
  const [formData, setFormData] = useState({
    buyerCompanyName: "",
    buyerAddress: "",
    buyerPhoneNumber: "",
    buyerTax: "",
    buyerEmail: "",
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
        "https://seng2021-notuna-order.vercel.app/shop/user/create-buyer",
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
        localStorage.setItem("b_id", data.buyerId);
        setMessage("Buyer details added");
        window.location.href = "/buyer-dashboard";
      } else {
        setMessage(data.message || "Buyer Detail Input Failed");
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
        <h3 className="text-center mb-3">Buyer Details</h3>
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
                name="buyerCompanyName"
                className="form-control"
                value={formData.buyerCompanyName}
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
                name="buyerAddress"
                className="form-control"
                value={formData.buyerAddress}
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
                name="buyerPhoneNumber"
                className="form-control"
                value={formData.buyerPhoneNumber}
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
                name="buyerTax"
                className="form-control"
                value={formData.buyerTax}
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
                name="buyerEmail"
                className="form-control"
                value={formData.buyerEmail}
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

export default BuyerDetails;
