// Script para probar la conectividad de la API desde el navegador
// Copiar y pegar en la consola del navegador en tu app desplegada

console.log('🔧 RestaurantOS API Connection Test - Browser Version');
console.log('====================================================');

// Obtener la URL de la API desde las variables de entorno
const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 
                     window.location.origin.includes('vercel.app') 
                       ? 'TU_URL_DE_RENDER_AQUI/api' 
                       : 'http://localhost:3000/api';

console.log(`🎯 API Base URL: ${API_BASE_URL}`);

// Función para probar endpoints
async function testEndpoint(endpoint, method = 'GET') {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n🔍 Testing: ${method} ${url}`);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    // Verificar headers CORS
    const corsOrigin = response.headers.get('access-control-allow-origin');
    if (corsOrigin) {
      console.log(`🌐 CORS Origin: ${corsOrigin}`);
    } else {
      console.log(`⚠️  No CORS headers found`);
    }
    
    // Intentar parsear la respuesta
    try {
      const data = await response.json();
      console.log(`📊 Response:`, data);
      return { success: true, status: response.status, data };
    } catch (e) {
      const text = await response.text();
      console.log(`📄 Response (text):`, text.substring(0, 200) + '...');
      return { success: true, status: response.status, data: text };
    }
    
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Lista de endpoints a probar
const endpoints = [
  '/',
  '/health',
  '/categories',
  '/restaurants',
];

// Ejecutar pruebas
async function runTests() {
  console.log('\n🚀 Starting API connectivity tests...\n');
  
  const results = {};
  
  for (const endpoint of endpoints) {
    results[endpoint] = await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa de 1 segundo
  }
  
  // Resumen
  console.log('\n📋 Test Summary:');
  console.log('================');
  
  let successCount = 0;
  for (const [endpoint, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`✅ ${endpoint}: ${result.status}`);
      successCount++;
    } else {
      console.log(`❌ ${endpoint}: ${result.error}`);
    }
  }
  
  console.log(`\n📊 Success Rate: ${successCount}/${endpoints.length} (${Math.round(successCount/endpoints.length*100)}%)`);
  
  // Consejos basados en los resultados
  if (successCount === 0) {
    console.log('\n🚨 All tests failed. Possible issues:');
    console.log('   1. API server is down');
    console.log('   2. Incorrect API URL');
    console.log('   3. Network connectivity issues');
    console.log('   4. CORS configuration problems');
  } else if (successCount < endpoints.length) {
    console.log('\n⚠️  Some tests failed. Check:');
    console.log('   1. Specific endpoint configurations');
    console.log('   2. Authentication requirements');
    console.log('   3. API route definitions');
  } else {
    console.log('\n🎉 All tests passed! API connectivity is working.');
  }
  
  return results;
}

// Ejecutar automáticamente
runTests().then(results => {
  console.log('\n🔚 Test completed. Results stored in:', results);
}).catch(error => {
  console.error('🚨 Test execution failed:', error);
});

// Función adicional para probar autenticación
async function testLogin(email = 'admin@example.com', password = 'password') {
  console.log('\n🔐 Testing Login...');
  
  return await testEndpoint('/users/login', 'POST', {
    email,
    password
  });
}

// Función para probar con datos POST
async function testEndpointWithData(endpoint, method = 'POST', data = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n🔍 Testing: ${method} ${url} with data:`, data);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    try {
      const responseData = await response.json();
      console.log(`📊 Response:`, responseData);
      return { success: true, status: response.status, data: responseData };
    } catch (e) {
      const text = await response.text();
      console.log(`📄 Response (text):`, text);
      return { success: true, status: response.status, data: text };
    }
    
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

console.log('\n💡 Available functions:');
console.log('   - runTests(): Run all connectivity tests');
console.log('   - testEndpoint(path): Test specific endpoint');
console.log('   - testLogin(email, password): Test login functionality');
console.log('   - testEndpointWithData(path, method, data): Test with POST data');