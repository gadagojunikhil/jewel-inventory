const pool = require('../config/database');

// Get all materials
const getAllMaterials = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        category,
        name,
        code,
        cost_price,
        sale_price,
        unit,
        stock_quantity,
        is_active,
        created_at,
        updated_at
      FROM materials 
      WHERE is_active = true
      ORDER BY category, name
    `;
    
    const result = await pool.query(query);
    
    // Convert string values to numbers and handle nulls
    const materials = result.rows.map(material => ({
      ...material,
      costPrice: parseFloat(material.cost_price) || 0,
      salePrice: parseFloat(material.sale_price) || 0,
      stockQuantity: parseFloat(material.stock_quantity) || 0,
      // Remove snake_case fields and keep camelCase
      cost_price: undefined,
      sale_price: undefined,
      stock_quantity: undefined
    }));
    
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ 
      error: 'Failed to fetch materials',
      details: error.message 
    });
  }
};

// Get material by ID
const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        id,
        category,
        name,
        code,
        cost_price,
        sale_price,
        unit,
        stock_quantity,
        is_active,
        created_at,
        updated_at
      FROM materials 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    const material = result.rows[0];
    const formattedMaterial = {
      ...material,
      costPrice: parseFloat(material.cost_price) || 0,
      salePrice: parseFloat(material.sale_price) || 0,
      stockQuantity: parseFloat(material.stock_quantity) || 0,
      // Remove snake_case fields
      cost_price: undefined,
      sale_price: undefined,
      stock_quantity: undefined
    };
    
    res.json(formattedMaterial);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ 
      error: 'Failed to fetch material',
      details: error.message 
    });
  }
};

// Create new material
const createMaterial = async (req, res) => {
  try {
    const {
      category,
      name,
      code,
      cost_price,
      sale_price,
      costPrice,    // Accept camelCase from frontend
      salePrice,    // Accept camelCase from frontend
      unit,
      stock_quantity,
      stockQuantity // Accept camelCase from frontend
    } = req.body;

    // Validate required fields
    if (!category || !name || !code) {
      return res.status(400).json({ 
        error: 'Category, name, and code are required' 
      });
    }

    // Use camelCase values if available, otherwise fall back to snake_case
    const finalCostPrice = costPrice ?? cost_price ?? 0;
    const finalSalePrice = salePrice ?? sale_price ?? 0;
    const finalStockQuantity = stockQuantity ?? stock_quantity ?? 0;

    const query = `
      INSERT INTO materials (
        category, name, code, cost_price, sale_price, unit, stock_quantity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      category,
      name,
      code,
      finalCostPrice,
      finalSalePrice,
      unit || 'pcs',
      finalStockQuantity
    ];
    
    const result = await pool.query(query, values);
    const material = result.rows[0];
    
    const formattedMaterial = {
      ...material,
      costPrice: parseFloat(material.cost_price) || 0,
      salePrice: parseFloat(material.sale_price) || 0,
      stockQuantity: parseFloat(material.stock_quantity) || 0,
      // Remove snake_case fields
      cost_price: undefined,
      sale_price: undefined,
      stock_quantity: undefined
    };
    
    res.status(201).json(formattedMaterial);
  } catch (error) {
    console.error('Error creating material:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Material code already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create material',
      details: error.message 
    });
  }
};

// Update material
const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      name,
      code,
      cost_price,
      sale_price,
      costPrice,    // Accept camelCase from frontend
      salePrice,    // Accept camelCase from frontend
      unit,
      stock_quantity,
      stockQuantity // Accept camelCase from frontend
    } = req.body;

    // Use camelCase values if available, otherwise fall back to snake_case
    const finalCostPrice = costPrice ?? cost_price;
    const finalSalePrice = salePrice ?? sale_price;
    const finalStockQuantity = stockQuantity ?? stock_quantity;

    const query = `
      UPDATE materials 
      SET 
        category = COALESCE($1, category),
        name = COALESCE($2, name),
        code = COALESCE($3, code),
        cost_price = COALESCE($4, cost_price),
        sale_price = COALESCE($5, sale_price),
        unit = COALESCE($6, unit),
        stock_quantity = COALESCE($7, stock_quantity),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND is_active = true
      RETURNING *
    `;
    
    const values = [
      category,
      name,
      code,
      finalCostPrice,
      finalSalePrice,
      unit,
      finalStockQuantity,
      id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    const material = result.rows[0];
    const formattedMaterial = {
      ...material,
      costPrice: parseFloat(material.cost_price) || 0,
      salePrice: parseFloat(material.sale_price) || 0,
      stockQuantity: parseFloat(material.stock_quantity) || 0,
      // Remove snake_case fields
      cost_price: undefined,
      sale_price: undefined,
      stock_quantity: undefined
    };
    
    res.json(formattedMaterial);
  } catch (error) {
    console.error('Error updating material:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Material code already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update material',
      details: error.message 
    });
  }
};

// Delete material (soft delete)
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE materials 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id, name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    res.json({ 
      message: 'Material deleted successfully',
      material: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ 
      error: 'Failed to delete material',
      details: error.message 
    });
  }
};

// Get materials by category
const getMaterialsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const query = `
      SELECT 
        id,
        category,
        name,
        code,
        cost_price,
        sale_price,
        unit,
        stock_quantity,
        is_active,
        created_at,
        updated_at
      FROM materials 
      WHERE category = $1 AND is_active = true
      ORDER BY name
    `;
    
    const result = await pool.query(query, [category]);
    
    // Convert string values to numbers and handle nulls
    const materials = result.rows.map(material => ({
      ...material,
      costPrice: parseFloat(material.cost_price) || 0,
      salePrice: parseFloat(material.sale_price) || 0,
      stockQuantity: parseFloat(material.stock_quantity) || 0,
      // Remove snake_case fields
      cost_price: undefined,
      sale_price: undefined,
      stock_quantity: undefined
    }));
    
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials by category:', error);
    res.status(500).json({ 
      error: 'Failed to fetch materials by category',
      details: error.message 
    });
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialsByCategory
};