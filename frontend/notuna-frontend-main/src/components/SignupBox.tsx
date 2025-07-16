import React, { useState } from "react";

const SignupBox: React.FC = () => {
  const [formData, setFormData] = useState({
    nameFirst: "",
    nameLast: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // State to track loading

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const registerResponse = await fetch(
        "https://seng2021-notuna-order.vercel.app/shop/user/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        setMessage("User registered successfully");

        const loginResponse = await fetch(
          "https://seng2021-notuna-order.vercel.app/shop/user/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          }
        );

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          const { token, namefirst, namelast, id, b_id, s_id } =
            loginData.sessionDetails;
          localStorage.setItem("token", token);
          localStorage.setItem("nameFirst", namefirst);
          localStorage.setItem("nameLast", namelast);
          localStorage.setItem("id", id);
          localStorage.setItem("b_id", b_id);
          localStorage.setItem("s_id", s_id);

          window.location.href = "/dashboard";
        } else {
          setMessage(loginData.message || "Login failed after registration");
        }
      } else {
        setMessage(registerData.message || "Registration failed");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-50">
      <div className="card p-5 shadow">
        <h3 className="text-center mb-5">Sign Up</h3>
        {message && <div className="alert alert-info">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between gap-4">
            <div className="mb-3 flex-fill">
              <label className="form-label" style={{ fontFamily: "DM Sans" }}>
                First Name
              </label>
              <input
                type="text"
                name="nameFirst"
                className="form-control"
                value={formData.nameFirst}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3 flex-fill">
              <label className="form-label" style={{ fontFamily: "DM Sans" }}>
                Last Name
              </label>
              <input
                type="text"
                name="nameLast"
                className="form-control"
                value={formData.nameLast}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontFamily: "DM Sans" }}>
              Email Address
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="text"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontFamily: "DM Sans" }}>
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
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
            disabled={loading} // Disable button when loading
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
        <hr className="mt-5" />
        <p className="text-center mt-3">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupBox;
