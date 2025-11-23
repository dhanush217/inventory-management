import React from 'react';
import './Navigation.css';

const Navigation = ({ currentPage, onNavigate, stats }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      badge: null
    },
    {
      id: 'products',
      label: 'Products',
      icon: '📦',
      badge: stats?.totalProducts || 0
    },
    {
      id: 'import',
      label: 'Import/Export',
      icon: '📥',
      badge: null
    },
    {
      id: 'history',
      label: 'History',
      icon: '📋',
      badge: null
    }
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>🗂️ InventoryPro</h2>
          <p>Professional Inventory Management</p>
        </div>
        
        <div className="nav-items">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge !== null && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </div>
        
        <div className="nav-footer">
          <div className="nav-status">
            <div className="status-indicator online"></div>
            <span>System Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;