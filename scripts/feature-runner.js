#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FEATURES = {
  'permits-ingest': {
    description: 'Pull NJ & Philly permit data',
    script: 'scripts/features/permits-ingest.js',
    dependencies: ['axios', 'cheerio']
  },
  'zillow-indices': {
    description: 'Fetch Zillow market indices',
    script: 'scripts/features/zillow-indices.js',
    dependencies: ['axios']
  },
  'flood-risk': {
    description: 'Integrate FEMA flood data',
    script: 'scripts/features/flood-risk.js',
    dependencies: ['axios', 'turf']
  },
  'news-pulse': {
    description: 'Local development news feeds',
    script: 'scripts/features/news-pulse.js',
    dependencies: ['axios', 'rss-parser']
  },
  'investment-scoring': {
    description: 'Multi-scenario deal evaluation',
    script: 'scripts/features/investment-scoring.js',
    dependencies: ['lodash']
  },
  'dashboard-ui': {
    description: 'Main dashboard interface',
    script: 'npm run dev',
    dependencies: []
  },
  'demo': {
    description: 'Run system demo with mock data',
    script: 'scripts/demo.js',
    dependencies: []
  }
};

function showHelp() {
  console.log('\n🏡 PropertyFinder Feature Runner\n');
  console.log('Available features:');
  Object.entries(FEATURES).forEach(([key, feature]) => {
    console.log(`  ${key.padEnd(20)} - ${feature.description}`);
  });
  console.log('\nUsage: npm run feature -- <feature-name>');
  console.log('Example: npm run feature -- permits-ingest\n');
}

function runFeature(featureName) {
  const feature = FEATURES[featureName];
  
  if (!feature) {
    console.error(`❌ Unknown feature: ${featureName}`);
    showHelp();
    process.exit(1);
  }

  console.log(`🚀 Running: ${feature.description}`);
  
  try {
    if (feature.script.startsWith('npm')) {
      // Run npm command
      execSync(feature.script, { stdio: 'inherit' });
    } else {
      // Run custom script
      const scriptPath = path.join(process.cwd(), feature.script);
      if (fs.existsSync(scriptPath)) {
        execSync(`node ${scriptPath}`, { stdio: 'inherit' });
      } else {
        console.error(`❌ Script not found: ${scriptPath}`);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(`❌ Error running feature: ${error.message}`);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const featureName = args[0];
  runFeature(featureName);
}

if (require.main === module) {
  main();
}

module.exports = { FEATURES, runFeature };
