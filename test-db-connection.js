#!/usr/bin/env node

/**
 * Database Connection Diagnostic Script
 * Tests different connection string formats for Supabase
 */

const { PrismaClient } = require('@prisma/client');

const connectionStrings = [
  {
    name: 'Current (prefer SSL)',
    url: 'postgresql://postgres:RitamTitan%40007@db.olhbzxdikriyitnrkoha.supabase.co:5432/postgres?schema=public&sslmode=prefer'
  },
  {
    name: 'Require SSL',
    url: 'postgresql://postgres:RitamTitan%40007@db.olhbzxdikriyitnrkoha.supabase.co:5432/postgres?schema=public&sslmode=require'
  },
  {
    name: 'No SSL',
    url: 'postgresql://postgres:RitamTitan%40007@db.olhbzxdikriyitnrkoha.supabase.co:5432/postgres?schema=public&sslmode=disable'
  },
  {
    name: 'Connection Pooler (port 6543)',
    url: 'postgresql://postgres.RitamTitan%40007@db.olhbzxdikriyitnrkoha.supabase.co:6543/postgres?schema=public&pgbouncer=true&sslmode=prefer'
  },
  {
    name: 'Direct with verify-full',
    url: 'postgresql://postgres:RitamTitan%40007@db.olhbzxdikriyitnrkoha.supabase.co:5432/postgres?schema=public&sslmode=verify-full'
  }
];

async function testConnection(name, url) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log(`   URL: ${url.replace(/RitamTitan%40007/, '***')}`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    await prisma.$connect();
    console.log(`   ✅ Connection successful!`);
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`   ✅ Query successful:`, result);
    
    await prisma.$disconnect();
    return { success: true, url };
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    await prisma.$disconnect().catch(() => {});
    return { success: false, url, error: error.message };
  }
}

async function testNetworkConnectivity() {
  console.log('\n🌐 Testing Network Connectivity...');
  
  const host = 'db.olhbzxdikriyitnrkoha.supabase.co';
  const port = 5432;
  
  try {
    const net = require('net');
    const socket = new net.Socket();
    
    return new Promise((resolve) => {
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        console.log(`   ✅ Can reach ${host}:${port}`);
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        console.log(`   ❌ Timeout connecting to ${host}:${port}`);
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', (err) => {
        console.log(`   ❌ Cannot reach ${host}:${port} - ${err.message}`);
        resolve(false);
      });
      
      socket.connect(port, host);
    });
  } catch (error) {
    console.log(`   ❌ Network test error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Database Connection Diagnostics     ║');
  console.log('╚════════════════════════════════════════╝');
  
  // Test network connectivity first
  const canReach = await testNetworkConnectivity();
  
  if (!canReach) {
    console.log('\n⚠️  Cannot reach database server. Possible issues:');
    console.log('   1. Database might be paused in Supabase dashboard');
    console.log('   2. IP address might not be whitelisted');
    console.log('   3. Firewall/VPN blocking connection');
    console.log('   4. Network connectivity issues');
    console.log('\n💡 Solutions:');
    console.log('   - Check Supabase dashboard: Settings > Database');
    console.log('   - Ensure database is not paused');
    console.log('   - Check IP whitelist settings');
    console.log('   - Try from a different network');
  }
  
  // Test different connection strings
  console.log('\n📋 Testing Connection String Formats...');
  const results = [];
  
  for (const conn of connectionStrings) {
    const result = await testConnection(conn.name, conn.url);
    results.push(result);
    
    if (result.success) {
      console.log(`\n✅ WORKING CONNECTION FOUND!`);
      console.log(`   Use this in your .env file:`);
      console.log(`   DATABASE_URL="${result.url}"`);
      break;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║           SUMMARY                     ║');
  console.log('╚════════════════════════════════════════╝');
  
  const successful = results.find(r => r.success);
  if (successful) {
    console.log('\n✅ Found working connection!');
  } else {
    console.log('\n❌ No working connection found.');
    console.log('\nPlease check:');
    console.log('1. Supabase dashboard - is database paused?');
    console.log('2. Network connectivity');
    console.log('3. IP whitelist settings in Supabase');
    console.log('4. Password is correct: RitamTitan@007');
  }
}

main().catch(console.error);
