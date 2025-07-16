import React, { useState, useEffect } from 'react';

const CreateInvoice: React.FC = () => {
  const [orderId, setOrderId] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
  const [invoiceId, setInvoiceId] = useState<any>(null);

  // Fetch invoices when the page loads
  useEffect(() => {
    if (invoiceId) {
      fetchInvoice(invoiceId);
    }
  }, [invoiceId]);

  // Function to fetch the invoice from the backend
  const fetchInvoice = async (invoiceId: string | null) => {
    if (invoiceId) {
      const apiUrl = `https://iamamik710-bvpzkbif.leapcell.dev/api/invoices/${invoiceId}`;
      const response = await fetch(apiUrl, {
        headers: {
          'X-API-Key': '94cb2213908f83e366837ce784a2119c6d5fdacd236b04125f3bcf8608e550b6',
          'X-User-Email': 'dododo1@gmail.com',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setInvoiceDetails(data.invoice);
      } else {
        setApiResponse({
          status: response.status,
          error: data.message || 'Failed to fetch invoices',
        });
      }
    }
  };

  // Function to save invoice to backend
  const saveInvoice = async () => {
    if (!invoiceId) { 
      setApiResponse({
        error: 'Invoice has not been generated',
      });
      return;
    }
    const s_id = localStorage.getItem("s_id");
    const apiUrl = `https://seng2021-notuna-order.vercel.app/shop/seller/save-invoice/${orderId}?sellerId=${s_id}&invoiceId=${invoiceId}`;
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': 'SENG2021'
      }
    });

    const data = await response.json();
    if (response.ok) {
      setApiResponse({
        status: response.status,
        message: 'Invoice saved successfully!',
      });
    } else {
      setApiResponse({
        status: response.status,
        error: data.message || 'Failed to save invoice',
      });
    }
  };

  // Function to handle the form submit and send the XML payload to the API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiResponse(null);

    try {
      const s_id = localStorage.getItem("s_id");
      const apiUrl = `https://seng2021-notuna-order.vercel.app/shop/seller/generate-invoice/${orderId}?sellerId=${s_id}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'SENG2021',
        },
      });

      const data = await response.json();

      if (response.ok && data.message === 'Invoice Generated Successfully') {
        if (invoiceId) {
          const apiUrl = `http://guard-ubl-api.us-east-1.elasticbeanstalk.com/api/invoices/${invoiceId}`;
          const headers = {
            'X-API-Key': '94cb2213908f83e366837ce784a2119c6d5fdacd236b04125f3bcf8608e550b6',
            'X-User-Email': 'dododo1@gmail.com',
          };

        try {
          await fetch(apiUrl, {
            method: 'DELETE',
            headers: headers,
          });
        }
        catch {}
        }
        setInvoiceId(data.invoiceId);
        setApiResponse({
          status: response.status,
          message: 'Invoice generated successfully!',
        });
      } else {
        setApiResponse({
          status: response.status,
          error: data.message || 'Failed to generate invoice',
        });
      }
    } catch (err) {
      setApiResponse({
        status: 500,
        error: err instanceof Error ? err.message : 'Failed to generate invoice',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!invoiceId) return;

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

  // Render the invoice details for the current invoice
  const renderInvoiceDetails = () => {
    const invoice = invoiceDetails;
    return invoice ? (
      <div className="invoice-details-box">
        <h5>Invoice ID: {invoice.id}</h5>
        <p><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>
        <p><strong>Buyer:</strong> {invoice.buyerName}</p>
        <p><strong>Seller:</strong> {invoice.sellerName}</p>
        <p><strong>Total Amount:</strong> {invoice.totalAmount}</p>
        <p><strong>Currency:</strong> {invoice.currency}</p>
        <p><strong>Issue Date:</strong> {invoice.issueDate}</p>
        <p><strong>Due Date:</strong> {invoice.dueDate}</p>
        <p><strong>Created At:</strong> {invoice.createdAt}</p>
      </div>
    ) : (
      <p>No invoice found.</p>
    );
  };

  return (
    <div className="bg-light p-4 rounded mt-5 shadow-sm">
      <h2 className="text-center mb-4">Generate Invoice</h2>
      <form onSubmit={handleSubmit}>
  <div className="d-flex justify-content-center align-items-end" style={{ gap: '10px' }}>
    <div>
      <label htmlFor="orderId">Order ID</label>
      <input
        id="orderId"
        type="number"
        className="form-control"
        value={orderId}
        onChange={(e) => setOrderId(Number(e.target.value))}
      />
    </div>

    <button
      type="submit"
      className="btn btn-primary mb-0"
      disabled={loading}
    >
      {loading ? 'Generating...' : 'Generate Invoice'}
    </button>
  </div>
</form>

      {apiResponse && (
        <div className={`alert mt-4 ${(apiResponse.status === 200 || apiResponse.status === 201) ? 'alert-success' : 'alert-danger'}`}>
          {apiResponse.message || apiResponse.error}
        </div>
      )}

      <div className="invoice-section text-center mt-3">

        <div className="my-3"></div>

        <div className="invoice-details-container">
          {renderInvoiceDetails()}
        </div>

        <div className="my-3"></div>

        <div className="action-buttons">
          <button
            onClick={handleGeneratePDF}
            className="btn btn-secondary mx-2"
          >
            Generate PDF
          </button>
          <button
            onClick={saveInvoice}
            className="btn btn-secondary mx-2"
          >
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;