#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class PermitsIngest {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.permitsFile = path.join(this.dataDir, 'permits.json');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async fetchNJPermits() {
    console.log('🔍 Fetching NJ permit data...');
    
    try {
      // NJ Open Data API for building permits
      const response = await axios.get('https://data.nj.gov/resource/ipay-4j5v.json', {
        params: {
          $limit: 1000,
          $order: 'issue_date DESC',
          $where: "issue_date >= '2024-01-01'"
        },
        timeout: 30000
      });

      const permits = response.data.map(permit => ({
        id: permit.permit_number || `NJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        state: 'NJ',
        location: permit.municipality || 'Unknown',
        zipCode: permit.zip_code || 'Unknown',
        type: permit.permit_type || 'Unknown',
        issueDate: permit.issue_date,
        value: parseFloat(permit.estimated_value) || 0,
        description: permit.description || '',
        status: permit.status || 'Active',
        source: 'NJ Open Data'
      }));

      console.log(`✅ Fetched ${permits.length} NJ permits`);
      return permits;
    } catch (error) {
      console.error('❌ Error fetching NJ permits:', error.message);
      return [];
    }
  }

  async fetchPhillyPermits() {
    console.log('🔍 Fetching Philadelphia permit data...');
    
    try {
      // Philadelphia Open Data API for building permits
      const response = await axios.get('https://phl.carto.com/api/v2/sql', {
        params: {
          q: `SELECT * FROM building_permits WHERE issue_date >= '2024-01-01' ORDER BY issue_date DESC LIMIT 1000`
        },
        timeout: 30000
      });

      const permits = response.data.rows.map(permit => ({
        id: permit.permit_number || `PA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        state: 'PA',
        location: 'Philadelphia',
        zipCode: permit.zip_code || 'Unknown',
        type: permit.permit_type || 'Unknown',
        issueDate: permit.issue_date,
        value: parseFloat(permit.estimated_value) || 0,
        description: permit.description || '',
        status: permit.status || 'Active',
        source: 'Philadelphia Open Data'
      }));

      console.log(`✅ Fetched ${permits.length} Philadelphia permits`);
      return permits;
    } catch (error) {
      console.error('❌ Error fetching Philadelphia permits:', error.message);
      return [];
    }
  }

  async fetchAlternativePermits() {
    console.log('🔍 Fetching alternative permit sources...');
    
    const alternativePermits = [];
    
    try {
      // Try to fetch from NJ Department of Community Affairs
      const njResponse = await axios.get('https://www.nj.gov/dca/divisions/codes/reporter/building_permits.html', {
        timeout: 15000
      });
      
      // This would need proper HTML parsing in a real implementation
      console.log('📄 NJ DCA page accessed (parsing would be implemented)');
      
    } catch (error) {
      console.log('ℹ️ Alternative NJ source not accessible');
    }

    try {
      // Try to fetch from Philadelphia L&I
      const phillyResponse = await axios.get('https://www.phila.gov/departments/department-of-licenses-and-inspections/', {
        timeout: 15000
      });
      
      console.log('📄 Philadelphia L&I page accessed (parsing would be implemented)');
      
    } catch (error) {
      console.log('ℹ️ Alternative Philadelphia source not accessible');
    }

    return alternativePermits;
  }

  processPermits(permits) {
    console.log('🔄 Processing permit data...');
    
    const processed = permits.map(permit => {
      // Calculate permit activity score (1-10)
      let activityScore = 1;
      
      if (permit.value > 1000000) activityScore = 10;
      else if (permit.value > 500000) activityScore = 8;
      else if (permit.value > 100000) activityScore = 6;
      else if (permit.value > 50000) activityScore = 4;
      else if (permit.value > 10000) activityScore = 2;
      
      // Boost score for certain permit types
      if (permit.type?.toLowerCase().includes('new construction')) activityScore += 2;
      if (permit.type?.toLowerCase().includes('renovation')) activityScore += 1;
      if (permit.type?.toLowerCase().includes('addition')) activityScore += 1;
      
      return {
        ...permit,
        activityScore: Math.min(activityScore, 10),
        processedAt: new Date().toISOString()
      };
    });

    // Group by ZIP code for analysis
    const zipCodeGroups = {};
    processed.forEach(permit => {
      if (!zipCodeGroups[permit.zipCode]) {
        zipCodeGroups[permit.zipCode] = {
          zipCode: permit.zipCode,
          location: permit.location,
          state: permit.state,
          totalPermits: 0,
          totalValue: 0,
          averageScore: 0,
          permitTypes: {},
          recentActivity: 0
        };
      }
      
      const group = zipCodeGroups[permit.zipCode];
      group.totalPermits++;
      group.totalValue += permit.value;
      group.averageScore = (group.averageScore * (group.totalPermits - 1) + permit.activityScore) / group.totalPermits;
      
      if (!group.permitTypes[permit.type]) {
        group.permitTypes[permit.type] = 0;
      }
      group.permitTypes[permit.type]++;
      
      // Count recent activity (last 30 days)
      const issueDate = new Date(permit.issueDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (issueDate >= thirtyDaysAgo) {
        group.recentActivity++;
      }
    });

    console.log(`✅ Processed ${processed.length} permits into ${Object.keys(zipCodeGroups).length} ZIP code groups`);
    return { permits: processed, zipCodeGroups: Object.values(zipCodeGroups) };
  }

  async saveData(data) {
    console.log('💾 Saving permit data...');
    
    try {
      const existingData = fs.existsSync(this.permitsFile) 
        ? JSON.parse(fs.readFileSync(this.permitsFile, 'utf8'))
        : { lastUpdated: null, permits: [], zipCodeGroups: [] };

      const newData = {
        lastUpdated: new Date().toISOString(),
        permits: data.permits,
        zipCodeGroups: data.zipCodeGroups,
        summary: {
          totalPermits: data.permits.length,
          totalValue: data.permits.reduce((sum, p) => sum + p.value, 0),
          averageValue: data.permits.reduce((sum, p) => sum + p.value, 0) / data.permits.length,
          zipCodesCovered: data.zipCodeGroups.length,
          states: [...new Set(data.permits.map(p => p.state))]
        }
      };

      fs.writeFileSync(this.permitsFile, JSON.stringify(newData, null, 2));
      console.log('✅ Permit data saved successfully');
      
      return newData;
    } catch (error) {
      console.error('❌ Error saving permit data:', error.message);
      throw error;
    }
  }

  generateReport(data) {
    console.log('\n📊 PERMITS INGEST REPORT');
    console.log('=' .repeat(50));
    
    console.log(`📅 Last Updated: ${new Date(data.lastUpdated).toLocaleString()}`);
    console.log(`🏗️  Total Permits: ${data.summary.totalPermits.toLocaleString()}`);
    console.log(`💰 Total Value: $${data.summary.totalValue.toLocaleString()}`);
    console.log(`📊 Average Value: $${data.summary.averageValue.toLocaleString()}`);
    console.log(`📍 ZIP Codes Covered: ${data.summary.zipCodesCovered}`);
    console.log(`🗺️  States: ${data.summary.states.join(', ')}`);
    
    console.log('\n🏆 TOP 5 ZIP CODES BY ACTIVITY:');
    const topZips = data.zipCodeGroups
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);
    
    topZips.forEach((zip, index) => {
      console.log(`${index + 1}. ${zip.zipCode} (${zip.location}, ${zip.state})`);
      console.log(`   Score: ${zip.averageScore.toFixed(1)} | Permits: ${zip.totalPermits} | Value: $${zip.totalValue.toLocaleString()}`);
    });
    
    console.log('\n📈 PERMIT TYPE BREAKDOWN:');
    const permitTypes = {};
    data.permits.forEach(permit => {
      if (!permitTypes[permit.type]) permitTypes[permit.type] = 0;
      permitTypes[permit.type]++;
    });
    
    Object.entries(permitTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
  }

  async run() {
    console.log('🚀 Starting Permits Ingest Process...\n');
    
    try {
      // Fetch data from multiple sources
      const [njPermits, phillyPermits, alternativePermits] = await Promise.all([
        this.fetchNJPermits(),
        this.fetchPhillyPermits(),
        this.fetchAlternativePermits()
      ]);

      // Combine all permits
      const allPermits = [...njPermits, ...phillyPermits, ...alternativePermits];
      
      if (allPermits.length === 0) {
        console.log('⚠️ No permit data was fetched. Check your internet connection and API endpoints.');
        return;
      }

      // Process the data
      const processedData = this.processPermits(allPermits);
      
      // Save to file
      const savedData = await this.saveData(processedData);
      
      // Generate report
      this.generateReport(savedData);
      
      console.log('\n🎉 Permits ingest completed successfully!');
      console.log(`📁 Data saved to: ${this.permitsFile}`);
      
    } catch (error) {
      console.error('💥 Permits ingest failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the permits ingest if this script is executed directly
if (require.main === module) {
  const permitsIngest = new PermitsIngest();
  permitsIngest.run();
}

module.exports = PermitsIngest;
