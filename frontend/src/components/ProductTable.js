import React, { useState } from 'react';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';
import './ProductTable.css';

const ProductTable = ({ 
  products, 
  setProducts, 
  searchQuery, 
  categoryFilter,
  onProductSelect,
  refreshData 
}) => {
  const [editingRows, setEditingRows] = useState({});
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize editing state for a row
  const startEditing = (productId) => {
    const product = products.find(p => p.id === productId);
    setEditingRows(prev => ({ ...prev, [productId]: true }));
    setEditData(prev => ({ 
      ...prev, 
      [productId]: { ...product }
    }));
  };

  // Cancel editing for a row
  const cancelEditing = (productId) => {
    setEditingRows(prev => ({ ...prev, [productId]: false }));
    setEditData(prev => {
      const newData = { ...prev };
      delete newData[productId];
      return newData;
    });
  };

  // Save changes for a row
  const saveChanges = async (productId) => {
    try {
      setLoading(true);
      const productData = editData[productId];
      const updatedProduct = await productAPI.updateProduct(productId, productData);
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? updatedProduct : p
      ));
      
      // Show success toast
      toast.success(`✅ Product "${productData.name}" updated successfully!`, {
        duration: 3000,
        position: 'top-center',
      });
      
      // Cancel editing
      cancelEditing(productId);
      
      // Refresh parent data if needed
      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(`❌ Failed to update product. ${error.response?.data?.error || 'Please try again.'}`, {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes in edit mode
  const handleEditChange = (productId, field, value) => {
    setEditData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  // Get stock status
  const getStockStatus = (stock) => {
    return stock === 0 ? 'Out of Stock' : 'In Stock';
  };

  // Get status color class
  const getStatusColorClass = (stock) => {
    return stock === 0 ? 'status-out-of-stock' : 'status-in-stock';
  };

  // Render table headers
  const renderTableHeaders = () => (
    <thead>
      <tr>
        <th>Name</th>
        <th>Unit</th>
        <th>Category</th>
        <th>Brand</th>
        <th>Stock</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
  );

  // Render a single table row
  const renderTableRow = (product) => {
    const isEditing = editingRows[product.id];
    const currentEditData = editData[product.id] || product;

    return (
      <tr key={product.id} className="product-row">
        <td>
          {isEditing ? (
            <input
              type="text"
              value={currentEditData.name || ''}
              onChange={(e) => handleEditChange(product.id, 'name', e.target.value)}
              className="edit-input"
            />
          ) : (
            product.name
          )}
        </td>
        <td>
          {isEditing ? (
            <input
              type="text"
              value={currentEditData.unit || ''}
              onChange={(e) => handleEditChange(product.id, 'unit', e.target.value)}
              className="edit-input"
            />
          ) : (
            product.unit || '-'
          )}
        </td>
        <td>
          {isEditing ? (
            <input
              type="text"
              value={currentEditData.category || ''}
              onChange={(e) => handleEditChange(product.id, 'category', e.target.value)}
              className="edit-input"
            />
          ) : (
            product.category || '-'
          )}
        </td>
        <td>
          {isEditing ? (
            <input
              type="text"
              value={currentEditData.brand || ''}
              onChange={(e) => handleEditChange(product.id, 'brand', e.target.value)}
              className="edit-input"
            />
          ) : (
            product.brand || '-'
          )}
        </td>
        <td>
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={currentEditData.stock || 0}
              onChange={(e) => handleEditChange(product.id, 'stock', parseInt(e.target.value) || 0)}
              className="edit-input stock-input"
            />
          ) : (
            product.stock
          )}
        </td>
        <td>
          <span className={`status-badge ${getStatusColorClass(product.stock)}`}>
            {getStockStatus(product.stock)}
          </span>
        </td>
        <td className="actions-cell">
          {isEditing ? (
            <div className="action-buttons">
              <button
                onClick={() => saveChanges(product.id)}
                disabled={loading}
                className="btn btn-save"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => cancelEditing(product.id)}
                disabled={loading}
                className="btn btn-cancel"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="action-buttons">
              <button
                onClick={() => startEditing(product.id)}
                className="btn btn-edit"
              >
                Edit
              </button>
              <button
                onClick={() => onProductSelect && onProductSelect(product)}
                className="btn btn-history"
              >
                History
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || 
      product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (products.length === 0) {
    return (
      <div className="no-products">
        <p>No products found. Try adjusting your search or category filter.</p>
      </div>
    );
  }

  return (
    <div className="product-table-container">
      <div className="table-responsive">
        <table className="product-table">
          {renderTableHeaders()}
          <tbody>
            {filteredProducts.map(renderTableRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;