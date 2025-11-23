# 📦 Inventory Management System

A modern, full-stack inventory management application built with React, Node.js, Express, and SQLite. This system provides comprehensive inventory tracking with real-time updates, CSV import/export functionality, and detailed inventory history.

## ✨ Features

- **📊 Dashboard Overview**: Real-time statistics and insights
- **📦 Product Management**: Add, edit, and delete products
- **🏷️ Category Organization**: Filter and organize products by categories
- **📈 Inventory Tracking**: Track stock levels and changes
- **📋 History Management**: Complete audit trail of inventory changes
- **📤 CSV Import/Export**: Bulk import and export product data
- **🔍 Advanced Search**: Find products quickly with search functionality
- **⚡ Real-time Updates**: Live data synchronization
- **📱 Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Beautiful notifications
- **CSS3** - Modern styling with animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite3** - Lightweight database
- **Multer** - File upload handling
- **CSV Parser** - CSV file processing
- **Express Validator** - Input validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhanush217/inventory-management.git
   cd inventory-management
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`

### Production Mode

1. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the Production Server**
   ```bash
   cd backend
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/search` - Search products by name
- `GET /api/products/:id/history` - Get product inventory history
- `PUT /api/products/:id` - Update a product

#### Categories
- `GET /api/categories` - Get all categories

#### Import/Export
- `POST /api/products/import` - Import products from CSV
- `GET /api/products/export` - Export products to CSV

#### Health Check
- `GET /health` - API health status

### Example Usage

**Get All Products:**
```javascript
fetch('http://localhost:3001/api/products')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Search Products:**
```javascript
fetch('http://localhost:3001/api/products/search?name=mouse')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Import CSV:**
```javascript
const formData = new FormData();
formData.append('csvFile', fileInput.files[0]);

fetch('http://localhost:3001/api/products/import', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## 📁 Project Structure

```
inventory-management/
├── backend/
│   ├── server.js              # Main server file
│   ├── inventory.db           # SQLite database
│   ├── package.json           # Backend dependencies
│   ├── uploads/               # File upload directory
│   └── cleanup-database.js    # Database cleanup script
├── frontend/
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.js
│   │   │   ├── ProductsContent.js
│   │   │   ├── ProductTable.js
│   │   │   ├── InventoryHistory.js
│   │   │   ├── ImportExport.js
│   │   │   └── Navigation.js
│   │   ├── services/
│   │   │   └── api.js         # API service layer
│   │   ├── App.js             # Main App component
│   │   └── index.js           # Entry point
│   ├── package.json           # Frontend dependencies
│   └── README.md              # Frontend documentation
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
```

### Database Configuration
The application uses SQLite3 database located at `backend/inventory.db`. The database is automatically initialized when the server starts.

## 📊 Database Schema

### Products Table
```sql
CREATE TABLE products (
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
);
```

### Inventory History Table
```sql
CREATE TABLE inventory_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  old_quantity INTEGER,
  new_quantity INTEGER,
  change_date TEXT DEFAULT CURRENT_TIMESTAMP,
  user_info TEXT,
  FOREIGN KEY(product_id) REFERENCES products(id)
);
```

## 🚢 Deployment

### Local Deployment
1. Follow the Quick Start instructions above
2. Ensure both backend and frontend are running
3. Access the application at `http://localhost:3000`

### Cloud Deployment Options

#### Option 1: Heroku
1. Create a Heroku app
2. Set up environment variables
3. Deploy using Git

#### Option 2: Vercel (Frontend) + Railway (Backend)
1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Update API endpoints accordingly

#### Option 3: DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build and start commands
3. Set environment variables

## 🧪 Testing

Run the backend tests:
```bash
cd backend
npm test
```

Run the frontend tests:
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 CSV Import Format

When importing products via CSV, ensure your file has the following columns:

| Column | Required | Example |
|--------|----------|---------|
| name | Yes | "Wireless Mouse" |
| unit | No | "pieces" |
| category | No | "Electronics" |
| brand | No | "Logitech" |
| stock | No | "100" |
| status | No | "active" |
| image | No | "https://example.com/image.jpg" |

Example CSV:
```csv
name,unit,category,brand,stock,status,image
"Wireless Mouse",pieces,Electronics,Logitech,100,active,https://example.com/mouse.jpg
"Bluetooth Speaker",pieces,Electronics,JBL,50,active,https://example.com/speaker.jpg
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change the PORT in `.env` file or kill the process using the port

2. **Database Connection Error**
   - Ensure the `backend/inventory.db` file exists
   - Check file permissions

3. **CORS Errors**
   - Verify CORS is enabled in the backend server
   - Check the frontend API base URL

4. **Import/Export Not Working**
   - Ensure the `uploads` directory exists
   - Check file permissions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed description

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Multi-location inventory tracking
- [ ] Barcode/QR code scanning
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Integration with e-commerce platforms
- [ ] Automated reorder points
- [ ] Supplier management
- [ ] Bulk operations

---

**Built with ❤️ by Dhanush**

For more information, visit the [GitHub repository](https://github.com/dhanush217/inventory-management).