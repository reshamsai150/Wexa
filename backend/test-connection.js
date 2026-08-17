const neo4j = require('neo4j-driver');
require('dotenv').config();

// Initialize the driver with bolt+s:// URI
const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(process.env.COGNODB_USER, process.env.COGNODB_PASSWORD)
);

async function runFirstQuery() {
  const session = driver.session();
  try {
    // Verify connection
    await driver.verifyConnectivity();
    console.log('✅ Connected to CognoDB Cloud successfully!');

    // Execute first Cypher query using parameterised query
    const result = await session.run('RETURN $message AS greeting', {
      message: 'Hello CognoDB from Neo4j Driver!'
    });

    const greeting = result.records[0].get('greeting');
    console.log(`🎉 Query Output: ${greeting}`);
  } catch (error) {
    console.error('❌ Connection/Query error:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

runFirstQuery();
