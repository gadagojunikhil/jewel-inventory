const pool = require('../config/database');

// Get all vendors
const getAllVendors = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        name,
        company,
        email,
        phone,
        address,
        city,
        state,
        country,
        postal_code,
        contact_person,
        website,
        gst_number,
        payment_terms,
        credit_limit,
        notes,
        rating,
        is_active,
        created_at,
        updated_at
      FROM vendors 
      WHERE is_active = true
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    
    // Convert string values to numbers and handle nulls
    const vendors = result.rows.map(vendor => ({
      ...vendor,
      creditLimit: parseFloat(vendor.credit_limit) || 0,
      rating: parseInt(vendor.rating) || 0,
      // Remove snake_case fields and keep camelCase
      credit_limit: undefined,
      postal_code: vendor.postal_code,
      contact_person: vendor.contact_person,
      gst_number: vendor.gst_number,
      payment_terms: vendor.payment_terms,
      is_active: vendor.is_active,
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    }));
    
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vendors',
      details: error.message 
    });
  }
};

// Get vendor by ID
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        id,
        name,
        company,
        email,
        phone,
        address,
        city,
        state,
        country,
        postal_code,
        contact_person,
        website,
        gst_number,
        payment_terms,
        credit_limit,
        notes,
        rating,
        is_active,
        created_at,
        updated_at
      FROM vendors 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const vendor = result.rows[0];
    const formattedVendor = {
      ...vendor,
      creditLimit: parseFloat(vendor.credit_limit) || 0,
      rating: parseInt(vendor.rating) || 0,
      // Keep snake_case fields for database compatibility
      postalCode: vendor.postal_code,
      contactPerson: vendor.contact_person,
      gstNumber: vendor.gst_number,
      paymentTerms: vendor.payment_terms
    };
    
    res.json(formattedVendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vendor',
      details: error.message 
    });
  }
};

// Create new vendor
const createVendor = async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      postalCode,
      contact_person,
      contactPerson,
      website,
      gst_number,
      gstNumber,
      payment_terms,
      paymentTerms,
      credit_limit,
      creditLimit,
      notes,
      rating
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        error: 'Vendor name is required' 
      });
    }

    // Use camelCase values if available, otherwise fall back to snake_case
    const finalPostalCode = postalCode ?? postal_code;
    const finalContactPerson = contactPerson ?? contact_person;
    const finalGstNumber = gstNumber ?? gst_number;
    const finalPaymentTerms = paymentTerms ?? payment_terms;
    const finalCreditLimit = creditLimit ?? credit_limit ?? 0;

    const query = `
      INSERT INTO vendors (
        name, company, email, phone, address, city, state, country,
        postal_code, contact_person, website, gst_number, payment_terms,
        credit_limit, notes, rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const values = [
      name,
      company || null,
      email || null,
      phone || null,
      address || null,
      city || null,
      state || null,
      country || 'India',
      finalPostalCode || null,
      finalContactPerson || null,
      website || null,
      finalGstNumber || null,
      finalPaymentTerms || null,
      finalCreditLimit,
      notes || null,
      rating || 0
    ];
    
    const result = await pool.query(query, values);
    const vendor = result.rows[0];
    
    const formattedVendor = {
      ...vendor,
      creditLimit: parseFloat(vendor.credit_limit) || 0,
      rating: parseInt(vendor.rating) || 0,
      postalCode: vendor.postal_code,
      contactPerson: vendor.contact_person,
      gstNumber: vendor.gst_number,
      paymentTerms: vendor.payment_terms,
      // Remove snake_case fields
      credit_limit: undefined,
      postal_code: undefined,
      contact_person: undefined,
      gst_number: undefined,
      payment_terms: undefined
    };
    
    res.status(201).json(formattedVendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Vendor with this email already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create vendor',
      details: error.message 
    });
  }
};

// Update vendor
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      company,
      email,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      postalCode,
      contact_person,
      contactPerson,
      website,
      gst_number,
      gstNumber,
      payment_terms,
      paymentTerms,
      credit_limit,
      creditLimit,
      notes,
      rating
    } = req.body;

    // Use camelCase values if available, otherwise fall back to snake_case
    const finalPostalCode = postalCode ?? postal_code;
    const finalContactPerson = contactPerson ?? contact_person;
    const finalGstNumber = gstNumber ?? gst_number;
    const finalPaymentTerms = paymentTerms ?? payment_terms;
    const finalCreditLimit = creditLimit ?? credit_limit;

    const query = `
      UPDATE vendors 
      SET 
        name = COALESCE($1, name),
        company = COALESCE($2, company),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        state = COALESCE($7, state),
        country = COALESCE($8, country),
        postal_code = COALESCE($9, postal_code),
        contact_person = COALESCE($10, contact_person),
        website = COALESCE($11, website),
        gst_number = COALESCE($12, gst_number),
        payment_terms = COALESCE($13, payment_terms),
        credit_limit = COALESCE($14, credit_limit),
        notes = COALESCE($15, notes),
        rating = COALESCE($16, rating),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $17 AND is_active = true
      RETURNING *
    `;
    
    const values = [
      name,
      company,
      email,
      phone,
      address,
      city,
      state,
      country,
      finalPostalCode,
      finalContactPerson,
      website,
      finalGstNumber,
      finalPaymentTerms,
      finalCreditLimit,
      notes,
      rating,
      id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const vendor = result.rows[0];
    const formattedVendor = {
      ...vendor,
      creditLimit: parseFloat(vendor.credit_limit) || 0,
      rating: parseInt(vendor.rating) || 0,
      postalCode: vendor.postal_code,
      contactPerson: vendor.contact_person,
      gstNumber: vendor.gst_number,
      paymentTerms: vendor.payment_terms,
      // Remove snake_case fields
      credit_limit: undefined,
      postal_code: undefined,
      contact_person: undefined,
      gst_number: undefined,
      payment_terms: undefined
    };
    
    res.json(formattedVendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Vendor with this email already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update vendor',
      details: error.message 
    });
  }
};

// Delete vendor (soft delete)
const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE vendors 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id, name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json({ 
      message: 'Vendor deleted successfully',
      vendor: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ 
      error: 'Failed to delete vendor',
      details: error.message 
    });
  }
};

// Get vendor statistics
const getVendorStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        v.id,
        v.name,
        COUNT(jp.id) as total_items,
        SUM(jp.total_cost) as total_purchase_value,
        AVG(jp.total_cost) as avg_item_cost,
        MAX(jp.created_at) as last_purchase_date
      FROM vendors v
      LEFT JOIN jewelry_pieces jp ON v.id = jp.vendor_id
      WHERE v.id = $1 AND v.is_active = true
      GROUP BY v.id, v.name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const stats = result.rows[0];
    const formattedStats = {
      ...stats,
      totalItems: parseInt(stats.total_items) || 0,
      totalPurchaseValue: parseFloat(stats.total_purchase_value) || 0,
      avgItemCost: parseFloat(stats.avg_item_cost) || 0,
      lastPurchaseDate: stats.last_purchase_date
    };
    
    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vendor statistics',
      details: error.message 
    });
  }
};

module.exports = {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorStats
};
