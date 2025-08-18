# Jewelry Inventory Management System

A comprehensive full-stack jewelry inventory management application built with React frontend and Node.js backend for efficient tracking and management of jewelry business operations.

## 🌟 Features

### Core Functionality
- **💎 Inventory Management**
  - Add, edit, and delete jewelry items with detailed specifications
  - Track materials, labor costs, and total costs
  - Material weight tracking (gold, diamonds, stones)
  - Gold purity and weight calculations
  - Item status management (In Stock, Sold, etc.)
  - Bulk upload capability for inventory items

- **🏗️ Material & Category Management**
  - Comprehensive material library (Gold, Diamond, Stone, Silver)
  - Hierarchical category structure with parent/child relationships
  - Material cost and sale price tracking
  - Unit-based material management (grams, carats, etc.)
  - Wastage and making charges configuration

- **👥 User Management**
  - Role-based access control (Admin, Manager, User)
  - Secure user authentication system
  - Admin-only user creation and management
  - User profile management
  - Password change functionality

- **🏢 Vendor Management**
  - Vendor contact information management
  - Vendor performance tracking
  - Purchase history by vendor
  - Vendor communication logs

- **📊 Analytics & Reporting**
  - Real-time dashboard with key metrics
  - Available stock reports
  - Vendor stock analysis
  - Inventory valuation reports
  - Profit margin calculations

- **🔍 Advanced Search & Filter**
  - Multi-parameter search functionality
  - Category-based filtering
  - Status-based filtering
  - Quick search by item code or name

### Security Features
- **🔐 Authentication & Authorization**
  - JWT-based authentication
  - Role-based permissions
  - Secure password hashing (bcrypt)
  - Session management

## 🛠️ Technology Stack

### Frontend
- **React 18.x** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **JavaScript ES6+** - Modern JavaScript features

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **bcryptjs** - Password hashing
- **JSON Web Tokens** - Authentication
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **morgan** - HTTP request logger

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **nodemon** - Development server auto-restart
- **Create React App** - React application scaffolding

## 📂 Project Structure

```
jewelry-inventory-manager/
├── public/                       # Static public assets
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/                         # Frontend React application
│   ├── App.js                   # Main App component
│   ├── index.js                 # React DOM entry point
│   ├── components/
│   │   ├── admin/               # Admin panel components
│   │   │   ├── CategoryManagement.js
│   │   │   ├── MaterialManagement.js
│   │   │   ├── UserManagement.js
│   │   │   └── VendorManagement.js
│   │   ├── auth/                # Authentication components
│   │   │   └── Login.js
│   │   ├── billing/             # Billing and invoicing
│   │   │   ├── IndianBilling.js
│   │   │   └── USBilling.js
│   │   ├── forms/               # Data entry forms
│   │   │   ├── AddJewelryForm.js
│   │   │   ├── EditJewelryForm.js
│   │   │   └── MaterialForm.js
│   │   ├── inventory/           # Inventory management
│   │   │   ├── AddInventory.js
│   │   │   ├── EditInventory.js
│   │   │   ├── UploadInventory.js
│   │   │   ├── UploadJewelry.js
│   │   │   └── ViewInventory.js
│   │   ├── reports/             # Reporting components
│   │   │   ├── AvailableStock.js
│   │   │   └── VendorStock.js
│   │   ├── shared/              # Shared UI components
│   │   │   ├── ConfirmDialog.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Header.js
│   │   │   ├── JewelryDetailModal.js
│   │   │   ├── MaterialSelector.js
│   │   │   └── Sidebar.js
│   │   └── utilities/           # Utility components
│   │       └── DollarRate.js
│   ├── contexts/                # React contexts
│   │   └── AuthContext.js
│   ├── hooks/                   # Custom React hooks
│   │   ├── useJewelryCalculations.js
│   │   ├── useLocalStorage.js
│   │   └── useSearch.js
│   ├── services/                # API services
│   │   └── api.js
│   └── utils/                   # Utility functions
│       ├── calculations.js
│       ├── constants.js
│       ├── exportHelpers.js
│       └── validation.js
├── server/                      # Backend Node.js application
│   ├── server.js               # Express server entry point
│   ├── config/                 # Configuration files
│   │   └── database.js
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Custom middleware
│   │   └── errorHandler.js
│   ├── models/                 # Database models
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── inventory.js
│   │   ├── jewelry.js
│   │   ├── materials.js
│   │   ├── users.js
│   │   └── vendor.js
│   ├── scripts/                # Database scripts
│   │   ├── createDB.js
│   │   ├── schema.sql
│   │   └── seed.js
│   └── utils/                  # Backend utilities
├── package.json                # Frontend dependencies
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher) or yarn
- **PostgreSQL** (v12.0 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gadagojunikhil/jewel-inventory.git
   cd jewelry-inventory-manager
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb jewelry_inventory
   
   # Or using PostgreSQL client
   psql -U postgres
   CREATE DATABASE jewelry_inventory;
   \q
   ```

5. **Configure environment variables**
   ```bash
   # Frontend environment (create .env in root directory)
   PORT=3001
   REACT_APP_API_URL=/api
   
   # Backend environment (server/.env)
   cp server/.env.example server/.env
   # Edit server/.env with your database configuration:
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=jewelry_inventory
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   PORT=3000
   ```

6. **Initialize database schema**
   ```bash
   cd server
   npm run db:create
   npm run db:seed
   cd ..
   ```

7. **Start the applications**
   
   **Backend server (Terminal 1):**
   ```bash
   cd server
   npm start
   # Server runs on http://localhost:3000
   ```
   
   **Frontend application (Terminal 2):**
   ```bash
   npm start
   # Application runs on http://localhost:3001
   ```

8. **Access the application**
   - Open your browser and navigate to `http://localhost:3001`
   - **Default admin credentials:**
     - Email: `admin@jewelry.com`
     - Password: `admin123`

### Build for Production

**Frontend:**
```bash
npm run build
# Creates optimized production build in build/ directory
```

**Backend:**
```bash
cd server
# No build step required - runs directly with Node.js
```

### Troubleshooting

**Port conflicts:**
```bash
# If you get "EADDRINUSE" error, find and stop the process using the port
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000 (backend)
lsof -ti:3001 | xargs kill -9  # Kill process on port 3001 (frontend)

# Or change the port in environment variables:
# For frontend: Edit PORT in .env file
# For backend: Edit PORT in server/.env file
```

**Database connection issues:**
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# Test database connection
psql -U your_username -d jewelry_inventory -h localhost
```

**API connection issues:**
- Ensure the proxy in package.json points to the correct backend port (3000)
- Check that REACT_APP_API_URL in .env is set to `/api` for proxy usage
- Verify the backend server is running on the specified port

## 💻 Development

### Available Scripts

**Frontend:**
- `npm start` - Runs the React app in development mode (port 3001)
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (use with caution)

**Backend:**
- `npm start` - Runs the server in production mode (port 3000)
- `npm run dev` - Runs the server with nodemon for development
- `npm run db:create` - Creates database and runs schema
- `npm run db:seed` - Seeds database with initial data

### API Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Users:**
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

**Inventory:**
- `GET /api/jewelry` - Get all jewelry items
- `POST /api/jewelry` - Create new jewelry item
- `PUT /api/jewelry/:id` - Update jewelry item
- `DELETE /api/jewelry/:id` - Delete jewelry item

**Materials:**
- `GET /api/materials` - Get all materials
- `POST /api/materials` - Create new material
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material

**Categories:**
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

**Vendors:**
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `categories` - Jewelry categories and subcategories
- `materials` - Raw materials (gold, diamonds, stones, etc.)
- `jewelry_pieces` - Individual jewelry items
- `jewelry_materials` - Junction table for item-material relationships
- `sales` - Sales transactions (future implementation)

### Code Style

This project uses:
- **ESLint** - Code linting with React and Node.js rules
- **Prettier** - Code formatting
- **Tailwind CSS** - Utility-first CSS framework
- Consistent file naming conventions

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Development Guidelines:**
- Follow existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation when necessary
- Ensure all ESLint warnings are resolved

## 📈 Development Roadmap

### Completed ✅
- **Authentication System**
  - User login with JWT authentication
  - Role-based access control (Admin, Manager, User)
  - Admin-only user management
  - Secure password hashing

- **Inventory Management**
  - Complete jewelry item CRUD operations
  - Material tracking and cost calculations
  - Category and subcategory management
  - Advanced search and filtering
  - Bulk upload capabilities

- **Material Management**
  - Comprehensive material library
  - Cost and sale price tracking
  - Unit-based measurements
  - Material categories (Gold, Diamond, Stone, Silver)

- **Vendor Management**
  - Vendor contact information
  - Vendor performance tracking
  - Purchase history management

- **Database Integration**
  - PostgreSQL database setup
  - Complete schema with relationships
  - Database seeding scripts
  - Migration capabilities

- **UI/UX**
  - Modern, responsive design with Tailwind CSS
  - Intuitive navigation and user interface
  - Real-time dashboard with analytics
  - Mobile-responsive layout

### In Progress �
- **Enhanced Reporting**
  - Advanced analytics and insights
  - Profit margin analysis
  - Inventory valuation reports
  - Export capabilities (PDF, Excel)

- **Sales Management**
  - Complete sales transaction system
  - Customer management
  - Invoice generation
  - Payment tracking

### Planned 📋
- **Advanced Features**
  - Barcode/QR code scanning for inventory
  - Image upload and management for jewelry items
  - Multi-location inventory tracking
  - Real-time notifications
  - Email integration for alerts and reports

- **Business Intelligence**
  - Advanced analytics dashboard
  - Predictive analytics for stock levels
  - Seasonal trend analysis
  - ROI calculations and business insights

- **Integration & APIs**
  - Third-party integrations (accounting software)
  - RESTful API documentation
  - Webhook support for external systems
  - Import/Export from other jewelry management systems

- **Mobile & Offline**
  - Progressive Web App (PWA) capabilities
  - Offline functionality for critical operations
  - Mobile-first design optimizations
  - Push notifications

- **Advanced Security**
  - Two-factor authentication (2FA)
  - Audit logs and activity tracking
  - Data backup and recovery systems
  - GDPR compliance features

## 🔧 Technical Specifications

### Performance
- **Frontend**: Optimized React build with code splitting
- **Backend**: Express.js with connection pooling
- **Database**: PostgreSQL with indexed queries
- **Caching**: Redis for session management (planned)

### Security
- **Authentication**: JWT tokens with secure expiration
- **Password**: bcrypt hashing with salt rounds
- **Database**: Parameterized queries to prevent SQL injection
- **Headers**: Security headers with Helmet.js
- **CORS**: Configured cross-origin resource sharing

### Scalability
- **Architecture**: Modular component and service structure
- **Database**: Relational design with proper normalization
- **API**: RESTful design following best practices
- **Deployment**: Container-ready architecture

## 🌐 Browser Compatibility

- ✅ **Chrome 90+** - Full support
- ✅ **Firefox 88+** - Full support
- ✅ **Safari 14+** - Full support
- ✅ **Edge 90+** - Full support
- ❌ **Internet Explorer** - Not supported (EOL)

## 🚀 Deployment

### Production Deployment

**Option 1: Traditional Server**
```bash
# Frontend
npm run build
# Serve build folder with nginx or Apache

# Backend
cd server
npm start
# Run with PM2 for process management: pm2 start server.js
```

**Option 2: Docker (Recommended)**
```bash
# Create Dockerfile for frontend and backend
# Use docker-compose for orchestration
docker-compose up -d
```

**Option 3: Cloud Platforms**
- **Frontend**: Netlify, Vercel, or AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, or Google Cloud Platform
- **Database**: AWS RDS, Google Cloud SQL, or managed PostgreSQL

### Environment Configuration

**Production Environment Variables:**
```bash
# Frontend
REACT_APP_API_URL=https://your-api-domain.com/api

# Backend
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=jewelry_inventory_prod
DB_USER=prod_user
DB_PASSWORD=secure_password
JWT_SECRET=your-super-secure-jwt-secret
PORT=3000
```

## 📊 System Requirements

### Minimum Requirements
- **RAM**: 512 MB
- **Storage**: 1 GB free space
- **CPU**: 1 GHz processor
- **Network**: Broadband internet connection

### Recommended Requirements
- **RAM**: 2 GB or higher
- **Storage**: 5 GB free space
- **CPU**: Multi-core processor 2.4 GHz or higher
- **Network**: High-speed internet connection

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 🤝 Support & Community

### Getting Help
- **📧 Email Support**: gadagojunikhil@gmail.com
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/gadagojunikhil/jewel-inventory/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/gadagojunikhil/jewel-inventory/discussions)
- **📖 Documentation**: [Wiki](https://github.com/gadagojunikhil/jewel-inventory/wiki)

### Contributing
We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Code of conduct
- Development setup
- Pull request process
- Issue reporting guidelines

## 👏 Acknowledgments

### Technologies & Libraries
- **React Team** - For the amazing React framework
- **Express.js Community** - For the robust web framework
- **PostgreSQL Global Development Group** - For the reliable database
- **Tailwind CSS Team** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon library

### Contributors
- **Lead Developer**: Nikhil Gadagoju
- **Contributors**: [See Contributors](https://github.com/gadagojunikhil/jewel-inventory/contributors)

### Special Thanks
- Open source community for inspiration and libraries
- Beta testers for valuable feedback
- Jewelry industry professionals for domain expertise

---

## 📈 Project Statistics

- **Lines of Code**: ~15,000+
- **Components**: 25+ React components
- **API Endpoints**: 20+ RESTful endpoints
- **Database Tables**: 6 main tables
- **Features**: 50+ implemented features

---

**Project Status**: 🟢 **Active Development**

**Current Version**: v1.0.0-beta

**Last Updated**: August 18, 2025

---

*Built with ❤️ for the jewelry industry*