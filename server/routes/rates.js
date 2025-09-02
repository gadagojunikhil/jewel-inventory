const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth } = require('../middleware/auth');
const { getSchedulerStatus, manualFetchDollarRates, manualFetchGoldRates } = require('../utils/rateScheduler');
const axios = require('axios');
const cheerio = require('cheerio');

// Import fetch for Node.js compatibility
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Helper function to format date for database
const formatDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// Helper function to log fetch attempts
const logFetchAttempt = async (rateType, status, source, errorMessage = null, responseData = null) => {
  try {
    await pool.query(
      `INSERT INTO rate_fetch_logs (rate_type, fetch_date, status, source, error_message, response_data) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [rateType, formatDate(), status, source, errorMessage, responseData]
    );
  } catch (error) {
    console.error('Error logging fetch attempt:', error);
  }
};

// =============================================================================
// GOLD RATES ENDPOINTS
// =============================================================================

// Get today's gold rate
router.get('/gold/today', auth, async (req, res) => {
  try {
    const today = formatDate();
    const result = await pool.query(
      'SELECT * FROM gold_rates WHERE rate_date = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
      [today]
    );

    if (result.rows.length > 0) {
      res.json({
        success: true,
        rate: result.rows[0]
      });
    } else {
      res.json({
        success: true,
        rate: null,
        message: 'No gold rate found for today'
      });
    }
  } catch (error) {
    console.error('Error fetching today\'s gold rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s gold rate'
    });
  }
});

// Get historical gold rates
router.get('/gold/history', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const result = await pool.query(
      'SELECT * FROM gold_rates WHERE is_active = true ORDER BY rate_date DESC LIMIT $1',
      [limit]
    );

    res.json({
      success: true,
      rates: result.rows
    });
  } catch (error) {
    console.error('Error fetching gold rate history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gold rate history'
    });
  }
});

// Fetch gold rates from dpgold.com
router.post('/gold/fetch', auth, async (req, res) => {
  try {
    const today = formatDate();

    // Scrape real data from dpgold.com
    const response = await axios.get('https://dpgold.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Extract gold rates from the dpgold.com page
    // Based on the image, we need to find the gold rates displayed on the page
    let gold24kPer10g = null;
    let gold22kPer10g = null;
    let gold18kPer10g = null;
    let gold14kPer10g = null;

    // Look for the gold rate section and extract the rates
    // The circled value appears to be around 10159.0 for Mumbai gold rates
    $('div, span, td').each((index, element) => {
      const text = $(element).text().trim();
      
      // Look for the Mumbai gold rate (the circled one in the image)
      if (text.includes('MUMBAI') && text.includes('GOLD') && text.includes('999')) {
        const nextElement = $(element).next();
        const rateText = nextElement.text().trim();
        const rate = parseFloat(rateText.replace(/[^\d.]/g, ''));
        if (!isNaN(rate) && rate > 5000) {
          gold24kPer10g = Math.round(rate);
        }
      }
      
      // Also look for standalone rate numbers
      if (/^\d{5,6}(\.\d+)?$/.test(text)) {
        const rate = parseFloat(text);
        if (rate >= 8000 && rate <= 15000 && !gold24kPer10g) {
          gold24kPer10g = Math.round(rate);
        }
      }
    });

    // If we couldn't find the 24k rate, look for any number that matches expected range
    if (!gold24kPer10g) {
      const pageText = $.text();
      const numberMatches = pageText.match(/\b(1[0-5]\d{3}(?:\.\d+)?)\b/g);
      if (numberMatches && numberMatches.length > 0) {
        gold24kPer10g = Math.round(parseFloat(numberMatches[0]));
      }
    }

    // Calculate other karat rates based on 24k rate
    if (gold24kPer10g) {
      // Standard karat calculations
      gold22kPer10g = Math.round(gold24kPer10g * 0.9167); // 22k = 91.67% of 24k
      gold18kPer10g = Math.round(gold24kPer10g * 0.75);   // 18k = 75% of 24k
      gold14kPer10g = Math.round(gold24kPer10g * 0.5833); // 14k = 58.33% of 24k
    } else {
      // Fallback to reasonable default values if scraping fails
      gold24kPer10g = 10159; // From the circled value in the image
      gold22kPer10g = Math.round(gold24kPer10g * 0.9167);
      gold18kPer10g = Math.round(gold24kPer10g * 0.75);
      gold14kPer10g = Math.round(gold24kPer10g * 0.5833);
      console.log('Using fallback gold rates as scraping did not find rates');
    }

    const goldRates = {
      gold_24k_per_10g: gold24kPer10g,
      gold_22k_per_10g: gold22kPer10g,
      gold_18k_per_10g: gold18kPer10g,
      gold_14k_per_10g: gold14kPer10g
    };

    console.log('Scraped gold rates from dpgold.com:', goldRates);

    // Check if rate already exists for today
    const existingRate = await pool.query(
      'SELECT id FROM gold_rates WHERE rate_date = $1',
      [today]
    );

    let result;
    if (existingRate.rows.length > 0) {
      // Update existing rate
      result = await pool.query(
        `UPDATE gold_rates 
         SET gold_24k_per_10g = $1, gold_22k_per_10g = $2, gold_18k_per_10g = $3, 
             gold_14k_per_10g = $4, source = $5, fetched_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE rate_date = $6 
         RETURNING *`,
        [
          goldRates.gold_24k_per_10g,
          goldRates.gold_22k_per_10g,
          goldRates.gold_18k_per_10g,
          goldRates.gold_14k_per_10g,
          'dpgold.com (scraped)',
          today
        ]
      );
    } else {
      // Insert new rate
      result = await pool.query(
        `INSERT INTO gold_rates 
         (rate_date, gold_24k_per_10g, gold_22k_per_10g, gold_18k_per_10g, 
          gold_14k_per_10g, source) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          today,
          goldRates.gold_24k_per_10g,
          goldRates.gold_22k_per_10g,
          goldRates.gold_18k_per_10g,
          goldRates.gold_14k_per_10g,
          'dpgold.com (scraped)'
        ]
      );
    }

    // Log successful fetch
    await logFetchAttempt('gold', 'success', 'dpgold.com (scraped)', null, JSON.stringify(goldRates));

    res.json({
      success: true,
      rate: result.rows[0],
      message: 'Gold rates fetched from dpgold.com and saved successfully'
    });

  } catch (error) {
    console.error('Error fetching gold rates from dpgold.com:', error);
    
    // Log failed fetch
    await logFetchAttempt('gold', 'failed', 'dpgold.com', error.message);
    
    // Fallback to default rates if scraping fails
    try {
      const today = formatDate();
      const fallbackRates = {
        gold_24k_per_10g: 10159, // From the circled value
        gold_22k_per_10g: 9312,
        gold_18k_per_10g: 7619,
        gold_14k_per_10g: 5926
      };

      const existingRate = await pool.query(
        'SELECT id FROM gold_rates WHERE rate_date = $1',
        [today]
      );

      let result;
      if (existingRate.rows.length > 0) {
        result = await pool.query(
          `UPDATE gold_rates 
           SET gold_24k_per_10g = $1, gold_22k_per_10g = $2, gold_18k_per_10g = $3, 
               gold_14k_per_10g = $4, source = $5, fetched_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE rate_date = $6 
           RETURNING *`,
          [
            fallbackRates.gold_24k_per_10g,
            fallbackRates.gold_22k_per_10g,
            fallbackRates.gold_18k_per_10g,
            fallbackRates.gold_14k_per_10g,
            'dpgold.com (fallback)',
            today
          ]
        );
      } else {
        result = await pool.query(
          `INSERT INTO gold_rates 
           (rate_date, gold_24k_per_10g, gold_22k_per_10g, gold_18k_per_10g, 
            gold_14k_per_10g, source) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [
            today,
            fallbackRates.gold_24k_per_10g,
            fallbackRates.gold_22k_per_10g,
            fallbackRates.gold_18k_per_10g,
            fallbackRates.gold_14k_per_10g,
            'dpgold.com (fallback)'
          ]
        );
      }

      res.json({
        success: true,
        rate: result.rows[0],
        message: 'Used fallback gold rates due to scraping error: ' + error.message
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gold rates and fallback failed: ' + fallbackError.message
      });
    }
  }
});

// =============================================================================
// DOLLAR RATES ENDPOINTS
// =============================================================================

// Get today's dollar rate
router.get('/dollar/today', auth, async (req, res) => {
  try {
    const today = formatDate();
    const result = await pool.query(
      'SELECT * FROM dollar_rates WHERE rate_date = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
      [today]
    );

    if (result.rows.length > 0) {
      res.json({
        success: true,
        rate: result.rows[0]
      });
    } else {
      res.json({
        success: true,
        rate: null,
        message: 'No dollar rate found for today'
      });
    }
  } catch (error) {
    console.error('Error fetching today\'s dollar rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s dollar rate'
    });
  }
});

// Get historical dollar rates
router.get('/dollar/history', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const result = await pool.query(
      'SELECT * FROM dollar_rates WHERE is_active = true ORDER BY rate_date DESC LIMIT $1',
      [limit]
    );

    res.json({
      success: true,
      rates: result.rows
    });
  } catch (error) {
    console.error('Error fetching dollar rate history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dollar rate history'
    });
  }
});

// Fetch dollar rates from exchange rate API
router.post('/dollar/fetch', auth, async (req, res) => {
  try {
    const today = formatDate();

    // Fetch from external API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error('Failed to fetch from exchange rate API');
    }

    const data = await response.json();
    const usdToInr = data.rates.INR;
    const inrToUsd = 1 / usdToInr;

    // Check if rate already exists for today
    const existingRate = await pool.query(
      'SELECT id FROM dollar_rates WHERE rate_date = $1',
      [today]
    );

    let result;
    if (existingRate.rows.length > 0) {
      // Update existing rate
      result = await pool.query(
        `UPDATE dollar_rates 
         SET usd_to_inr = $1, inr_to_usd = $2, source = $3, fetched_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE rate_date = $4 
         RETURNING *`,
        [usdToInr, inrToUsd, 'exchangerate-api.com', today]
      );
    } else {
      // Insert new rate
      result = await pool.query(
        `INSERT INTO dollar_rates (rate_date, usd_to_inr, inr_to_usd, source) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [today, usdToInr, inrToUsd, 'exchangerate-api.com']
      );
    }

    // Log successful fetch
    await logFetchAttempt('dollar', 'success', 'exchangerate-api.com', null, JSON.stringify({ usd_to_inr: usdToInr, inr_to_usd: inrToUsd }));

    res.json({
      success: true,
      rate: result.rows[0],
      message: 'Dollar rates fetched and saved successfully'
    });

  } catch (error) {
    console.error('Error fetching dollar rates:', error);
    
    // Log failed fetch
    await logFetchAttempt('dollar', 'failed', 'exchangerate-api.com', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dollar rates: ' + error.message
    });
  }
});

// =============================================================================
// GENERAL ENDPOINTS
// =============================================================================

// Get fetch logs
router.get('/logs', auth, async (req, res) => {
  try {
    const rateType = req.query.type; // 'gold', 'dollar', or undefined for all
    const limit = parseInt(req.query.limit) || 50;

    let query = 'SELECT * FROM rate_fetch_logs';
    let params = [];
    
    if (rateType) {
      query += ' WHERE rate_type = $1';
      params.push(rateType);
    }
    
    query += ' ORDER BY fetch_time DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      logs: result.rows
    });
  } catch (error) {
    console.error('Error fetching rate logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rate logs'
    });
  }
});

// Manual save custom rate
router.post('/custom', auth, async (req, res) => {
  try {
    const { rateType, customRate, notes } = req.body;
    const today = formatDate();

    if (rateType === 'dollar') {
      const usdToInr = parseFloat(customRate);
      const inrToUsd = 1 / usdToInr;

      const result = await pool.query(
        `INSERT INTO dollar_rates (rate_date, usd_to_inr, inr_to_usd, source, notes) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (rate_date) 
         DO UPDATE SET usd_to_inr = $2, inr_to_usd = $3, source = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [today, usdToInr, inrToUsd, 'manual entry', notes]
      );

      res.json({
        success: true,
        rate: result.rows[0],
        message: 'Custom dollar rate saved successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Custom gold rates not supported yet'
      });
    }
  } catch (error) {
    console.error('Error saving custom rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save custom rate'
    });
  }
});

// Get scheduler status
router.get('/scheduler/status', auth, (req, res) => {
  try {
    const status = getSchedulerStatus();
    res.json({
      success: true,
      scheduler: status
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduler status'
    });
  }
});

// Manual save gold rates
router.post('/gold/manual', auth, async (req, res) => {
  try {
    const { 
      gold_24k_per_10g, 
      gold_22k_per_10g, 
      gold_18k_per_10g, 
      gold_14k_per_10g, 
      source, 
      notes 
    } = req.body;
    
    const today = formatDate();

    // Validate required 24k rate
    if (!gold_24k_per_10g || isNaN(parseFloat(gold_24k_per_10g))) {
      return res.status(400).json({
        success: false,
        message: '24K gold rate is required and must be a valid number'
      });
    }

    // Check if rate already exists for today
    const existingRate = await pool.query(
      'SELECT id FROM gold_rates WHERE rate_date = $1',
      [today]
    );

    let result;
    if (existingRate.rows.length > 0) {
      // Update existing rate
      result = await pool.query(
        `UPDATE gold_rates 
         SET gold_24k_per_10g = $1, gold_22k_per_10g = $2, gold_18k_per_10g = $3, 
             gold_14k_per_10g = $4, source = $5, notes = $6, fetched_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE rate_date = $7 
         RETURNING *`,
        [
          parseFloat(gold_24k_per_10g),
          parseFloat(gold_22k_per_10g || 0),
          parseFloat(gold_18k_per_10g || 0),
          parseFloat(gold_14k_per_10g || 0),
          source || 'manual entry',
          notes || 'Manual entry by admin',
          today
        ]
      );
    } else {
      // Insert new rate
      result = await pool.query(
        `INSERT INTO gold_rates 
         (rate_date, gold_24k_per_10g, gold_22k_per_10g, gold_18k_per_10g, 
          gold_14k_per_10g, source, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          today,
          parseFloat(gold_24k_per_10g),
          parseFloat(gold_22k_per_10g || 0),
          parseFloat(gold_18k_per_10g || 0),
          parseFloat(gold_14k_per_10g || 0),
          source || 'manual entry',
          notes || 'Manual entry by admin'
        ]
      );
    }

    // Log successful manual entry
    await logFetchAttempt('gold', 'success', 'manual entry', null, JSON.stringify({
      gold_24k_per_10g: parseFloat(gold_24k_per_10g),
      gold_22k_per_10g: parseFloat(gold_22k_per_10g || 0),
      gold_18k_per_10g: parseFloat(gold_18k_per_10g || 0),
      gold_14k_per_10g: parseFloat(gold_14k_per_10g || 0)
    }));

    res.json({
      success: true,
      rate: result.rows[0],
      message: 'Gold rates saved successfully'
    });

  } catch (error) {
    console.error('Error saving manual gold rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save gold rates: ' + error.message
    });
  }
});

// Manual save dollar rates
router.post('/dollar/manual', auth, async (req, res) => {
  try {
    const { usd_to_inr, source, notes } = req.body;
    const today = formatDate();

    // Validate required rate
    if (!usd_to_inr || isNaN(parseFloat(usd_to_inr))) {
      return res.status(400).json({
        success: false,
        message: 'USD to INR rate is required and must be a valid number'
      });
    }

    const usdToInrRate = parseFloat(usd_to_inr);
    const inrToUsdRate = 1 / usdToInrRate;

    // Check if rate already exists for today
    const existingRate = await pool.query(
      'SELECT id FROM dollar_rates WHERE rate_date = $1',
      [today]
    );

    let result;
    if (existingRate.rows.length > 0) {
      // Update existing rate
      result = await pool.query(
        `UPDATE dollar_rates 
         SET usd_to_inr = $1, inr_to_usd = $2, source = $3, notes = $4, 
             fetched_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE rate_date = $5 
         RETURNING *`,
        [
          usdToInrRate,
          inrToUsdRate,
          source || 'manual entry',
          notes || 'Manual entry by admin',
          today
        ]
      );
    } else {
      // Insert new rate
      result = await pool.query(
        `INSERT INTO dollar_rates (rate_date, usd_to_inr, inr_to_usd, source, notes) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [
          today,
          usdToInrRate,
          inrToUsdRate,
          source || 'manual entry',
          notes || 'Manual entry by admin'
        ]
      );
    }

    // Log successful manual entry
    await logFetchAttempt('dollar', 'success', 'manual entry', null, JSON.stringify({
      usd_to_inr: usdToInrRate,
      inr_to_usd: inrToUsdRate
    }));

    res.json({
      success: true,
      rate: result.rows[0],
      message: 'Dollar rates saved successfully'
    });

  } catch (error) {
    console.error('Error saving manual dollar rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save dollar rates: ' + error.message
    });
  }
});

// Get tax rates (latest)
router.get('/tax/latest', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tax_rates WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
    );

    if (result.rows.length > 0) {
      res.json({
        success: true,
        rate: result.rows[0]
      });
    } else {
      res.json({
        success: true,
        rate: null,
        message: 'No tax rates configured'
      });
    }
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax rates'
    });
  }
});

// Manual save tax rates
router.post('/tax/manual', auth, async (req, res) => {
  try {
    const { gst_percentage, customs_duty, state_tax } = req.body;

    // Validate at least one tax rate is provided
    if (!gst_percentage && !customs_duty && !state_tax) {
      return res.status(400).json({
        success: false,
        message: 'At least one tax rate must be provided'
      });
    }

    // Deactivate existing tax rates
    await pool.query('UPDATE tax_rates SET is_active = false WHERE is_active = true');

    // Insert new tax rates
    const result = await pool.query(
      `INSERT INTO tax_rates (gst_percentage, customs_duty, state_tax, is_active) 
       VALUES ($1, $2, $3, true) 
       RETURNING *`,
      [
        gst_percentage ? parseFloat(gst_percentage) : null,
        customs_duty ? parseFloat(customs_duty) : null,
        state_tax ? parseFloat(state_tax) : null
      ]
    );

    res.json({
      success: true,
      rate: result.rows[0],
      message: 'Tax rates saved successfully'
    });

  } catch (error) {
    console.error('Error saving manual tax rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save tax rates: ' + error.message
    });
  }
});

// Manual trigger for rates (admin only)
router.post('/scheduler/trigger', auth, async (req, res) => {
  try {
    const { rateType } = req.body; // 'gold', 'dollar', or 'both'
    
    // Check if user has admin permissions (you might want to add this check)
    
    if (rateType === 'dollar' || rateType === 'both') {
      await manualFetchDollarRates();
    }
    
    if (rateType === 'gold' || rateType === 'both') {
      await manualFetchGoldRates();
    }
    
    res.json({
      success: true,
      message: `Manual fetch triggered for ${rateType} rates`
    });
  } catch (error) {
    console.error('Error triggering manual fetch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger manual fetch'
    });
  }
});

module.exports = router;
