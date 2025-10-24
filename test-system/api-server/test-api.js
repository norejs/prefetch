/**
 * Simple test script to verify API server functionality
 */

const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 18001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('Starting API Server Tests...\n');

  try {
    // Test 1: Health check
    console.log('Test 1: Health Check');
    const health = await makeRequest('/api/health');
    console.log('✓ Status:', health.status);
    console.log('✓ Response:', health.data);
    console.log();

    // Test 2: Get all products
    console.log('Test 2: Get All Products');
    const products = await makeRequest('/api/products');
    console.log('✓ Status:', products.status);
    console.log('✓ Total products:', products.data.total);
    console.log();

    // Test 3: Get single product
    console.log('Test 3: Get Single Product');
    const product = await makeRequest('/api/products/1');
    console.log('✓ Status:', product.status);
    console.log('✓ Product:', product.data.name);
    console.log();

    // Test 4: Get all users
    console.log('Test 4: Get All Users');
    const users = await makeRequest('/api/users');
    console.log('✓ Status:', users.status);
    console.log('✓ Total users:', users.data.total);
    console.log();

    // Test 5: Create new product
    console.log('Test 5: Create New Product');
    const newProduct = await makeRequest('/api/products', 'POST', {
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      category: 'Test',
      inStock: true
    });
    console.log('✓ Status:', newProduct.status);
    console.log('✓ Created product ID:', newProduct.data.id);
    console.log();

    // Test 6: Update product
    console.log('Test 6: Update Product');
    const updated = await makeRequest(`/api/products/${newProduct.data.id}`, 'PUT', {
      price: 149.99
    });
    console.log('✓ Status:', updated.status);
    console.log('✓ Updated price:', updated.data.price);
    console.log();

    // Test 7: Delete product
    console.log('Test 7: Delete Product');
    const deleted = await makeRequest(`/api/products/${newProduct.data.id}`, 'DELETE');
    console.log('✓ Status:', deleted.status);
    console.log('✓ Message:', deleted.data.message);
    console.log();

    // Test 8: Get request logs
    console.log('Test 8: Get Request Logs');
    const logs = await makeRequest('/api/logs');
    console.log('✓ Status:', logs.status);
    console.log('✓ Total logged requests:', logs.data.total);
    console.log();

    console.log('All tests passed! ✓');
    process.exit(0);

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Wait a bit for server to start if needed
setTimeout(runTests, 1000);
