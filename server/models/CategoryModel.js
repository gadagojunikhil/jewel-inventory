const BaseModel = require('./BaseModel');

/**
 * Category Model - Handles all category-related database operations
 */
class CategoryModel extends BaseModel {
  constructor() {
    super('categories');
  }

  /**
   * Find category by code
   * @param {String} code - Category code
   * @returns {Promise<Object|null>} Category record or null
   */
  async findByCode(code) {
    return this.findOne({ code });
  }

  /**
   * Find all categories with subcategories
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of categories with subcategories
   */
  async findAllWithSubcategories(options = {}) {
    const { where = { is_active: true }, orderBy = { name: 'ASC' } } = options;

    // First get parent categories
    const parentCategories = await this.findAll({
      where: { ...where, type: 'parent' },
      orderBy
    });

    // Then get subcategories for each parent
    for (const parent of parentCategories) {
      parent.subcategories = await this.findAll({
        where: { parent_id: parent.id, is_active: true },
        orderBy: { name: 'ASC' }
      });
    }

    return parentCategories;
  }

  /**
   * Find all categories in a flat structure with parent info
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of categories with parent information
   */
  async findAllWithParent(options = {}) {
    const {
      where = { 'c.is_active': true },
      orderBy = { 'c.name': 'ASC' },
      limit,
      offset
    } = options;

    let query = `
      SELECT 
        c.*,
        p.name as parent_name,
        p.code as parent_code
      FROM ${this.tableName} c
      LEFT JOIN categories p ON c.parent_id = p.id
    `;

    const params = [];
    let paramIndex = 1;

    // Build WHERE clause
    const whereConditions = [];
    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined && value !== null) {
        whereConditions.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Build ORDER BY clause
    if (Object.keys(orderBy).length > 0) {
      const orderClauses = Object.entries(orderBy)
        .map(([column, direction]) => `${column} ${direction.toUpperCase()}`)
        .join(', ');
      query += ` ORDER BY ${orderClauses}`;
    }

    // Add LIMIT and OFFSET
    if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(limit);
    }
    if (offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(offset);
    }

    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * Find parent categories only
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of parent categories
   */
  async findParentCategories(options = {}) {
    return this.findAll({
      where: { type: 'parent', is_active: true, ...options.where },
      orderBy: { name: 'ASC', ...options.orderBy }
    });
  }

  /**
   * Find subcategories by parent ID
   * @param {Number} parentId - Parent category ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of subcategories
   */
  async findSubcategories(parentId, options = {}) {
    return this.findAll({
      where: { parent_id: parentId, is_active: true, ...options.where },
      orderBy: { name: 'ASC', ...options.orderBy }
    });
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async create(categoryData) {
    // If creating a subcategory, validate parent exists
    if (categoryData.parent_id) {
      const parent = await this.findById(categoryData.parent_id);
      if (!parent) {
        throw new Error('Parent category not found');
      }
      if (parent.type !== 'parent') {
        throw new Error('Parent category must be of type "parent"');
      }
      categoryData.type = 'child';
    } else {
      categoryData.type = 'parent';
    }

    return super.create(categoryData);
  }

  /**
   * Update category with validation
   * @param {Number} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object|null>} Updated category
   */
  async update(id, categoryData) {
    // If updating parent_id, validate parent exists
    if (categoryData.parent_id) {
      const parent = await this.findById(categoryData.parent_id);
      if (!parent) {
        throw new Error('Parent category not found');
      }
      if (parent.type !== 'parent') {
        throw new Error('Parent category must be of type "parent"');
      }
      // Prevent circular references
      if (parent.id === id) {
        throw new Error('Category cannot be its own parent');
      }
      categoryData.type = 'child';
    } else if (categoryData.parent_id === null) {
      categoryData.type = 'parent';
    }

    return super.update(id, categoryData);
  }

  /**
   * Delete category with subcategory handling
   * @param {Number} id - Category ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    // Check if category has subcategories
    const subcategories = await this.findSubcategories(id);
    if (subcategories.length > 0) {
      throw new Error('Cannot delete category with subcategories. Delete subcategories first.');
    }

    // Check if category is used in jewelry pieces
    const jewelryCount = await this.getJewelryCount(id);
    if (jewelryCount > 0) {
      throw new Error(`Cannot delete category. It is used in ${jewelryCount} jewelry pieces.`);
    }

    return super.delete(id);
  }

  /**
   * Soft delete category
   * @param {Number} id - Category ID
   * @returns {Promise<Object|null>} Updated category
   */
  async softDelete(id) {
    // Soft delete subcategories first
    const subcategories = await this.findSubcategories(id);
    for (const sub of subcategories) {
      await super.softDelete(sub.id);
    }

    return super.softDelete(id);
  }

  /**
   * Get count of jewelry pieces using this category
   * @param {Number} categoryId - Category ID
   * @returns {Promise<Number>} Count of jewelry pieces
   */
  async getJewelryCount(categoryId) {
    const query = `
      SELECT COUNT(*) as count 
      FROM jewelry_pieces 
      WHERE category_id = $1
    `;
    const result = await this.query(query, [categoryId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get category statistics
   * @returns {Promise<Object>} Category statistics
   */
  async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_categories,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_categories,
        COUNT(CASE WHEN type = 'parent' THEN 1 END) as parent_categories,
        COUNT(CASE WHEN type = 'child' THEN 1 END) as child_categories,
        COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as created_last_30_days
      FROM ${this.tableName}
    `;
    
    const result = await this.query(query);
    return result.rows[0];
  }

  /**
   * Search categories by name, code, or description
   * @param {String} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of matching categories
   */
  async search(searchTerm, options = {}) {
    const { limit = 50, offset = 0, includeInactive = false } = options;
    
    let query = `
      SELECT 
        c.*,
        p.name as parent_name
      FROM ${this.tableName} c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE 
        (c.name ILIKE $1 OR 
         c.code ILIKE $1 OR 
         c.description ILIKE $1)
    `;

    const params = [`%${searchTerm}%`];
    let paramIndex = 2;

    if (!includeInactive) {
      query += ` AND c.is_active = $${paramIndex++}`;
      params.push(true);
    }

    query += ` ORDER BY c.name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * Check if category code is available
   * @param {String} code - Category code
   * @param {Number} excludeId - Category ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if available, false if taken
   */
  async isCodeAvailable(code, excludeId = null) {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE code = $1`;
    const params = [code];
    
    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }
    
    const result = await this.query(query, params);
    return parseInt(result.rows[0].count) === 0;
  }

  /**
   * Get category hierarchy (parent with all descendants)
   * @param {Number} categoryId - Root category ID
   * @returns {Promise<Object>} Category with nested subcategories
   */
  async getCategoryHierarchy(categoryId) {
    const category = await this.findById(categoryId);
    if (!category) return null;

    const loadSubcategories = async (parent) => {
      const subcategories = await this.findSubcategories(parent.id);
      parent.subcategories = subcategories;
      
      // Recursively load subcategories for each child
      for (const sub of subcategories) {
        await loadSubcategories(sub);
      }
    };

    await loadSubcategories(category);
    return category;
  }
}

module.exports = CategoryModel;
