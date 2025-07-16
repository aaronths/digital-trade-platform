import Header from "./components/Header";
import Home from "./pages/Home";
import BuyerDashboard from "./pages/BuyerDashboard";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CreateOrder from "./pages/CreateOrder";
import CreateDespatch from "./pages/CreateDespatch";
import CreateInvoice from "./pages/CreateInvoice";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SellerDashboard from "./pages/SellerDashboard";
import RequireBuyerId from "./components/RequireBID";
import RequireSellerId from "./components/RequireSID";
import SellerDetails from "./pages/SellerDetails";
import BuyerDetails from "./pages/BuyerDetails";
import ViewProducts from "./pages/ViewProducts";
import AddProducts from "./pages/AddProducts";
import MessagesPage from "./pages/MessagesPage";
import ViewDespatch from "./pages/ViewDespatch";
import ViewBuyerOrders from "./pages/ViewBuyerOrders";

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <div
        className="main-content"
        style={{
          paddingTop: "80px",
          backgroundImage: "linear-gradient(to right, #2d2673, #6a4c9c)",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute>
                <RequireBuyerId>
                  <BuyerDashboard />
                </RequireBuyerId>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/seller-dashboard"
            element={
              <RequireSellerId>
                <SellerDashboard />
              </RequireSellerId>
            }
          />

          <Route 
            path="/view-despatch" 
            element={
              <ProtectedRoute>
                <ViewDespatch />
              </ProtectedRoute>
            } 
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/create-despatch" element={<CreateDespatch />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/seller-details" element={<SellerDetails />} />
          <Route path="/buyer-details" element={<BuyerDetails />} />
          <Route path="/products" element={<ViewProducts />} />
          <Route path="/add-product" element={<AddProducts />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;


