import React, { useState, useEffect } from 'react';
const ViewNotifications: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate}) => {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [orderList, setOrderList] = useState<any[]>([]);
  const isBuyer = location.pathname.includes('/buyer');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    let apiUrl : string;
    if (isBuyer) { // on buyer side
      apiUrl = `https://seng2021-notuna-order.vercel.app/shop/buyer/${localStorage.getItem("b_id")}/active-orders-action`;
    }
    else { // not on buyer side so must be seller side
      apiUrl = `https://seng2021-notuna-order.vercel.app/shop/seller/${localStorage.getItem("s_id")}/active-orders-action`
    }
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': 'SENG2021'
      }
    });

    const data = await response.json();
    if (response.ok) {
      setOrderList(data.orders);
      // setNotificationCount(data.orders.length);
    } else {
      setApiResponse({
        status: response.status,
        error: data.message || 'Failed to fetch invoices',
      });
    }
  };

  return (
    <div className="container mt-4">

      {/* API Response Message */}
      {apiResponse && (
        <div className={`alert mt-4 ${apiResponse.status === 200 || apiResponse.status === 201 ? 'alert-success' : 'alert-danger'}`}>
          {apiResponse.message || apiResponse.error}
        </div>
      )}

      {/* Main Content Container */}
      <div className="bg-light p-4 rounded mt-5 shadow-sm">
        <h4 className="mb-3 fw-bold text-dark text-center">Orders Requiring Action ({orderList.length})</h4>

        {orderList.length === 0 && (
          <p className="text-center text-muted">No Orders requiring action.</p>
        )}

        {/* Invoice Cards */}
        {orderList.map((order, idx) => (
          <div
            key={order.invoice_id || idx}
            className="d-flex justify-content-between align-items-center bg-white rounded shadow-sm p-3 mb-3"
          >
            {/* Left Details */}
            <div className="flex-grow-1">
              <p className="mb-1"><strong>Order:</strong> {order.order_id}</p>
              <p className="mb-1"><strong>Buyer:</strong> {order.b_name}</p>
              <p className="mb-1"><strong>Status:</strong> {order.o_status}</p>
              <p className="mb-1"><strong>Product:</strong> {order.p2_name}</p>
              <p className="mb-0"><strong>Price:</strong> ${order.price}</p>
            </div>

            {/* Right Button */}
            <div className="text-end">
            <button
  onClick={() => onNavigate("View Orders")}
  className="btn btn-link text-decoration-underline text-dark"
>
  View Order
</button>
    </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewNotifications;