import React, { useState, useEffect } from 'react';

const ViewDespatch: React.FC = () => {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [despatchList, setDespatchList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isBuyer = window.location.pathname.includes('/buyer');

  useEffect(() => {
    const fetchDespatches = async () => {
      try {
        setLoading(true);
        const userKey = isBuyer ? 'b_id' : 's_id';
        const userId = localStorage.getItem(userKey);
        
        if (!userId) {
          throw new Error('Please login first');
        }

        const endpoint = isBuyer 
          ? `https://seng2021-notuna-order.vercel.app/shop/buyer/view-despatch/${userId}`
          : `https://seng2021-notuna-order.vercel.app/shop/seller/view-despatch/${userId}`;

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': 'SENG2021',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setDespatchList(data.despatches || []);
        setApiResponse(null);
      } catch (err) {
        setApiResponse({
          error: err instanceof Error ? err.message : 'Failed to fetch despatches'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDespatches();
  }, [isBuyer]);

  const handleViewXml = async (despatchId: string) => {
    try {
      const apiUrl = `https://sbu6etysvc.execute-api.us-east-1.amazonaws.com/despatch/${despatchId}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch despatch details');
      }
  
      const xmlText = await response.text();
      
      // Create a new window with proper XML formatting
      const xmlWindow = window.open('', '_blank');
      if (xmlWindow) {
        xmlWindow.document.write(`
          <html>
            <head>
              <title>Despatch XML</title>
              <style>
                body {
                  font-family: monospace;
                  white-space: pre-wrap; /* This makes long lines wrap */
                  word-break: break-all; /* Break long unspaced strings */
                  padding: 20px;
                  background: #f5f5f5;
                  line-height: 1.5;
                }
                .xml-container {
                  background: white;
                  padding: 20px;
                  border-radius: 5px;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                  max-width: 100%;
                  overflow-x: auto;
                }
              </style>
            </head>
            <body>
              <div class="xml-container">
                ${formatXmlForDisplay(xmlText)}
              </div>
            </body>
          </html>
        `);
      }
    } catch (err) {
      setApiResponse({
        error: err instanceof Error ? err.message : 'Failed to view despatch details'
      });
    }
  };
  
  // Format XML with line breaks and indentation
  const formatXmlForDisplay = (xml: string) => {
    // First, properly escape the XML
    const escapedXml = xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  
    // Add line breaks after tags
    const withLineBreaks = escapedXml
      .replace(/(&lt;\/?[a-zA-Z]+)/g, '\n$1')  // Line break before opening/closing tags
      .replace(/(&gt;)/g, '$1\n')              // Line break after closing angle bracket
      .replace(/\n+/g, '\n')                   // Remove multiple line breaks
      .trim();
  
    // Add basic indentation
    let indentLevel = 0;
    const lines = withLineBreaks.split('\n');
    const formattedLines = lines.map(line => {
      if (line.includes('&lt;/')) {
        indentLevel--;
      }
      
      const indentedLine = '  '.repeat(Math.max(0, indentLevel)) + line;
      
      if (line.includes('&lt;') && !line.includes('&lt;/') && !line.includes('/&gt;')) {
        indentLevel++;
      }
      
      return indentedLine;
    });
  
    return formattedLines.join('\n');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
        <h4 className="mb-3 fw-bold text-dark text-center">
          {isBuyer ? 'Received Despatches' : 'Your Despatches'}
        </h4>

        {despatchList.length === 0 && (
          <p className="text-center text-muted">No despatch records available.</p>
        )}

        {/* Despatch Cards */}
        {despatchList.map((despatch, idx) => (
          <div
            key={despatch.despatch_id || idx}
            className="d-flex justify-content-between align-items-center bg-white rounded shadow-sm p-3 mb-3"
          >
            {/* Left Details */}
            <div className="flex-grow-1">
              <p className="mb-1"><strong>Order:</strong> {despatch.order_id}</p>
              <p className="mb-1"><strong>{isBuyer ? 'Seller' : 'Buyer'}:</strong> {isBuyer ? despatch.s_name : despatch.b_name}</p>
              <p className="mb-1"><strong>Status:</strong> {despatch.o_status}</p>
              <p className="mb-1"><strong>Product:</strong> {despatch.p2_name}</p>
              <p className="mb-1"><strong>Price:</strong> ${despatch.price}</p>
              <p className="mb-0"><strong>Despatch ID:</strong> {despatch.despatch_id}</p>
            </div>

            {/* Right Button */}
            <div className="text-end">
              <button
                onClick={() => handleViewXml(despatch.despatch_id)}
                className="btn btn-link text-decoration-underline text-dark"
              >
                View XML
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewDespatch;