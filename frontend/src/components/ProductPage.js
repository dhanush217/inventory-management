import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import ProductTable from './ProductTable';
import InventoryHistory from './InventoryHistory';
import ImportExport from './ImportExport';
import './ProductPage.css';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Filter products when search or category changes
  useEffect(() => {
    if (products.length > 0) {
      loadProducts(); // Reload with filters
    }
  }, [searchQuery, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;
      
      const data = await productAPI.getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesList = await productAPI.getCategories();
      setCategories(categoriesList);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    // The InventoryHistory component will automatically show when selectedProduct is not null
  };

  const handleHistoryClose = () => {
    setSelectedProduct(null);
  };

  const handleImportComplete = (result) => {
    console.log('Import completed:', result);
    // Optionally show a success message or notification
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
  };

  return (
    <div className="product-page">
      {/* Header */}
      <div className="page-header">
        <h1>Inventory Management</h1>
        <div className="header-actions">
          <ImportExport 
            onImportComplete={handleImportComplete}
            onRefreshData={loadProducts}
          />
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-filters">
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>

          {/* Category Filter */}
          <div className="filter-container">
            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || categoryFilter) && (
            <button onClick={clearFilters} className="btn btn-clear">
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Info */}
        <div className="results-info">
          {loading ? (
            <span className="loading-text">Loading products...</span>
          ) : (
            <span className="results-count">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={loadProducts} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="table-section">
        <ProductTable
          products={products}
          setProducts={setProducts}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          onProductSelect={handleProductSelect}
          refreshData={loadProducts}
        />
      </div>

      {/* Inventory History Sidebar */}
      <div className={`history-sidebar ${selectedProduct ? 'open' : ''}`}>
        <InventoryHistory
          selectedProduct={selectedProduct}
          onClose={handleHistoryClose}
        />
      </div>
    </div>
  );
};

export default ProductPage;