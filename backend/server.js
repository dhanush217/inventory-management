const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const csvParser = require('csv-parser');
const { body, param, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

// Database connection
const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  db.serialize(() => {
    // Create products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      unit TEXT,
      category TEXT,
      brand TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'active',
      image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create inventory_history table
    db.run(`CREATE TABLE IF NOT EXISTS inventory_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      old_quantity INTEGER,
      new_quantity INTEGER,
      change_date TEXT DEFAULT CURRENT_TIMESTAMP,
      user_info TEXT,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`);

    // Create trigger to update updated_at timestamp
    db.run(`CREATE TRIGGER IF NOT EXISTS update_products_updated_at 
      AFTER UPDATE ON products
      FOR EACH ROW
      BEGIN
        UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END`);
  });
};

initializeDatabase();

// Helper function to handle database errors
const handleDbError = (res, error) => {
  console.error('Database error:', error);
  res.status(500).json({ error: 'Database operation failed' });
};

// Helper function to check validation results
const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

// A. GET /api/products - Get all products
app.get('/api/products', (req, res) => {
  const { category, search, limit = 50, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM products WHERE 1=1';
  let params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return handleDbError(res, err);
    }
    res.json(rows);
  });
});

// B. PUT /api/products/:id - Update product with inventory history tracking
app.put('/api/products/:id',
  [
    param('id').isInt({ min: 1 }),
    body('name').optional().isLength({ min: 1 }).trim(),
    body('unit').optional().trim(),
    body('category').optional().trim(),
    body('brand').optional().trim(),
    body('stock').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['active', 'inactive']),
    body('image').optional().isURL()
  ],
  (req, res) => {
    const validationError = checkValidation(req, res);
    if (validationError) return validationError;
    
    const { id } = req.params;
    const { name, unit, category, brand, stock, status, image } = req.body;
    
    // First, get the current product data
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
      if (err) {
        return handleDbError(res, err);
      }
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Check if name is unique (excluding current product)
      if (name && name !== product.name) {
        db.get('SELECT id FROM products WHERE name = ? AND id != ?', [name, id], (err, existing) => {
          if (err) {
            return handleDbError(res, err);
          }
          
          if (existing) {
            return res.status(400).json({ error: 'Product name already exists' });
          }
          
          updateProduct();
        });
      } else {
        updateProduct();
      }
      
      function updateProduct() {
        const updateFields = [];
        const updateValues = [];
        
        if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
        if (unit !== undefined) { updateFields.push('unit = ?'); updateValues.push(unit); }
        if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
        if (brand !== undefined) { updateFields.push('brand = ?'); updateValues.push(brand); }
        if (stock !== undefined) { updateFields.push('stock = ?'); updateValues.push(stock); }
        if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
        if (image !== undefined) { updateFields.push('image = ?'); updateValues.push(image); }
        
        if (updateFields.length === 0) {
          return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(id);
        
        const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
        
        db.run(query, updateValues, function(err) {
          if (err) {
            return handleDbError(res, err);
          }
          
          // If stock has changed, insert into inventory_history
          if (stock !== undefined && stock !== product.stock) {
            db.run(
              'INSERT INTO inventory_history (product_id, old_quantity, new_quantity, change_date, user_info) VALUES (?, ?, ?, ?, ?)',
              [id, product.stock, stock, new Date().toISOString(), req.body.user_info || 'System'],
              (err) => {
                if (err) {
                  console.error('Error inserting inventory history:', err);
                }
              }
            );
          }
          
          // Get updated product
          db.get('SELECT * FROM products WHERE id = ?', [id], (err, updatedProduct) => {
            if (err) {
              return handleDbError(res, err);
            }
            res.json(updatedProduct);
          });
        });
      }
    });
  }
);

// C. POST /api/products/import - Import products from CSV
app.post('/api/products/import', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  const results = [];
  const duplicates = [];
  let addedCount = 0;
  let skippedCount = 0;
  
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      let processed = 0;
      
      results.forEach((product, index) => {
        const { name, unit = '', category = '', brand = '', stock = 0, status = 'active', image = '' } = product;
        
        // Check if required fields are present
        if (!name || name.trim() === '') {
          skippedCount++;
          processed++;
          if (processed === results.length) {
            cleanupAndRespond();
          }
          return;
        }
        
        // Check for duplicates
        db.get('SELECT id FROM products WHERE name = ?', [name.trim()], (err, existing) => {
          if (err) {
            console.error('Error checking duplicate:', err);
            skippedCount++;
          } else if (existing) {
            duplicates.push({ name, reason: 'Name already exists' });
            skippedCount++;
          } else {
            // Insert new product
            db.run(
              'INSERT INTO products (name, unit, category, brand, stock, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [name.trim(), unit.trim(), category.trim(), brand.trim(), parseInt(stock) || 0, status.trim(), image.trim()],
              function(err) {
                if (err) {
                  console.error('Error inserting product:', err);
                  skippedCount++;
                } else {
                  addedCount++;
                }
              }
            );
          }
          
          processed++;
          if (processed === results.length) {
            cleanupAndRespond();
          }
        });
      });
    });
  
  function cleanupAndRespond() {
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({
      message: 'Import completed',
      added: addedCount,
      skipped: skippedCount,
      duplicates: duplicates
    });
  }
});

// D. GET /api/products/export - Export products to CSV
app.get('/api/products/export', (req, res) => {
  db.all('SELECT * FROM products ORDER BY name', (err, rows) => {
    if (err) {
      return handleDbError(res, err);
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No products to export' });
    }
    
    // Create CSV content
    const headers = ['id', 'name', 'unit', 'category', 'brand', 'stock', 'status', 'image', 'created_at', 'updated_at'];
    let csvContent = headers.join(',') + '\n';
    
    rows.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.status(200).send(csvContent);
  });
});

// E. GET /api/products/:id/history - Get product inventory history
app.get('/api/products/:id/history', [
  param('id').isInt({ min: 1 })
], (req, res) => {
  const validationError = checkValidation(req, res);
  if (validationError) return validationError;
  
  const { id } = req.params;
  
  // First check if product exists
  db.get('SELECT id, name FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return handleDbError(res, err);
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get inventory history
    db.all(
      'SELECT * FROM inventory_history WHERE product_id = ? ORDER BY change_date DESC',
      [id],
      (err, history) => {
        if (err) {
          return handleDbError(res, err);
        }
        
        res.json({
          product: product,
          history: history
        });
      }
    );
  });
});

// F. GET /api/products/search - Search products by name
app.get('/api/products/search', (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ error: 'Search term is required' });
  }
  
  db.all(
    'SELECT * FROM products WHERE name LIKE ? ORDER BY name',
    [`%${name}%`],
    (err, rows) => {
      if (err) {
        return handleDbError(res, err);
      }
      res.json(rows);
    }
  );
});

// Get unique categories
app.get('/api/categories', (req, res) => {
  db.all(
    'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" ORDER BY category',
    [],
    (err, rows) => {
      if (err) {
        return handleDbError(res, err);
      }
      res.json(rows.map(row => row.category));
    }
  );
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Inventory Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Database initialized at: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});