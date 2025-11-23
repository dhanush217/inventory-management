import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product API functions
export const productAPI = {
  // Get all products with optional filters
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // Search products by name
  searchProducts: async (name) => {
    const response = await apiClient.get('/products/search', {
      params: { name }
    });
    return response.data;
  },

  // Update a product
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  // Get product inventory history
  getProductHistory: async (id) => {
    const response = await apiClient.get(`/products/${id}/history`);
    return response.data;
  },

  // Import products from CSV
  importProducts: async (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    const response = await apiClient.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Export products to CSV
  exportProducts: async () => {
    const response = await apiClient.get('/products/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },
};

// Export API client as well for custom requests
export { apiClient };