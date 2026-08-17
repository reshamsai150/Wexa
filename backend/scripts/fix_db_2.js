const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USERNAME || process.env.COGNODB_USER;
const password = process.env.COGNODB_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const fixData = async () => {
  const session = driver.session();
  try {
    console.log('Fixing Missing Job REQUIRES Relationships (Batch 2)...');
    await session.run(`
      MATCH (backend:Job {title: 'Backend Engineer'})
      MATCH (fullstack:Job {title: 'Full Stack Developer'})

      MATCH (node:Skill {name: 'Node.js'})
      MATCH (exp:Skill {name: 'Express'})
      MATCH (db:Skill {name: 'MongoDB'})
      MATCH (git:Skill {name: 'Git'})
      MATCH (fast:Skill {name: 'FastAPI'})
      MATCH (test:Skill {name: 'Testing'})
      MATCH (sql:Skill {name: 'SQL'})

      MERGE (backend)-[:REQUIRES]->(node)
      MERGE (backend)-[:REQUIRES]->(exp)
      MERGE (backend)-[:REQUIRES]->(db)
      MERGE (backend)-[:REQUIRES]->(fast)
      MERGE (backend)-[:REQUIRES]->(sql)

      MERGE (fullstack)-[:REQUIRES]->(node)
      MERGE (fullstack)-[:REQUIRES]->(exp)
      MERGE (fullstack)-[:REQUIRES]->(git)
      MERGE (fullstack)-[:REQUIRES]->(test)
      MERGE (fullstack)-[:REQUIRES]->(db)
    `);
    console.log('Fixed REQUIRES (Batch 2).');

  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await session.close();
    await driver.close();
  }
};

fixData();
