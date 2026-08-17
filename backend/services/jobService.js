const { getSession } = require('../config/db');

const getAllJobs = async () => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (j:Job)
      OPTIONAL MATCH (c:Company)-[:OFFERS]->(j)
      RETURN j, c
      ORDER BY j.title
    `);
    return result.records.map(record => {
      const job = record.get('j').properties;
      const cNode = record.get('c');
      const company = cNode ? cNode.properties : null;
      return { ...job, company };
    });
  } finally {
    await session.close();
  }
};

const getJobById = async (jobId) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (j:Job {id: $jobId})
      OPTIONAL MATCH (c:Company)-[:OFFERS]->(j)
      OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
      RETURN j, c, collect(s) as skills
    `, { jobId });
    
    if (result.records.length === 0) return null;
    
    const record = result.records[0];
    const job = record.get('j').properties;
    const cNode = record.get('c');
    const company = cNode ? cNode.properties : null;
    const skills = record.get('skills').map(s => s.properties);
    
    return { ...job, company, skills };
  } finally {
    await session.close();
  }
};

module.exports = {
  getAllJobs,
  getJobById
};
