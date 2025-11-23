import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = ({ onNavigate, refreshTrigger }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    outOfStock: 0,
    categories: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all products
      const products = await productAPI.getProducts();
      const categories = await productAPI.getCategories();
      
      // Calculate statistics
      const totalProducts = products.length;
      const totalStock = products.reduce((sum, product) => sum + (parseInt(product.stock) || 0), 0);
      const outOfStock = products.filter(product => product.stock === 0).length;
      
      // Get recent products (last 5)
      const recent = products
        .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
        .slice(0, 5);
      
      // Get low stock products (less than 10 items)
      const lowStock = products
        .filter(product => product.stock > 0 && product.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);
      
      setStats({
        totalProducts,
        totalStock,
        outOfStock,
        categories: categories.length
      });
      
      setRecentProducts(recent);
      setLowStockProducts(lowStock);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <div 
      className={`stat-card ${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
      <div className="stat-glow"></div>
    </div>
  );

  const ProductItem = ({ product, type }) => {
    const isLowStock = type === 'low-stock';
    const statusClass = product.stock === 0 ? 'out-of-stock' : 
                       isLowStock ? 'low-stock' : 'in-stock';
    
    return (
      <div className={`product-item ${statusClass}`}>
        <div className="product-info">
          <h4>{product.name}</h4>
          <p>{product.category} • {product.brand}</p>
        </div>
        <div className="product-stock">
          <span className="stock-value">{product.stock}</span>
          <span className="stock-label">units</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card skeleton">
              <div className="stat-icon skeleton-box"></div>
              <div className="stat-content skeleton-box"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>📊 Dashboard</h1>
          <p>Welcome back! Here's your inventory overview.</p>
        </div>
        <button onClick={() => onNavigate && onNavigate('products')} className="btn btn-primary">
          📋 View All Products
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="📦"
          color="blue"
          onClick={() => onNavigate && onNavigate('products')}
        />
        <StatCard
          title="Total Stock"
          value={stats.totalStock}
          icon="📈"
          color="green"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon="⚠️"
          color="red"
          onClick={() => onNavigate && onNavigate('products', { filter: 'out-of-stock' })}
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          icon="🏷️"
          color="purple"
          onClick={() => onNavigate && onNavigate('categories')}
        />
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Products */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>📅 Recently Updated</h3>
            <button 
              onClick={() => onNavigate && onNavigate('products', { sort: 'recent' })}
              className="btn-link"
            >
              View All →
            </button>
          </div>
          <div className="card-content">
            {recentProducts.length > 0 ? (
              <div className="products-list">
                {recentProducts.map(product => (
                  <ProductItem key={product.id} product={product} type="recent" />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent products</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="dashboard-card alert">
          <div className="card-header">
            <h3>⚡ Low Stock Alerts</h3>
            <span className="alert-badge">{lowStockProducts.length}</span>
          </div>
          <div className="card-content">
            {lowStockProducts.length > 0 ? (
              <div className="products-list">
                {lowStockProducts.map(product => (
                  <ProductItem key={product.id} product={product} type="low-stock" />
                ))}
              </div>
            ) : (
              <div className="empty-state success">
                <p>🎉 All products are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="actions-grid">
          <button 
            onClick={() => onNavigate && onNavigate('products', { action: 'add' })}
            className="action-btn"
          >
            <span className="action-icon">➕</span>
            <span>Add Product</span>
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('products', { action: 'import' })}
            className="action-btn"
          >
            <span className="action-icon">📥</span>
            <span>Import CSV</span>
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('products', { action: 'export' })}
            className="action-btn"
          >
            <span className="action-icon">📤</span>
            <span>Export CSV</span>
          </button>
          <button 
            onClick={loadDashboardData}
            className="action-btn"
          >
            <span className="action-icon">🔄</span>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;