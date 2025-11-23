import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import './InventoryHistory.css';

const InventoryHistory = ({ selectedProduct, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedProduct) {
      loadHistory();
    }
  }, [selectedProduct]);

  const loadHistory = async () => {
    if (!selectedProduct) return;
    
    try {
      setLoading(true);
      setError(null);
      const historyData = await productAPI.getProductHistory(selectedProduct.id);
      setHistory(historyData.history || []);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load inventory history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatChange = (oldQty, newQty) => {
    const change = newQty - oldQty;
    if (change > 0) {
      return {
        type: 'increase',
        text: `+${change}`,
        color: 'change-increase'
      };
    } else if (change < 0) {
      return {
        type: 'decrease',
        text: `${change}`,
        color: 'change-decrease'
      };
    } else {
      return {
        type: 'no-change',
        text: '0',
        color: 'change-neutral'
      };
    }
  };

  if (!selectedProduct) {
    return null;
  }

  return (
    <div className="inventory-history-sidebar">
      <div className="history-header">
        <h3>Inventory History</h3>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      
      <div className="selected-product-info">
        <h4>{selectedProduct.name}</h4>
        <div className="product-stats">
          <span className="current-stock">
            Current Stock: {selectedProduct.stock}
          </span>
          <span className={`stock-status ${selectedProduct.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
            {selectedProduct.stock === 0 ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>
      </div>

      <div className="history-content">
        {loading && (
          <div className="loading">
            <p>Loading history...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={loadHistory} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="no-history">
            <p>No inventory changes recorded for this product.</p>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="history-list">
            {history.map((record) => {
              const change = formatChange(record.old_quantity, record.new_quantity);
              return (
                <div key={record.id} className="history-item">
                  <div className="history-date">
                    {formatDate(record.change_date)}
                  </div>
                  <div className="history-details">
                    <div className="quantity-change">
                      <span className="old-qty">{record.old_quantity}</span>
                      <span className="arrow">→</span>
                      <span className="new-qty">{record.new_quantity}</span>
                      <span className={`change-value ${change.color}`}>
                        ({change.text})
                      </span>
                    </div>
                    {record.user_info && (
                      <div className="user-info">
                        by {record.user_info}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryHistory;