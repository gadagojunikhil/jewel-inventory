// Database Models - Centralized model exports
const BaseModel = require('./BaseModel');
const UserModel = require('./UserModel');
const CategoryModel = require('./CategoryModel');
const MaterialModel = require('./MaterialModel');
const VendorModel = require('./VendorModel');
const JewelryModel = require('./JewelryModel');
const EstimateModel = require('./EstimateModel');

// Create model instances
const userModel = new UserModel();
const categoryModel = new CategoryModel();
const materialModel = new MaterialModel();
const vendorModel = new VendorModel();
const jewelryModel = new JewelryModel();
const estimateModel = new EstimateModel();

module.exports = {
  BaseModel,
  UserModel,
  CategoryModel,
  MaterialModel,
  VendorModel,
  JewelryModel,
  EstimateModel,
  
  // Model instances for easy access
  userModel,
  categoryModel,
  materialModel,
  vendorModel,
  jewelryModel,
  estimateModel
};