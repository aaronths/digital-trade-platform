import React from "react";

const Pricing: React.FC = () => {
  const plans = [
    {
      tier: "Mack Tier",
      description: "Made for small traders & startups",
      features: [
        "Up to 10 trades per month",
        "Basic order & invoice generation",
        "Community support",
        "200MB document storage",
      ],
      price: "Free",
      icon: "bi-person", // Icon for this tier
      bgColor: "#fffae6", // Yellow for Mack
    },
    {
      tier: "Yellowfin Tier",
      description: "Built for growing businesses",
      features: [
        "Unlimited trades",
        "Branded document templates",
        "Integrated chat",
        "Email & chat support",
        "250GB document storage",
      ],
      price: "$49/Month",
      icon: "bi-people", // Icon for this tier
      bgColor: "#ffe985", // Brighter yellow for Yellowfin
    },
    {
      tier: "Bluefin Tier",
      description: "For high-volume power traders",
      features: [
        "Everything in Yellowfin, plus:",
        "Priority support & onboarding",
        "Dedicated account manager",
        "2TB document storage",
      ],
      price: "$69/Month",
      icon: "bi-trophy", // Icon for this tier
      bgColor: "#ffd000", // Even brighter yellow for Bluefin
    },
  ];

  return (
    <div
      className="py-5"
      style={{
        background: "linear-gradient(to bottom, #bfbfbf, #c9b3fc)", // White-grey gradient
        minHeight: "100vh",
      }}
    >
      <div
        className="container"
        style={{
          paddingTop: "100px",
          paddingLeft: "70px",
          paddingRight: "70px",
        }}
      >
        <div className="row justify-content-center">
          {plans.map((plan, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div
                className="card shadow-sm border-0 h-100 text-center p-4 position-relative"
                style={{
                  backgroundColor: plan.bgColor, // Dynamic background color
                  transition:
                    "transform 0.3s, background-color 0.3s, color 0.3s",
                  borderRadius: "15px", // Rounded corners
                  color: "black", // Default text color
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#6f42c1"; // Purple background on hover
                  e.currentTarget.style.color = "white"; // White text on hover
                  e.currentTarget.style.transform = "scale(1.1)"; // Make the card bigger
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = plan.bgColor; // Revert to dynamic yellow
                  e.currentTarget.style.color = "black"; // Revert text color
                  e.currentTarget.style.transform = "scale(1)"; // Revert card size
                }}
              >
                {/* Icon at the top middle */}
                <div
                  className="position-absolute top-0 start-50 translate-middle bg-white rounded-circle p-3"
                  style={{
                    width: "60px",
                    height: "60px",
                    transform: "translate(-50%, -50%)", // Center the icon using translation
                    display: "flex",
                    justifyContent: "center", // Center horizontally
                    alignItems: "center", // Center vertically
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <i
                    className={`bi ${plan.icon}`}
                    style={{
                      fontSize: "1.5rem", // Adjust icon size
                      color: "#6f42c1", // Purple icon color
                    }}
                  ></i>
                </div>

                <div className="card-body mt-4">
                  <h2 className="card-title fw-bold">{plan.tier}</h2>
                  <p
                    className="card-subtitle text-inherit fst-italic mb-4"
                    style={{ color: "inherit" }} // Inherit text color (white on hover)
                  >
                    {plan.description}
                  </p>
                  <ul className="list-unstyled text-start mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="mb-2">
                        <i className="bi bi-dot text-primary"></i> {feature}
                      </li>
                    ))}
                  </ul>
                  <h3 className="fw-bold ">{plan.price}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
