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
  - Comprehensive material library (Gold, Diamond, Stone, Silver, Platinum)
  - Hierarchical category structure with parent/child relationships
  - Material cost and sale price tracking with real-time calculations
  - Unit-based material management (grams, carats, pieces, etc.)
  - Wastage and making charges configuration
  - Advanced search and filtering by category

- **👥 User Management & Permissions** 🆕
  - **Role-based access control** with 4-tier hierarchy:
    - **Super Admin**: Complete system control and user permissions management
    - **Admin**: User management, inventory, and business operations
    - **Manager**: Day-to-day operations and inventory management
    - **User**: Basic access to view reports and data
  - **Customizable Permission Matrix**: Edit access levels for any role and page combination
  - **Dynamic Permission Management**: Real-time permission updates with database persistence
  - **Quick Actions**: Bulk permission changes and default resets
  - **Visual Permission Matrix**: Tabular view showing all pages vs roles with color-coded access levels
  - Secure user authentication system with JWT
  - Admin-controlled user creation and management
  - User profile management and password changes

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
  - Role-based report access control

- **🔍 Advanced Search & Filter**
  - Multi-parameter search functionality
  - Category-based filtering
  - Status-based filtering
  - Quick search by item code or name

- **💰 Billing & Invoicing**
  - Indian billing format with GST compliance
  - US billing format for international clients
  - Automated price calculations
  - Material cost breakdowns

- **🔧 Utilities & Data Management**
  - Dollar rate management for currency conversion
  - Data synchronization tools
  - Bulk data operations
  - Export capabilities

### Security Features
- **🔐 Authentication & Authorization**
  - JWT-based authentication with secure token management
  - **Granular permission system** with customizable access levels:
    - 🚫 **No Access**: Complete restriction
    - 👁️ **View Only**: Read-only access
    - ✏️ **Edit Only**: Read and update permissions
    - ✅ **Full Access**: Complete CRUD operations
  - **Database-persisted permissions**: Custom permission overrides saved to PostgreSQL
  - Secure password hashing (bcrypt)
  - Session management with configurable expiration
  - **Super Admin controls**: Only Super Admins can modify user permissions

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
│   ├── index.html               # Main HTML template
│   ├── favicon.ico              # Application favicon
│   ├── logo192.png              # PWA icon (192x192)
│   ├── logo512.png              # PWA icon (512x512)
│   ├── manifest.json            # PWA manifest file
│   └── robots.txt               # Search engine robots file
├── src/                         # Frontend React application
│   ├── App.js                   # Main App component with routing
│   ├── App.css                  # Global application styles
│   ├── index.js                 # React DOM entry point
│   ├── index.css                # Base CSS with Tailwind imports
│   ├── components/
│   │   ├── admin/               # Admin panel components
│   │   │   ├── CategoryManagement.js      # Category CRUD operations
│   │   │   ├── MaterialManagement.js      # Material management with cost tracking
│   │   │   ├── MaterialManagement_Enhanced.js  # Enhanced material features
│   │   │   ├── PermissionsManagement.js   # 🆕 User Permissions Matrix System
│   │   │   ├── UserManagement.js          # User CRUD and role management
│   │   │   └── VendorManagement.js        # Vendor information management
│   │   ├── auth/                # Authentication components
│   │   │   └── Login.js                   # User login form with JWT
│   │   ├── billing/             # Billing and invoicing
│   │   │   ├── IndianBilling.js          # GST-compliant Indian billing
│   │   │   └── USBilling.js              # US format billing system
│   │   ├── forms/               # Data entry forms
│   │   │   ├── AddJewelryForm.js         # New jewelry item creation
│   │   │   ├── EditJewelryForm.js        # Jewelry item editing
│   │   │   └── MaterialForm.js           # Material creation/editing
│   │   ├── inventory/           # Inventory management
│   │   │   ├── AddInventory.js           # Single item addition
│   │   │   ├── EditInventory.js          # Inventory item editing
│   │   │   ├── UploadInventory.js        # Bulk inventory upload
│   │   │   ├── UploadJewelry.js          # Bulk jewelry upload
│   │   │   ├── ViewInventory.js          # Main inventory display
│   │   │   ├── ViewInventory_Old.js      # Legacy inventory view
│   │   │   └── ViewInventory_Safe.js     # Backup inventory view
│   │   ├── reports/             # Reporting components
│   │   │   ├── AvailableStock.js         # Stock availability reports
│   │   │   └── VendorStock.js            # Vendor-wise stock analysis
│   │   ├── shared/              # Shared UI components
│   │   │   ├── ConfirmDialog.js          # Confirmation modals
│   │   │   ├── Dashboard.js              # Main dashboard with analytics
│   │   │   ├── Header.js                 # Application header with navigation
│   │   │   ├── JewelryDetailModal.js     # Detailed jewelry item view
│   │   │   ├── MaterialSelector.js       # Material selection component
│   │   │   └── Sidebar.js                # Navigation sidebar with role-based access
│   │   └── utilities/           # Utility components
│   │       ├── DataSync.js               # Data synchronization tools
│   │       └── DollarRate.js             # Currency rate management
│   ├── contexts/                # React contexts
│   │   └── AuthContext.js               # Authentication state management
│   ├── hooks/                   # Custom React hooks
│   │   ├── useApiData.js                # API data fetching hook
│   │   ├── useDataSync.js               # Data synchronization hook
│   │   ├── useJewelryCalculations.js    # Cost calculation utilities
│   │   ├── useLocalStorage.js           # Local storage management
│   │   └── useSearch.js                 # Search and filtering logic
│   ├── services/                # API services
│   │   ├── api.js                       # Main API service with all endpoints
│   │   ├── api.js.new                   # New API implementations
│   │   └── api.new.js                   # Alternative API service
│   └── utils/                   # Utility functions
│       ├── calculations.js              # Cost and price calculations
│       ├── constants.js                 # Application constants
│       ├── dataManager.js               # Data management utilities
│       ├── exportHelpers.js             # Data export functions
│       ├── simpleStorage.js             # Simple storage utilities
│       ├── storageSync.js               # Storage synchronization
│       └── validation.js                # Input validation functions
├── server/                      # Backend Node.js application
│   ├── server.js               # Express server entry point
│   ├── package.json            # Backend dependencies
│   ├── config/                 # Configuration files
│   │   └── database.js                 # Database connection configuration
│   ├── controllers/            # Route controllers
│   │   ├── authController.js           # Authentication logic
│   │   ├── categoryController.js       # Category management logic
│   │   ├── jewelryController.js        # Jewelry operations logic
│   │   ├── materialController.js       # Material management logic
│   │   ├── userController.js           # User management logic
│   │   └── vendorController.js         # Vendor management logic
│   ├── middleware/             # Custom middleware
│   │   ├── auth.js                     # 🆕 Enhanced JWT authentication middleware
│   │   └── errorHandler.js             # Global error handling
│   ├── models/                 # Database models
│   │   └── index.js                    # Model exports
│   ├── routes/                 # API routes
│   │   ├── auth.js                     # Authentication endpoints
│   │   ├── categories.js               # Category CRUD endpoints
│   │   ├── inventory.js                # Inventory management endpoints
│   │   ├── jewelry.js                  # Jewelry CRUD endpoints
│   │   ├── materials.js                # Material management endpoints
│   │   ├── permissions.js              # 🆕 Custom permissions API endpoints
│   │   ├── users.js                    # User management endpoints
│   │   └── vendor.js                   # Vendor management endpoints
│   ├── scripts/                # Database scripts
│   │   ├── createAdmin.js              # Admin user creation script
│   │   ├── createDB.js                 # Database creation script
│   │   ├── custom_permissions.sql      # 🆕 Permissions table schema
│   │   ├── schema.sql                  # Main database schema
│   │   └── seed.js                     # Database seeding script
│   └── utils/                  # Backend utilities
├── backend/                     # Alternative backend (legacy)
│   ├── db.js                   # Database connection
│   ├── server.js               # Alternative server implementation
│   ├── middleware/
│   │   └── auth.js             # Legacy auth middleware
│   └── routes/
│       ├── jewelry.js          # Legacy jewelry routes
│       └── vendor.js           # Legacy vendor routes
├── db.json                     # JSON database (development/backup)
├── package.json                # Frontend dependencies and scripts
├── jewelry-inventory-manager.code-workspace  # VS Code workspace
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # 🆕 Updated project documentation
```

### 🆕 New Components & Features Added

**User Permissions System:**
- `PermissionsManagement.js` - Complete permissions matrix with editing capabilities
- `custom_permissions.sql` - Database schema for custom permission storage
- `permissions.js` (routes) - API endpoints for permission management
- Enhanced `auth.js` middleware with granular permission checking

**Enhanced Navigation:**
- Updated `Sidebar.js` with role-based menu visibility
- Dynamic permission checking for menu items
- "User Permissions" menu item (Super Admin only)

**Database Integration:**
- PostgreSQL custom permissions table
- Real-time permission updates
- Audit trails for permission changes
- Backup and restore capabilities

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
- `POST /api/auth/login` - User login with role-based response
- `POST /api/auth/logout` - User logout and token invalidation

**Users:**
- `GET /api/users` - Get all users (Admin+ only)
- `POST /api/users` - Create new user (Admin+ only)
- `PUT /api/users/:id` - Update user (Admin+ only)
- `DELETE /api/users/:id` - Delete user (Admin+ only)

**Permissions:** 🆕
- `GET /api/permissions` - Get custom permissions (Authenticated users)
- `POST /api/permissions` - Save custom permissions (Super Admin only)
- `DELETE /api/permissions` - Reset to default permissions (Super Admin only)

**Inventory:**
- `GET /api/jewelry` - Get all jewelry items (role-based filtering)
- `POST /api/jewelry` - Create new jewelry item (Manager+ only)
- `PUT /api/jewelry/:id` - Update jewelry item (Manager+ only)
- `DELETE /api/jewelry/:id` - Delete jewelry item (Admin+ only)

**Materials:**
- `GET /api/materials` - Get all materials with proper data formatting
- `GET /api/materials/:id` - Get material by ID
- `GET /api/materials/category/:category` - Get materials by category
- `POST /api/materials` - Create new material with validation (Manager+ only)
- `PUT /api/materials/:id` - Update material with data integrity (Manager+ only)
- `DELETE /api/materials/:id` - Soft delete material (Admin+ only)

**Categories:**
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (Manager+ only)
- `PUT /api/categories/:id` - Update category (Manager+ only)
- `DELETE /api/categories/:id` - Delete category (Admin+ only)

**Vendors:**
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create new vendor (Manager+ only)
- `PUT /api/vendors/:id` - Update vendor (Manager+ only)
- `DELETE /api/vendors/:id` - Delete vendor (Admin+ only)

### Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication with role hierarchy
- `categories` - Jewelry categories and subcategories
- `materials` - Raw materials (gold, diamonds, stones, etc.) with cost tracking
- `jewelry_pieces` - Individual jewelry items with full specifications
- `jewelry_materials` - Junction table for item-material relationships
- `custom_permissions` - 🆕 Custom permission overrides for role-based access control
- `sales` - Sales transactions (future implementation)

### 🆕 Permission System Database Schema

```sql
-- Custom Permissions Table
CREATE TABLE custom_permissions (
    id SERIAL PRIMARY KEY,
    page_id VARCHAR(100) NOT NULL,           -- System page identifier
    role VARCHAR(50) NOT NULL,               -- User role (super_admin, admin, manager, user)
    has_access BOOLEAN NOT NULL DEFAULT false,  -- Whether role has access
    access_level VARCHAR(20) NOT NULL DEFAULT 'none',  -- Access level (none, view, edit, full)
    created_by INTEGER REFERENCES users(id),    -- Who created this permission
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page_id, role)                    -- One permission per page-role combination
);
```

**Permission Levels:**
- `none` - No access to the page
- `view` - Read-only access
- `edit` - Read and update permissions
- `full` - Complete CRUD operations

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
  - 4-tier role-based access control (Super Admin, Admin, Manager, User)
  - Admin-controlled user creation and management
  - Secure password hashing and session management

- **🆕 Advanced Permission Management System**
  - **Customizable Permission Matrix**: Edit any role-page access combination
  - **Visual Permissions Table**: Interactive tabular view with color-coded access levels
  - **Real-time Permission Updates**: Changes saved to PostgreSQL database instantly
  - **Quick Actions**: Bulk permission changes and default resets
  - **Granular Access Control**: 4 access levels (None, View, Edit, Full) for each page
  - **Super Admin Controls**: Only Super Admins can modify system permissions
  - **Database Persistence**: Custom permissions survive server restarts and Git changes
  - **Audit Trail**: Track who made permission changes and when

- **Inventory Management**
  - Complete jewelry item CRUD operations with role-based restrictions
  - Material tracking and cost calculations
  - Category and subcategory management
  - Advanced search and filtering with permission-based access
  - Bulk upload capabilities for authorized users

- **Material Management** 🆕
  - Comprehensive material library with full CRUD operations
  - Cost and sale price tracking with proper validation
  - Unit-based measurements (gram, carat, piece, etc.)
  - Material categories (Gold, Diamond, Stone, Silver, Platinum)
  - Real-time markup calculations and profitability analysis
  - Advanced search and filtering by category
  - Data integrity with proper field validation
  - Optimized API with camelCase/snake_case compatibility

- **Vendor Management**
  - Vendor contact information with role-based access
  - Vendor performance tracking
  - Purchase history management with permission controls

- **Database Integration**
  - PostgreSQL database setup with proper schema
  - Complete database relationships and constraints
  - Custom permissions table for granular access control
  - Database seeding scripts and migration capabilities
  - Connection pooling and error handling
  - Data type validation and conversion

- **UI/UX**
  - Modern, responsive design with Tailwind CSS
  - Intuitive navigation with role-based menu visibility
  - Real-time dashboard with analytics
  - Mobile-responsive layout
  - Error handling with user-friendly messages
  - **Interactive Permission Matrix**: Editable table with dropdown selectors

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

**Current Version**: v1.2.0-beta

**Last Updated**: August 18, 2025

### 🆕 Recent Updates (v1.2.0-beta)
- **🔐 Complete Permission Management System**
  - Interactive permission matrix with real-time editing
  - 4-tier role hierarchy with customizable access levels
  - Database-persisted custom permissions with audit trails
  - Visual permission table showing 14 system pages vs 4 user roles
  - Quick actions for bulk permission changes
  - Super Admin controls for system-wide permission management

- **🛡️ Enhanced Security & Access Control**
  - Granular permission checking at component and API levels
  - Role-based UI rendering with dynamic menu visibility
  - Secure permission API endpoints with proper authentication
  - Custom permission overrides with database persistence

- **📊 System Pages Coverage**
  - **Core Pages**: Dashboard with role-specific widgets
  - **Admin Tools**: User Management, User Permissions, Material/Category/Vendor Management
  - **Inventory**: View/Add/Edit Inventory with permission-based access
  - **Billing**: Indian/US billing formats with role restrictions
  - **Reports**: Available Stock, Vendor Stock with access controls
  - **Utilities**: Dollar Rate, Data Sync with admin-only access

- **🎨 UI/UX Improvements**
  - "User Permissions" renamed and integrated throughout interface
  - Color-coded permission levels (Green=Full, Blue=Edit, Gray=View, Red=None)
  - Interactive dropdowns for permission editing
  - Real-time statistics showing accessible pages per role
  - Enhanced visual feedback and loading states

- **🗄️ Database Enhancements**
  - New `custom_permissions` table with proper indexing
  - Permission change audit trails with user tracking
  - Optimized queries for role-based data filtering
  - Database migration scripts for permission system

### Previous Updates (v1.0.0-beta)
- **Materials Management Complete Implementation**
  - Fixed API endpoints with full CRUD operations
  - Resolved cost price and sale price data persistence issues
  - Added proper data type conversion (string to number)
  - Implemented camelCase/snake_case field compatibility
  - Enhanced error handling and validation
  - Added null safety checks to prevent UI errors
  - Improved search and filtering capabilities

---

*Built with ❤️ for the jewelry industry*