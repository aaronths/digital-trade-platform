import React, { useState } from 'react';

const CreateDespatch: React.FC = () => {
  const [orderId, setOrderId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [despatchId, setDespatchId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiResponse(null);
    setDespatchId(null);

    try {
      // Validate order ID
      if (!orderId || isNaN(Number(orderId))) {
        throw new Error('Please enter a valid order ID');
      }

      const apiUrl = `https://seng2021-notuna-order.vercel.app/shop/seller/generate-despatch/${orderId}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'SENG2021',
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `Failed to generate despatch (Status: ${res.status})`);
      }

      if (!data.despatchAdvice?.despatchid) {
        throw new Error('Received invalid despatch ID from server');
      }

      setDespatchId(data.despatchAdvice.despatchid);
      setApiResponse({
        status: res.status,
        message: 'Despatch generated successfully!',
        despatchId: data.despatchAdvice.despatchid
      });
    } catch (err) {
      setApiResponse({
        status: 500,
        error: err instanceof Error ? err.message : 'Failed to generate despatch'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDespatch = async () => {
    if (!despatchId) {
      setApiResponse({ error: 'No despatch ID available to save' });
      return;
    }
  
    try {
      const s_id = localStorage.getItem("s_id");
      if (!s_id) {
        throw new Error('Seller not registered. Please complete seller details first.');
      }
  
      const apiUrl = `https://seng2021-notuna-order.vercel.app/shop/seller/save-despatch/${orderId}?sellerId=${s_id}&despatchId=${despatchId}`;
      
      console.log('Making request to:', apiUrl); // Debug log
      
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': 'SENG2021',
          'Content-Type': 'application/json',
        },
      });
  
      // First check if response is OK
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText); // Debug log
        throw new Error(errorText || `HTTP error! Status: ${res.status}`);
      }
  
      // Try to parse JSON only if there's content
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = { message: 'Despatch saved successfully' };
      }
  
      setApiResponse({
        status: res.status,
        message: data.message || 'Despatch saved successfully!'
      });
      
    } catch (err) {
      console.error('Full error:', err); // Debug log
      setApiResponse({
        status: 500,
        error: err instanceof Error ? err.message : 'Failed to save despatch'
      });
    }
  };

  return (
    <div className="bg-light p-4 rounded mt-5 shadow-sm">
      <h2 className="text-center mb-4">Generate Despatch Advice</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-center align-items-end" style={{ gap: '10px' }}>
          <div>
            <label htmlFor="orderId">Order ID</label>
            <input
              id="orderId"
              type="number"
              className="form-control"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary mb-0"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Despatch'}
          </button>
        </div>
      </form>

      {apiResponse && (
        <div className={`alert mt-4 ${apiResponse.error ? 'alert-danger' : 'alert-success'}`}>
          {apiResponse.error || apiResponse.message}
          {apiResponse.despatchId && (
            <div className="mt-2">
              <strong>Despatch ID:</strong> {apiResponse.despatchId}
            </div>
          )}
        </div>
      )}

      {despatchId && (
        <div className="text-center mt-4">
          <button
            onClick={handleSaveDespatch}
            className="btn btn-secondary"
            disabled={loading}
          >
            Save Despatch
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateDespatch;