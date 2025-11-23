import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import ProductTable from './ProductTable';
import ImportExport from './ImportExport';
import toast from 'react-hot-toast';
import './ProductsContent.css';

const ProductsContent = ({ onProductSelect, refreshTrigger }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data and when refresh trigger changes
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [refreshTrigger]);

  // Filter products when search or category changes
  useEffect(() => {
    loadProducts();
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
      toast.error('Failed to load products');
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
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const handleImportComplete = (result) => {
    toast.success(`🎉 Import completed! Added ${result.added} products, skipped ${result.skipped}`, {
      duration: 5000,
      position: 'top-center',
    });
    loadProducts(); // Refresh the product list
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
  };

  return (
    <div className="products-content">
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

      {/* Import/Export Section */}
      <div className="import-export-section">
        <ImportExport
          onImportComplete={handleImportComplete}
          onRefreshData={loadProducts}
        />
      </div>
    </div>
  );
};

export default ProductsContent;