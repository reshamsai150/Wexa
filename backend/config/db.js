const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(process.env.COGNODB_USERNAME || process.env.COGNODB_USER, process.env.COGNODB_PASSWORD),
  { 
    disableLosslessIntegers: true,
    maxConnectionLifetime: 3 * 60 * 1000, // 3 minutes
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2000
  }
);

const getSession = () => driver.session();

const checkConnection = async () => {
  try {
    await driver.verifyConnectivity();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};

module.exports = {
  driver,
  getSession,
  checkConnection
};
