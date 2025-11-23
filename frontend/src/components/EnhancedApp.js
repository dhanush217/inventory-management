import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import ProductsContent from './ProductsContent';
import InventoryHistory from './InventoryHistory';
import ImportExport from './ImportExport';
import toast from 'react-hot-toast';
import './EnhancedApp.css';

const EnhancedApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    outOfStock: 0,
    categories: 0
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load dashboard stats
  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    try {
      const products = await productAPI.getProducts();
      const categories = await productAPI.getCategories();
      
      const totalProducts = products.length;
      const totalStock = products.reduce((sum, product) => sum + (parseInt(product.stock) || 0), 0);
      const outOfStock = products.filter(product => product.stock === 0).length;
      
      setStats({
        totalProducts,
        totalStock,
        outOfStock,
        categories: categories.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleNavigation = (page, options = {}) => {
    setCurrentPage(page);
    
    // Handle specific actions
    if (page === 'products' && options.action === 'add') {
      toast.success('🎯 Ready to add new product!', {
        duration: 2000,
        position: 'top-center',
      });
    } else if (page === 'products' && options.action === 'import') {
      toast.info('📥 Import functionality ready!', {
        duration: 2000,
        position: 'top-center',
      });
    } else if (page === 'products' && options.action === 'export') {
      toast.info('📤 Export functionality ready!', {
        duration: 2000,
        position: 'top-center',
      });
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setCurrentPage('history');
  };

  const handleImportComplete = (result) => {
    toast.success(`🎉 Import completed! Added ${result.added} products, skipped ${result.skipped}`, {
      duration: 5000,
      position: 'top-center',
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('🔄 Data refreshed!', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={handleNavigation}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'products':
        return (
          <div className="page-content">
            <ProductsContent
              onProductSelect={handleProductSelect}
              refreshTrigger={refreshTrigger}
            />
          </div>
        );
      case 'import':
        return (
          <div className="page-content">
            <div className="import-export-page">
              <div className="page-header">
                <h1>📥📤 Import/Export</h1>
                <p>Manage your inventory data with CSV import and export</p>
              </div>
              <ImportExport
                onImportComplete={handleImportComplete}
                onRefreshData={handleRefreshData}
              />
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="page-content">
            <div className="history-page">
              <div className="page-header">
                <h1>📋 Inventory History</h1>
                <p>Track all inventory changes and stock movements</p>
              </div>
              {selectedProduct ? (
                <InventoryHistory
                  selectedProduct={selectedProduct}
                  onClose={() => setSelectedProduct(null)}
                />
              ) : (
                <div className="no-selection">
                  <div className="selection-icon">📋</div>
                  <h3>No Product Selected</h3>
                  <p>Select a product from the Products page to view its inventory history.</p>
                  <button 
                    onClick={() => setCurrentPage('products')}
                    className="btn btn-primary"
                  >
                    📦 Go to Products
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <Dashboard 
            onNavigate={handleNavigation}
            refreshTrigger={refreshTrigger}
          />
        );
    }
  };

  return (
    <div className="enhanced-app">
      <Navigation 
        currentPage={currentPage}
        onNavigate={handleNavigation}
        stats={stats}
      />
      <main className="main-content">
        <div className="content-wrapper">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  );
};

export default EnhancedApp;