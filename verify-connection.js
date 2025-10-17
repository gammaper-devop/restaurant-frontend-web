// Verificación final de conectividad Frontend <-> Backend
// Ejecutar después de configurar ALLOWED_ORIGINS y VITE_API_BASE_URL

console.log('🚀 RestaurantOS - Final Connectivity Verification');
console.log('================================================');

const BACKEND_URL = 'https://restaurant-backend-6g8j.onrender.com/api';
const FRONTEND_URL = 'https://restaurant-frontend-nbmd3gsnz.vercel.app';

console.log(`🖥️  Frontend: ${FRONTEND_URL}`);
console.log(`⚙️  Backend:  ${BACKEND_URL}`);

// Test 1: Direct API call with CORS headers
async function testCORS() {
  console.log('\n🔍 Test 1: CORS Configuration');
  console.log('-------------------------------');
  
  try {
    const response = await fetch(`${BACKEND_URL}/categories`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    
    const corsOrigin = response.headers.get('access-control-allow-origin');
    const corsCredentials = response.headers.get('access-control-allow-credentials');
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`🌐 CORS Origin: ${corsOrigin || 'NOT SET'}`);
    console.log(`🔐 CORS Credentials: ${corsCredentials || 'NOT SET'}`);
    
    if (corsOrigin && (corsOrigin === FRONTEND_URL || corsOrigin === '*')) {
      console.log('✅ CORS properly configured!');
      return true;
    } else {
      console.log('❌ CORS not properly configured');
      console.log(`   Expected: ${FRONTEND_URL}`);
      console.log(`   Got: ${corsOrigin}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
    return false;
  }
}

// Test 2: Test main endpoints
async function testEndpoints() {
  console.log('\n🔍 Test 2: API Endpoints');
  console.log('-------------------------');
  
  const endpoints = ['/categories', '/restaurants'];
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Origin': FRONTEND_URL,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${endpoint}: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   📊 Response: ${data.success ? 'Success' : 'Failed'}`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Endpoints: ${successCount}/${endpoints.length} working`);
  return successCount === endpoints.length;
}

// Test 3: Environment Variables Check
function testEnvVars() {
  console.log('\n🔍 Test 3: Environment Variables');
  console.log('----------------------------------');
  
  console.log('📋 Required variables in Render:');
  console.log('   ALLOWED_ORIGINS should contain:', FRONTEND_URL);
  
  console.log('📋 Required variables in Vercel:');
  console.log('   VITE_API_BASE_URL should be:', BACKEND_URL);
  
  console.log('\n💡 To check:');
  console.log('   - Render: Dashboard → Your Service → Environment');
  console.log('   - Vercel: Dashboard → Your Project → Settings → Environment Variables');
}

// Main execution
async function runFullTest() {
  console.log('\n🎯 Starting comprehensive connectivity test...\n');
  
  const corsOK = await testCORS();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const endpointsOK = await testEndpoints();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  testEnvVars();
  
  console.log('\n📋 FINAL RESULTS');
  console.log('=================');
  console.log(`🌐 CORS Configuration: ${corsOK ? '✅ OK' : '❌ FAILED'}`);
  console.log(`🔗 API Endpoints: ${endpointsOK ? '✅ OK' : '❌ FAILED'}`);
  
  if (corsOK && endpointsOK) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('Your frontend should now connect successfully to your backend.');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('Check the configuration steps above.');
  }
}

// Auto-execute
runFullTest().catch(error => {
  console.error('❌ Test suite failed:', error);
});