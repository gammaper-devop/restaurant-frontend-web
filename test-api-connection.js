#!/usr/bin/env node

// Script para probar la conexión con la API de Render
import https from 'https';
import http from 'http';

// Configuración de la API
const API_URLS = {
  local: 'http://localhost:3000/api',
  render: process.env.RENDER_API_URL || 'TU_URL_DE_RENDER_AQUI', // Reemplaza con tu URL real
};

// Función para hacer request HTTP/HTTPS
function makeRequest(url, path = '/') {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      timeout: 10000,
      headers: {
        'User-Agent': 'RestaurantOS-Test/1.0.0',
        'Accept': 'application/json',
      }
    };

    const fullUrl = `${url}${path}`;
    console.log(`🔍 Testing: ${fullUrl}`);

    const req = client.get(fullUrl, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url: fullUrl,
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

// Endpoints a probar
const ENDPOINTS = [
  '/', // Health check
  '/health', // Health check alternativo
  '/categories', // Categorías (endpoint público)
  '/restaurants', // Restaurantes
];

async function testAPI(apiUrl, name) {
  console.log(`\n🚀 Testing ${name} API: ${apiUrl}`);
  console.log('=' .repeat(50));

  for (const endpoint of ENDPOINTS) {
    try {
      const result = await makeRequest(apiUrl, endpoint);
      
      console.log(`✅ ${endpoint}: ${result.status} ${getStatusText(result.status)}`);
      
      if (result.status === 200) {
        try {
          const json = JSON.parse(result.data);
          console.log(`   📊 Response: ${JSON.stringify(json).substring(0, 100)}...`);
        } catch (e) {
          console.log(`   📄 Response: ${result.data.substring(0, 100)}...`);
        }
      }
      
      // Verificar CORS headers
      if (result.headers['access-control-allow-origin']) {
        console.log(`   🌐 CORS: ${result.headers['access-control-allow-origin']}`);
      } else {
        console.log(`   ⚠️  CORS headers not found`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

function getStatusText(status) {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };
  return statusTexts[status] || 'Unknown';
}

// Main execution
async function main() {
  console.log('🔧 RestaurantOS API Connection Test');
  console.log('====================================');

  // Test Render API (reemplaza con tu URL real)
  if (process.argv[2]) {
    await testAPI(process.argv[2], 'Render');
  } else {
    console.log('\n📝 Usage: node test-api-connection.js <YOUR_RENDER_API_URL>');
    console.log('Example: node test-api-connection.js https://your-app.onrender.com/api');
  }

  console.log('\n🔍 Additional checks you can do:');
  console.log('1. Check Vercel environment variables');
  console.log('2. Check Render service logs');
  console.log('3. Test CORS from browser console');
  console.log('4. Verify API endpoints manually');
}

main().catch(console.error);