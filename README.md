# Jewel Inventory Management System

Jewel Inventory Management System

A comprehensive jewelry inventory management application built with React and Node.js/Express, designed for efficient tracking and management of jewelry business operations. All data is now fully synced with the backend API—no local storage is used for inventory, materials, categories, or vendors.

## 🌟 Features


### Core Functionality
- **💎 Inventory Management**
  - Add, edit, and delete jewelry items (CRUD via backend API)
  - Track stock levels and availability
  - Bulk upload capability for inventory items (CSV/Excel)
  - Detailed item information (weight, purity, gemstones, etc.)

- **📁 Category Management**
  - Organize items by categories and subcategories
  - Admin panel for category configuration
  - Hierarchical category structure

- **👤 Vendor & User Management**
  - Manage vendor information (name, contact, email)
  - Add, view, and update vendors from the Admin panel
  - User management (roles, permissions planned)

- **💰 Sales & Transactions**
  - Track sales and purchases
  - Customer order management
  - Invoice generation
  - Payment tracking

- **📊 Analytics & Reporting**
  - Dashboard with key metrics
  - Sales analytics and trends
  - Inventory valuation reports
  - Custom report generation

- **🔍 Search & Filter**
  - Advanced search functionality
  - Multi-parameter filtering
  - Quick search by SKU/barcode
  - Category-based browsing

### Backend Sync
- All CRUD operations for inventory, materials, categories, vendors, and users are handled via backend API endpoints.
- No localStorage is used for persistent data—your app is always in sync with the backend database.

## 🛠️ Technology Stack


### Frontend
- **React 18.x** - UI library for building user interfaces
- **React Router** - Client-side routing
- **JavaScript ES6+** - Modern JavaScript features
- **Tailwind CSS** - Utility-first CSS framework
- **HTML5** - Semantic markup

### Backend
- **Node.js & Express** - RESTful API server
- **PostgreSQL** - Relational database for inventory, vendors, categories, materials, users, and more

### State Management & Storage
- **React Hooks** - State management (useState, useEffect, useContext)
- **Backend API** - All inventory, vendor, category, material, and user data is synced with the backend

### Development Tools
- **Node.js & npm** - Package management and build tools
- **Create React App** - React application scaffolding
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📂 Project Structure

```
├── public/
│   ├── index.html                 # HTML entry point
│   ├── favicon.ico               # Application icon
│   └── manifest.json             # PWA manifest
├── src/
│   ├── App.js                    # Main React component
│   ├── App.css                   # Global styles
│   ├── index.js                  # React DOM rendering
│   ├── index.css                 # Base styles
│   ├── components/
│   │   ├── admin/
│   │   │   ├── CategoryManagement.js    # Category CRUD operations
│   │   │   ├── MaterialManagement.js    # Material CRUD operations
│   │   │   ├── UserManagement.js        # User administration (now includes Vendor Management)
│   │   │   ├── VendorManagement.js      # Vendor CRUD operations (Admin panel)
│   │   ├── inventory/
│   │   │   ├── UploadInventory.js       # Bulk upload functionality
│   │   │   ├── InventoryList.js         # Item listing
│   │   │   ├── InventoryForm.js         # Add/Edit items
│   │   │   └── InventoryDetail.js       # Item details view
│   │   ├── dashboard/
│   │   │   ├── Dashboard.js             # Main dashboard
│   │   │   ├── Analytics.js             # Analytics charts
│   │   │   └── QuickStats.js            # Summary cards
│   │   ├── sales/
│   │   │   ├── SalesForm.js             # Create sales
│   │   │   ├── SalesList.js             # Sales history
│   │   │   └── Invoice.js               # Invoice generation
│   │   └── common/
│   │       ├── Header.js                # Navigation header
│   │       ├── Sidebar.js               # Side navigation
│   │       ├── Footer.js                # Footer component
│   │       └── LoadingSpinner.js        # Loading indicator
```
│   │   ├── api.js                       # API service layer
│   │   ├── storage.js                   # Local storage utilities
│   │   └── validation.js                # Form validation
│   ├── utils/
│   │   ├── constants.js                 # Application constants
│   │   ├── helpers.js                   # Helper functions
│   │   └── formatters.js                # Data formatters
│   └── styles/
│       ├── variables.css                # CSS variables
│       └── components/                  # Component-specific styles
├── package.json                  # Project dependencies
├── package-lock.json            # Dependency lock file
├── .gitignore                   # Git ignore rules
├── .env.example                 # Environment variables template
└── README.md                    # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher) or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gadagojunikhil/jewel-inventory.git
   cd jewel-inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
```

This creates an optimized production build in the `build/` directory.

## 💻 Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (use with caution)

### Code Style

This project uses:
- ESLint for code linting
- Prettier for code formatting
- EditorConfig for consistent coding styles

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📈 Development Roadmap

### Completed ✅
- Basic inventory management (with backend sync)
- Category management system
- Vendor management (Admin panel)
- Dashboard interface
- Inventory upload functionality

### In Progress 🚧
- Advanced reporting features
- Multi-user support with role-based access
- Real-time inventory tracking
- Mobile responsive design optimization
- Full backend CRUD for all admin modules

### Planned 📋
- **Backend Enhancements**
  - Authentication & authorization
  - More robust vendor/user management
  - Purchase order management
  - Multi-location inventory
  - Price history tracking

- **Advanced Features**
  - Barcode/QR code scanning
  - Image upload for items
  - Export to Excel/PDF
  - Email notifications
  - Supplier management

- **Mobile Application**
  - React Native mobile app
  - Offline capability
  - Push notifications

## 🌐 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer (Not Supported)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support, email gadagojunikhil@gmail.com or create an issue in the GitHub repository.

## 👏 Acknowledgments

- React team for the amazing framework
- Open source community for various libraries used
- Contributors and testers

---

**Project Status**: 🟢 Active Development

Last Updated: August 2025