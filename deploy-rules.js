const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Desplegando reglas de Firestore...');

try {
  // Verificar si firebase CLI está instalado
  execSync('firebase --version', { stdio: 'pipe' });
  
  // Desplegar las reglas
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('✅ Reglas de Firestore desplegadas exitosamente');
} catch (error) {
  console.error('❌ Error al desplegar las reglas:', error.message);
  console.log('\n📋 Instrucciones manuales:');
  console.log('1. Instala Firebase CLI: npm install -g firebase-tools');
  console.log('2. Inicia sesión: firebase login');
  console.log('3. Inicializa el proyecto: firebase init firestore');
  console.log('4. Despliega las reglas: firebase deploy --only firestore:rules');
} 