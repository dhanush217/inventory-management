const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Starting database cleanup...');

// Function to clean corrupted data
const cleanupDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // First, let's see all the data
      db.all('SELECT * FROM products ORDER BY id', (err, rows) => {
        if (err) {
          console.error('Error reading products:', err);
          reject(err);
          return;
        }
        
        console.log('Current products in database:');
        rows.forEach(row => {
          console.log(`ID: ${row.id}, Name: "${row.name}", Stock: ${row.stock}`);
        });
        
        // Check for corrupted data (name field containing multiple products)
        const corruptedProducts = rows.filter(row => 
          row.name && (
            row.name.includes('Monitor') && row.name.includes('Keyboard') ||
            row.name.includes(',') && row.name.includes('pieces') && row.name.includes('Electronics')
          )
        );
        
        console.log(`\nFound ${corruptedProducts.length} corrupted product(s):`);
        corruptedProducts.forEach(product => {
          console.log(`- ID ${product.id}: "${product.name}"`);
        });
        
        if (corruptedProducts.length > 0) {
          console.log('\n🗑️ Deleting corrupted products...');
          
          // Delete corrupted products
          const corruptedIds = corruptedProducts.map(p => p.id);
          const placeholders = corruptedIds.map(() => '?').join(',');
          
          db.run(`DELETE FROM products WHERE id IN (${placeholders})`, corruptedIds, function(err) {
            if (err) {
              console.error('Error deleting corrupted products:', err);
              reject(err);
              return;
            }
            
            console.log(`✅ Deleted ${this.changes} corrupted product(s)`);
            
            // Now add the missing products manually
            addMissingProducts().then(() => {
              resolve();
            }).catch(reject);
          });
        } else {
          console.log('No corrupted products found.');
          resolve();
        }
      });
    });
  });
};

// Add missing products that were corrupted
const addMissingProducts = () => {
  return new Promise((resolve, reject) => {
    const missingProducts = [
      {
        name: 'Monitor 24"',
        unit: 'pieces',
        category: 'Electronics',
        brand: 'Dell',
        stock: 20,
        status: 'active',
        image: 'https://example.com/monitor.jpg'
      },
      {
        name: 'Keyboard',
        unit: 'pieces', 
        category: 'Electronics',
        brand: 'Corsair',
        stock: 60,
        status: 'active',
        image: 'https://example.com/keyboard.jpg'
      }
    ];
    
    let addedCount = 0;
    
    missingProducts.forEach(product => {
      db.run(
        'INSERT INTO products (name, unit, category, brand, stock, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product.name, product.unit, product.category, product.brand, product.stock, product.status, product.image],
        function(err) {
          if (err) {
            console.error('Error adding product:', product.name, err);
          } else {
            console.log(`✅ Added product: ${product.name} (ID: ${this.lastID})`);
            addedCount++;
          }
          
          if (addedCount === missingProducts.length) {
            console.log(`\n🎉 Cleanup completed! Added ${addedCount} products.`);
            resolve();
          }
        }
      );
    });
  });
};

// Main execution
cleanupDatabase()
  .then(() => {
    // Verify the final state
    db.all('SELECT * FROM products ORDER BY id', (err, rows) => {
      if (err) {
        console.error('Error verifying final state:', err);
      } else {
        console.log('\n📋 Final products in database:');
        rows.forEach(row => {
          console.log(`ID: ${row.id}, Name: "${row.name}", Stock: ${row.stock}, Category: ${row.category}`);
        });
      }
      
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('\n✅ Database cleanup completed successfully!');
        }
        process.exit(0);
      });
    });
  })
  .catch(err => {
    console.error('Cleanup failed:', err);
    db.close();
    process.exit(1);
  });