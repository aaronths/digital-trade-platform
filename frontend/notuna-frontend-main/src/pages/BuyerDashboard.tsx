import { useState, useEffect } from 'react';
import CreateOrder from "./CreateOrder";
import ViewNotifications from "./ViewNotifications";
import ViewBuyerOrders from "./ViewBuyerOrders";
import ViewInvoices from "./ViewInvoices";
import ViewDespatch from "./ViewDespatch";
import BuyerStats from "./BuyerStats";

const BuyerDashboard = () => {
  const [selectedContent, setSelectedContent] = useState("Create Order");
  const [notificationCount, setNotificationCount] = useState(0);

  // Retrieve name from localStorage
  const nameFirst = localStorage.getItem("nameFirst") || "User";

  useEffect(() => {
    const fetchNotificationCount = async () => {
      let apiUrl: string;
      
      apiUrl = `https://seng2021-notuna-order.vercel.app/shop/buyer/${localStorage.getItem("b_id")}/active-orders-action`;
  
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': 'SENG2021'
          }
        });
        const data = await response.json();
        if (response.ok) {
          setNotificationCount(data.orders.length);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
  
    fetchNotificationCount();
  }, []);

  const handleContentChange = (content: string) => {
    setSelectedContent(content);
  };

  return (
    <div className="d-flex p-1">
      {/* Sidebar */}
      <div
        className="text-dark p-4 d-flex flex-column"
        style={{
          position: "fixed",
          top: 80,
          left: 0,
          width: "300px",
          height: "100vh",
          backgroundColor: "#eeeeee",
        }}
      >
        <h2 className="text-center mt-4 mb-3">{nameFirst}'s Buyer Dashboard</h2>
        <hr />
        {/* Highlighted Buttons */}
        <ul className="list-unstyled m-1">
          {["+ Create New Order"].map((btn) => (
            <li key={btn} className="mb-2">
              <button
                className={`btn w-100 m-1 ${
                  selectedContent === btn ? "btn-warning text-dark" : "btn"
                }`}
                style={{
                  backgroundColor:
                    selectedContent === btn ? "#ffc107" : "#2d2673",
                  color: selectedContent === btn ? "#000" : "#fff",
                  borderRadius: "25px",
                  width: "90%",
                  margin: "0 auto",
                  fontFamily: "DM Sans",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
                onClick={() => handleContentChange(btn)}
              >
                {btn}
              </button>
            </li>
          ))}
        </ul>
        <hr />
        {/* Standard Buttons */}
        <ul className="list-unstyled">
          {["View Notifications","View Orders", "View Invoices", "View Despatch", "View Stats"].map((btn) => (
            <li key={btn} className="mb-2">
              <button
                className={`btn w-100 ${
                  selectedContent === btn ? "fw-bold" : "text-secondary"
                }`}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  textDecoration:
                    selectedContent === btn ? "underline" : "none",
                  textAlign: "left",
                  width: "90%",
                  margin: "0 auto",
                  fontFamily: "DM Sans",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
                onClick={() => handleContentChange(btn)}
              >
                {btn}
                {btn === "View Notifications" && notificationCount > 0 && (
        <span className="badge bg-danger ms-2">{notificationCount}</span>
      )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div
        className="p-3"
        style={{
          marginLeft: "350px",
          width: "calc(100% - 350px)",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <div>
          {selectedContent === "+ Create New Order" && <CreateOrder />}
          {selectedContent === "View Notifications" && (<ViewNotifications onNavigate={handleContentChange} />)}
          {selectedContent === "View Orders" && <ViewBuyerOrders />}
          {selectedContent === "View Invoices" && <ViewInvoices />}
          {selectedContent === "View Despatch" && <ViewDespatch />}
          {selectedContent === "View Stats" && <BuyerStats />}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
