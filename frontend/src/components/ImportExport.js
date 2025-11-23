import React, { useState } from 'react';
import { productAPI } from '../services/api';
import './ImportExport.css';

const ImportExport = ({ onImportComplete, onRefreshData }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file to import.');
      return;
    }

    try {
      setImporting(true);
      const result = await productAPI.importProducts(selectedFile);
      setImportResult(result);
      
      // Refresh parent data if import was successful
      if (onRefreshData) {
        await onRefreshData();
      }
      
      // Call completion callback if provided
      if (onImportComplete) {
        onImportComplete(result);
      }
      
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        message: 'Import failed. Please try again.',
        error: error.message
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await productAPI.exportProducts();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'products.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setImportResult(null);
  };

  const resetImportModal = () => {
    setSelectedFile(null);
    setImportResult(null);
    // Reset file input
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="import-export-container">
      {/* Export Button */}
      <button onClick={handleExport} className="btn btn-export">
        Export CSV
      </button>

      {/* Import Button */}
      <button 
        onClick={() => setShowImportModal(true)} 
        className="btn btn-import"
      >
        Import CSV
      </button>

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Import Products from CSV</h3>
              <button 
                className="close-btn" 
                onClick={closeImportModal}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="import-instructions">
                <div className="instructions-header">
                  <div className="instruction-icon">📋</div>
                  <h4>Quick Setup Guide</h4>
                </div>
                
                <div className="instructions-grid">
                  <div className="instruction-card">
                    <div className="card-icon">📊</div>
                    <h5>Required Columns</h5>
                    <p>name, unit, category, brand, stock, status, image</p>
                  </div>
                  
                  <div className="instruction-card">
                    <div className="card-icon">⚡</div>
                    <h5>Important Rules</h5>
                    <ul>
                      <li>Name field is <strong>required & unique</strong></li>
                      <li>Stock must be a number</li>
                      <li>Status: "active" or "inactive"</li>
                    </ul>
                  </div>
                  
                  <div className="instruction-card">
                    <div className="card-icon">✅</div>
                    <h5>What Happens</h5>
                    <ul>
                      <li>✅ Valid products will be added</li>
                      <li>⚠️ Duplicates will be skipped</li>
                      <li>📈 Results will be shown</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="file-upload-section">
                <div 
                  className={`file-upload-area ${selectedFile ? 'has-file' : ''}`}
                  onClick={() => document.getElementById('csvFileInput').click()}
                >
                  <div className="file-upload-icon">
                    {selectedFile ? '📁' : '📄'}
                  </div>
                  <label htmlFor="csvFileInput" className={`file-upload-label ${selectedFile ? 'has-file' : ''}`}>
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to select CSV file'}
                  </label>
                  <div className="file-upload-actions">
                    <button
                      type="button"
                      className="btn btn-browse"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('csvFileInput').click();
                      }}
                    >
                      📁 Browse Files
                    </button>
                  </div>
                </div>
                <input
                  id="csvFileInput"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="file-input"
                />
              </div>

              {importResult && (
                <div className={`import-result ${importResult.success !== false ? 'success' : 'error'}`}>
                  <h4>
                    {importResult.success !== false ? '✅ Import Completed!' : '❌ Import Failed'}
                  </h4>
                  
                  {importResult.success !== false && (
                    <div className="result-stats">
                      <div className="result-stat">
                        <p><strong>Products Added:</strong> {importResult.added}</p>
                      </div>
                      <div className="result-stat">
                        <p><strong>Products Skipped:</strong> {importResult.skipped}</p>
                      </div>
                      
                      {importResult.duplicates && importResult.duplicates.length > 0 && (
                        <div className="duplicates-list">
                          <p><strong>⚠️ Duplicates Found:</strong></p>
                          <ul>
                            {importResult.duplicates.map((dup, index) => (
                              <li key={index}>{dup.name} - {dup.reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {importResult.success === false && (
                    <p className="error-message">{importResult.message}</p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                onClick={closeImportModal} 
                className="btn btn-cancel"
              >
                Close
              </button>
              <button
                onClick={resetImportModal}
                className="btn btn-secondary"
              >
                Reset
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile || importing}
                className="btn btn-primary"
              >
                {importing ? 'Importing...' : 'Import Products'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExport;