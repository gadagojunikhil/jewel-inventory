const BaseService = require('./BaseService');
const EstimateModel = require('../models/EstimateModel');

class EstimateService extends BaseService {
  constructor() {
    super(EstimateModel);
  }

  async create(estimateData, userId) {
    try {
      // Validate estimate data
      this.validateEstimateData(estimateData);

      // Generate estimate number based on currency
      const estimateNumber = await this.generateEstimateNumber(estimateData.currency);
      
      const dataToCreate = {
        ...estimateData,
        estimate_number: estimateNumber,
        created_by: userId,
        status: estimateData.status || 'draft'
      };

      // Process stone details if provided
      if (estimateData.stone_details && typeof estimateData.stone_details === 'object') {
        dataToCreate.stone_details = JSON.stringify(estimateData.stone_details);
      }

      const estimate = await this.model.create(dataToCreate);
      
      return {
        success: true,
        message: 'Estimate created successfully',
        data: estimate
      };
    } catch (error) {
      console.error('EstimateService.create error:', error);
      throw error;
    }
  }

  async findAll(filters = {}) {
    try {
      const { page = 1, limit = 50, currency, status, customer, ...otherFilters } = filters;
      
      let whereConditions = [];
      let params = [];
      let paramCount = 0;

      // Add filter conditions
      if (currency) {
        paramCount++;
        whereConditions.push(`e.currency = $${paramCount}`);
        params.push(currency);
      }

      if (status) {
        paramCount++;
        whereConditions.push(`e.status = $${paramCount}`);
        params.push(status);
      }

      if (customer) {
        paramCount++;
        whereConditions.push(`(e.customer_name ILIKE $${paramCount} OR e.customer_phone ILIKE $${paramCount})`);
        params.push(`%${customer}%`);
      }

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1';
      
      // Get estimates with joins
      const query = `
        SELECT e.*, c.name as category_name, u.username as created_by_username
        FROM estimates e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN users u ON e.created_by = u.id
        WHERE ${whereClause}
        ORDER BY e.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      
      const offset = (page - 1) * limit;
      params.push(limit, offset);

      const estimates = await this.model.executeQuery(query, params);

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) FROM estimates e WHERE ${whereClause}`;
      const countParams = params.slice(0, paramCount);
      const countResult = await this.model.executeQuery(countQuery, countParams);
      const totalCount = parseInt(countResult[0].count);

      return {
        success: true,
        data: estimates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('EstimateService.findAll error:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const query = `
        SELECT e.*, c.name as category_name, u.username as created_by_username
        FROM estimates e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.id = $1
      `;
      
      const results = await this.model.executeQuery(query, [id]);
      
      if (results.length === 0) {
        throw new Error('Estimate not found');
      }

      return {
        success: true,
        data: results[0]
      };
    } catch (error) {
      console.error('EstimateService.findById error:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      // Validate update data
      this.validateEstimateData(updateData, false);

      // Remove fields that shouldn't be updated
      const filteredData = { ...updateData };
      delete filteredData.id;
      delete filteredData.estimate_number;
      delete filteredData.created_by;
      delete filteredData.created_at;

      // Process stone details if provided
      if (filteredData.stone_details && typeof filteredData.stone_details === 'object') {
        filteredData.stone_details = JSON.stringify(filteredData.stone_details);
      }

      const estimate = await this.model.update(id, filteredData);
      
      return {
        success: true,
        message: 'Estimate updated successfully',
        data: estimate
      };
    } catch (error) {
      console.error('EstimateService.update error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.model.delete(id);
      
      return {
        success: true,
        message: 'Estimate deleted successfully'
      };
    } catch (error) {
      console.error('EstimateService.delete error:', error);
      throw error;
    }
  }

  async convertToSale(id) {
    try {
      const estimate = await this.model.update(id, { 
        status: 'converted',
        updated_at: new Date()
      });
      
      return {
        success: true,
        message: 'Estimate marked as converted',
        data: estimate
      };
    } catch (error) {
      console.error('EstimateService.convertToSale error:', error);
      throw error;
    }
  }

  async searchByCustomer(searchTerm) {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return {
          success: true,
          data: []
        };
      }

      const query = `
        SELECT id, estimate_number, customer_name, customer_phone, 
               currency, grand_total, estimate_date, status
        FROM estimates 
        WHERE (customer_name ILIKE $1 OR customer_phone ILIKE $1) 
              AND status = 'active'
        ORDER BY created_at DESC 
        LIMIT 10
      `;
      
      const estimates = await this.model.executeQuery(query, [`%${searchTerm}%`]);
      
      return {
        success: true,
        data: estimates
      };
    } catch (error) {
      console.error('EstimateService.searchByCustomer error:', error);
      throw error;
    }
  }

  async getStatistics(filters = {}) {
    try {
      const { startDate, endDate, currency } = filters;
      
      let whereConditions = ['1=1'];
      let params = [];
      let paramCount = 0;

      if (startDate) {
        paramCount++;
        whereConditions.push(`created_at >= $${paramCount}`);
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        whereConditions.push(`created_at <= $${paramCount}`);
        params.push(endDate);
      }

      if (currency) {
        paramCount++;
        whereConditions.push(`currency = $${paramCount}`);
        params.push(currency);
      }

      const whereClause = whereConditions.join(' AND ');

      const statsQuery = `
        SELECT 
          COUNT(*) as total_estimates,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_estimates,
          COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_estimates,
          COALESCE(SUM(grand_total), 0) as total_value,
          COALESCE(AVG(grand_total), 0) as average_value,
          currency
        FROM estimates 
        WHERE ${whereClause}
        GROUP BY currency
      `;

      const stats = await this.model.executeQuery(statsQuery, params);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('EstimateService.getStatistics error:', error);
      throw error;
    }
  }

  validateEstimateData(data, isCreate = true) {
    const errors = [];

    if (isCreate) {
      if (!data.customer_name || data.customer_name.trim() === '') {
        errors.push('Customer name is required');
      }

      if (!data.jewelry_name || data.jewelry_name.trim() === '') {
        errors.push('Jewelry name is required');
      }

      if (!data.currency || !['INR', 'USD'].includes(data.currency)) {
        errors.push('Valid currency (INR or USD) is required');
      }
    }

    // Validate numeric fields if provided
    const numericFields = [
      'gold_purity', 'gross_weight', 'net_weight', 'fine_weight',
      'gold_rate', 'gold_price', 'gold_value', 'wastage_percent',
      'wastage_amount', 'making_charge_per_gram', 'making_amount',
      'total_gold_amount', 'stone_total', 'diamond_carats',
      'certification_charges', 'usd_to_inr_rate', 'tax_rate',
      'tax_amount', 'subtotal', 'grand_total', 'grand_total_inr', 'grand_total_usd'
    ];

    numericFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        const value = parseFloat(data[field]);
        if (isNaN(value) || value < 0) {
          errors.push(`${field.replace(/_/g, ' ')} must be a valid positive number`);
        }
      }
    });

    // Validate email format if provided
    if (data.customer_email && data.customer_email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.customer_email)) {
        errors.push('Invalid email format');
      }
    }

    // Validate phone format if provided
    if (data.customer_phone && data.customer_phone.trim() !== '') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(data.customer_phone.replace(/\s/g, ''))) {
        errors.push('Invalid phone number format');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  async generateEstimateNumber(currency) {
    try {
      const query = 'SELECT generate_estimate_number($1) as estimate_number';
      const result = await this.model.executeQuery(query, [currency]);
      return result[0].estimate_number;
    } catch (error) {
      // Fallback if function doesn't exist
      const prefix = currency === 'USD' ? 'EST-USD-' : 'EST-INR-';
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${prefix}${timestamp}-${random}`;
    }
  }
}

module.exports = EstimateService;
