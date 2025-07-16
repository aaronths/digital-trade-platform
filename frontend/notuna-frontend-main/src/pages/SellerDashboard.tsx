import { useState, useEffect } from 'react';
import ViewNotifications from "./ViewNotifications";
import ViewSellerOrders from "./ViewSellerOrders";
import ViewInvoices from "./ViewInvoices";
import ViewDespatch from "./ViewDespatch";
import CreateInvoice from "./CreateInvoice";
import CreateDespatch from "./CreateDespatch";
import ViewProducts from "./ViewProducts";
import AddProducts from "./AddProducts";
import SellerStats from "./SellerStats";

const SellerDashboard = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedContent, setSelectedContent] = useState("Create Order");

  useEffect(() => {
    const fetchNotificationCount = async () => {
      let apiUrl: string;

      apiUrl = `https://seng2021-notuna-order.vercel.app/shop/seller/${localStorage.getItem("s_id")}/active-orders-action`;
  
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

  // Retrieve name from localStorage
  const nameFirst = localStorage.getItem("nameFirst") || "User";

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
        <h2 className="text-center mt-4 mb-3">
          {nameFirst}'s Seller Dashboard
        </h2>
        <hr />
        {/* Highlighted Buttons */}
        <ul className="list-unstyled m-1">
          {["+ Generate Invoice", "+ Generate Despatch", "+ Add Product"].map(
            (btn) => (
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
                    width: "90%", // Adjusted button width
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
            )
          )}
        </ul>
        <hr />
        {/* Standard Buttons */}
        <ul className="list-unstyled">
          {["View Notifications",
            "View Orders",
            "View Invoices",
            "View Despatch",
            "View Products",
            "View Stats"
          ].map((btn) => (
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
                  textAlign: "left", // Align text to the left
                  width: "90%", // Adjust width
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
          width: "calc(100% - 350px)", // Adjust width for sidebar
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <div>
          {selectedContent === "+ Generate Invoice" && <CreateInvoice />}
          {selectedContent === "+ Generate Despatch" && <CreateDespatch />}
          {selectedContent === "View Notifications" && (<ViewNotifications onNavigate={handleContentChange}/>)}
          {selectedContent === "View Orders" && <ViewSellerOrders />}
          {selectedContent === "View Invoices" && <ViewInvoices />}
          {selectedContent === "View Despatch" && <ViewDespatch />}
          {selectedContent === "+ Add Product" && <AddProducts />}
          {selectedContent === "View Products" && <ViewProducts />}
          {selectedContent === "View Stats" && <SellerStats />}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
