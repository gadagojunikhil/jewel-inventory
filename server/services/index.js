// Service Layer - Centralized service exports
const BaseService = require('./BaseService');
const UserService = require('./UserService');
const JewelryService = require('./JewelryService');
const EstimateService = require('./EstimateService');

// Import additional services as they're created
// const CategoryService = require('./CategoryService');
// const MaterialService = require('./MaterialService');
// const VendorService = require('./VendorService');

// Create service instances
const userService = new UserService();
const jewelryService = new JewelryService();
const estimateService = new EstimateService();

module.exports = {
  BaseService,
  UserService,
  JewelryService,
  EstimateService,
  
  // Service instances for easy access
  userService,
  jewelryService,
  estimateService
};
