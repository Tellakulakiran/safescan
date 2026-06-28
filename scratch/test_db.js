const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Manually load env from .env.local for local prisma test
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (parts) {
      const key = parts[1];
      let val = parts[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

console.log("Testing Neon DB via Prisma Client...");
const prisma = new PrismaClient();

async function run() {
  try {
    const count = await prisma.profile.count();
    console.log("✅ Successfully connected to Neon DB via Prisma!");
    console.log(`Number of profiles in database: ${count}`);
  } catch (error) {
    console.error("❌ Prisma DB test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
