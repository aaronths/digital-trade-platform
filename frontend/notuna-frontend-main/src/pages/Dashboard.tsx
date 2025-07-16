import React from "react";
import { Link } from "react-router-dom";


const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h2 className="text-center mb-5">Dashboard</h2>
      
      <div className="container d-flex justify-content-center align-items-center gap-5 flex-wrap">
        <Link 
          to="/create-order" 
          className="nav-link bg-dark text-white py-4 px-5 rounded text-center" 
          style={{ 
            fontSize: '1.5rem',
            minWidth: '300px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          + Create New Order
        </Link>
        
        <Link 
          to="/create-invoice" 
          className="nav-link bg-dark text-white py-4 px-5 rounded text-center" 
          style={{ 
            fontSize: '1.5rem',
            minWidth: '300px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          + Generate Invoice
        </Link>
        
        <Link 
          to="/create-despatch" 
          className="nav-link bg-dark text-white py-4 px-5 rounded text-center" 
          style={{ 
            fontSize: '1.5rem',
            minWidth: '300px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          + Generate Despatch Advice
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
