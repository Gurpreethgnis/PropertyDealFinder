#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏡 PropertyFinder Phase 1 Demo');
console.log('=' .repeat(50));

// Check if mock data exists
const mockDataPath = path.join(process.cwd(), 'data', 'mock-permits.json');
if (fs.existsSync(mockDataPath)) {
  const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
  
  console.log('\n📊 PERMITS DATA OVERVIEW:');
  console.log(`📅 Last Updated: ${new Date(mockData.lastUpdated).toLocaleString()}`);
  console.log(`🏗️  Total Permits: ${mockData.summary.totalPermits}`);
  console.log(`💰 Total Value: $${mockData.summary.totalValue.toLocaleString()}`);
  console.log(`📊 Average Value: $${mockData.summary.averageValue.toLocaleString()}`);
  console.log(`📍 ZIP Codes Covered: ${mockData.summary.zipCodesCovered}`);
  console.log(`🗺️  States: ${mockData.summary.states.join(', ')}`);
  
  console.log('\n🏆 TOP ZIP CODES BY ACTIVITY:');
  const topZips = mockData.zipCodeGroups
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3);
  
  topZips.forEach((zip, index) => {
    console.log(`${index + 1}. ${zip.zipCode} (${zip.location}, ${zip.state})`);
    console.log(`   Score: ${zip.averageScore.toFixed(1)} | Permits: ${zip.totalPermits} | Value: $${zip.totalValue.toLocaleString()}`);
  });
  
  console.log('\n📈 PERMIT TYPE BREAKDOWN:');
  const permitTypes = {};
  mockData.permits.forEach(permit => {
    if (!permitTypes[permit.type]) permitTypes[permit.type] = 0;
    permitTypes[permit.type]++;
  });
  
  Object.entries(permitTypes)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
  
  console.log('\n🎯 INVESTMENT OPPORTUNITIES IDENTIFIED:');
  console.log('• Jersey City (07302): High-value new construction - potential for rental income');
  console.log('• South Philly (19147): Modern townhouse development - gentrification opportunity');
  console.log('• Newark (07102): Historic renovation - adaptive reuse potential');
  
} else {
  console.log('❌ Mock data not found. Run the permits ingest feature first:');
  console.log('   npm run feature -- permits-ingest');
}

console.log('\n🚀 NEXT STEPS:');
console.log('1. Run the development server: npm run dev');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Explore the three main views: Deals Table, Map View, Underwrite Form');
console.log('4. Test the investment calculator with different scenarios');
console.log('5. Run additional features as they become available');

console.log('\n📋 FEATURE ROADMAP:');
console.log('✅ Phase 1 Core Dashboard - COMPLETE');
console.log('⏳ Permits Ingest - READY (needs API keys)');
console.log('⏳ Zillow Indices - NEXT');
console.log('⏳ Flood Risk Assessment - PLANNED');
console.log('⏳ News Pulse - PLANNED');
console.log('⏳ Investment Scoring - PLANNED');

console.log('\n🎉 Demo completed! Your PropertyFinder dashboard is ready to use.');
