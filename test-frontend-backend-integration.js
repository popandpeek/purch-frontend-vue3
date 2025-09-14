// Test script to verify frontend-backend integration
// This simulates what the frontend does when making API calls

import axios from 'axios';

// Test the vendor selection API endpoints
async function testVendorSelectionAPIs() {
    console.log('Testing Frontend-Backend Integration...');
    console.log('=====================================');
    
    // Base URL for the API
    const baseURL = 'http://localhost:8000/api/v1';
    
    // Test 1: Health check (no auth required)
    try {
        console.log('1. Testing health check...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✓ Health check passed:', healthResponse.data);
    } catch (error) {
        console.log('   ✗ Health check failed:', error.message);
    }
    
    // Test 2: Test vendor selections endpoint (auth required)
    try {
        console.log('2. Testing vendor selections endpoint...');
        const vendorSelectionsResponse = await axios.get(`${baseURL}/house-orders/1/vendor-selections`);
        console.log('   ✓ Vendor selections response:', vendorSelectionsResponse.data);
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('   ⚠ Vendor selections endpoint requires authentication (expected)');
        } else {
            console.log('   ✗ Vendor selections failed:', error.message);
        }
    }
    
    // Test 3: Test config inheritance endpoint (auth required)
    try {
        console.log('3. Testing config inheritance endpoint...');
        const configResponse = await axios.get(`${baseURL}/house-orders/items/1/config-inheritance`);
        console.log('   ✓ Config inheritance response:', configResponse.data);
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('   ⚠ Config inheritance endpoint requires authentication (expected)');
        } else {
            console.log('   ✗ Config inheritance failed:', error.message);
        }
    }
    
    // Test 4: Test override endpoint (auth required)
    try {
        console.log('4. Testing override endpoint...');
        const overrideResponse = await axios.post(`${baseURL}/house-orders/items/1/override-vendor-selection`, {
            vendor_item_id: 2
        });
        console.log('   ✓ Override response:', overrideResponse.data);
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('   ⚠ Override endpoint requires authentication (expected)');
        } else {
            console.log('   ✗ Override failed:', error.message);
        }
    }
    
    // Test 5: Test config update endpoint (auth required)
    try {
        console.log('5. Testing config update endpoint...');
        const configUpdateResponse = await axios.put(`${baseURL}/vendor-selection-config/order/1`, {
            strategy: 'best_value',
            min_order_threshold: 50,
            delivery_priority: true,
            quality_preference: 'premium',
            organic_preference: 0.8,
            preferred_vendor_ids: [1, 3],
            brand_preference: 'Organic',
            max_price_multiplier: 1.5
        });
        console.log('   ✓ Config update response:', configUpdateResponse.data);
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('   ⚠ Config update endpoint requires authentication (expected)');
        } else {
            console.log('   ✗ Config update failed:', error.message);
        }
    }
    
    console.log('=====================================');
    console.log('Integration test complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Log in to the application');
    console.log('3. Navigate to an order and test vendor selection functionality');
    console.log('4. Check browser console for any errors');
}

// Run the test
testVendorSelectionAPIs().catch(console.error);
