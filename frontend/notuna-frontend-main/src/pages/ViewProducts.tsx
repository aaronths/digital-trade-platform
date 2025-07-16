import React, { useEffect, useState } from 'react';

interface Product {
  p2_id: number;
  p2_name: string;
  p2_price: number;
  p2_tax: string;
  p2_desc: string;
  seller_id: number;
}

const ViewProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    const sellerId = localStorage.getItem("s_id");

    if (!sellerId) {
      setError("Seller ID not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://seng2021-notuna-order.vercel.app/shop/product-v2/${sellerId}/view-all-products`,
        {
          method: 'GET',
          headers: {
            Authorization: 'SENG2021',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: number) => {
    const sellerId = localStorage.getItem("s_id");
    if (!sellerId) return;

    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://seng2021-notuna-order.vercel.app/shop/${sellerId}/delete-product-v2`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'SENG2021',
          },
          body: JSON.stringify({ productId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Product deleted successfully.");
        fetchProducts(); // Refresh the list
      } else {
        setMessage(`${data.message || "Failed to delete product."}`);
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-white mb-4 text-center">My Products</h2>

      {loading && <p className="text-white text-center">Loading products...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-info">{message}</div>}

      <div className="row">
        {products.map((product) => (
          <div className="col-md-4 mb-4" key={product.p2_id}>
            <div className="card h-100 shadow">
              <div className="card-body">
                <h5 className="card-title">{product.p2_name}</h5>
                <p className="card-text"><strong>Price:</strong> ${product.p2_price}</p>
                <p className="card-text"><strong>Tax:</strong> {product.p2_tax}</p>
                <p className="card-text"><strong>Description:</strong> {product.p2_desc}</p>
                <button
                  className="btn btn-danger mt-3"
                  onClick={() => handleDelete(product.p2_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && !error && (
        <p className="text-white text-center">No products found.</p>
      )}
    </div>
  );
};

export default ViewProducts;
