const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USERNAME || process.env.COGNODB_USER;
const password = process.env.COGNODB_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const fixData = async () => {
  const session = driver.session();
  try {
    console.log('Fixing Missing Company OFFERS Relationships...');
    await session.run(`
      MATCH (acme:Company {name: 'Acme AI'})
      MATCH (technova:Company {name: 'TechNova'})
      MATCH (ai:Job {title: 'AI Engineer'})
      MATCH (backend:Job {title: 'Backend Engineer'})
      MATCH (frontend:Job {title: 'Frontend Engineer'})
      MATCH (fullstack:Job {title: 'Full Stack Developer'})
      MERGE (acme)-[:OFFERS]->(ai)
      MERGE (acme)-[:OFFERS]->(backend)
      MERGE (technova)-[:OFFERS]->(frontend)
      MERGE (technova)-[:OFFERS]->(fullstack)
    `);
    console.log('Fixed OFFERS.');

    console.log('Fixing Missing Job REQUIRES Relationships...');
    await session.run(`
      MATCH (fe:Job {title: 'Frontend Engineer'})
      MATCH (fs:Job {title: 'Full Stack Developer'})
      MATCH (react:Skill {name: 'React'})
      MATCH (js:Skill {name: 'JavaScript'})
      MATCH (ts:Skill {name: 'TypeScript'})
      MATCH (node:Skill {name: 'Node.js'})
      MERGE (fe)-[:REQUIRES]->(react)
      MERGE (fe)-[:REQUIRES]->(js)
      MERGE (fs)-[:REQUIRES]->(react)
      MERGE (fs)-[:REQUIRES]->(js)
      MERGE (fs)-[:REQUIRES]->(ts)
      MERGE (fs)-[:REQUIRES]->(node)
    `);
    console.log('Fixed REQUIRES.');

  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await session.close();
    await driver.close();
  }
};

fixData();
