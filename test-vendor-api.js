const fetch = require('node-fetch');

async function testVendorAPI() {
  try {
    console.log('Testing vendor API...');
    
    const response = await fetch('http://localhost:3000/api/vendors', {
      headers: {
        'Authorization': 'Bearer dummy-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Vendors data:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('Error response:', error);
    }
    
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testVendorAPI();
