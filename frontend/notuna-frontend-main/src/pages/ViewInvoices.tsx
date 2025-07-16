import React, { useState, useEffect } from 'react';

const ViewInvoices: React.FC = () => {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [invoiceList, setInvoiceList] = useState<any[]>([]);
  const isBuyer = location.pathname.includes('/buyer');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    let apiUrl : string;
    if (isBuyer) { // on buyer side
      apiUrl = 'https://seng2021-notuna-order.vercel.app/shop/buyer/view-invoices/' + localStorage.getItem("b_id");
    }
    else { // not on buyer side so must be seller side
      apiUrl = 'https://seng2021-notuna-order.vercel.app/shop/seller/view-invoices/' + localStorage.getItem("s_id");
    }
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': 'SENG2021'
      }
    });

    const data = await response.json();
    if (response.ok) {
      setInvoiceList(data.invoices);
    } else {
      setApiResponse({
        status: response.status,
        error: data.message || 'Failed to fetch invoices',
      });
    }
  };

    const handleGeneratePDF = async (invoiceId: string) => {
    const apiUrl = `https://iamamik710-bvpzkbif.leapcell.dev/api/invoices/${invoiceId}/pdf`;
    const headers = {
      'X-API-Key': '94cb2213908f83e366837ce784a2119c6d5fdacd236b04125f3bcf8608e550b6',
      'X-User-Email': 'dododo1@gmail.com',
    };

    try {
        // Send the fetch request to generate the PDF
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers,
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Failed to generate PDF');
        }

        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('An error occurred while generating the PDF.');
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
        <h4 className="mb-3 fw-bold text-dark text-center">Your Invoices</h4>

        {invoiceList.length === 0 && (
          <p className="text-center text-muted">No invoices available.</p>
        )}

        {/* Invoice Cards */}
        {invoiceList.map((invoice, idx) => (
          <div
            key={invoice.invoice_id || idx}
            className="d-flex justify-content-between align-items-center bg-white rounded shadow-sm p-3 mb-3"
          >
            {/* Left Details */}
            <div className="flex-grow-1">
              <p className="mb-1"><strong>Order:</strong> {invoice.order_id}</p>
              <p className="mb-1"><strong>Buyer:</strong> {invoice.b_name}</p>
              <p className="mb-1"><strong>Status:</strong> {invoice.o_status}</p>
              <p className="mb-1"><strong>Product:</strong> {invoice.p2_name}</p>
              <p className="mb-0"><strong>Price:</strong> ${invoice.price}</p>
            </div>

            {/* Right Button */}
            <div className="text-end">
              <button
                onClick={() => handleGeneratePDF(invoice.invoice_id)}
                className="btn btn-link text-decoration-underline text-dark"
              >
                View Invoice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewInvoices;