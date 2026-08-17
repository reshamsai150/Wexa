const { getSession } = require('../config/db');

const getAllSkills = async () => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (s:Skill)
      RETURN s
      ORDER BY s.name
    `);
    return result.records.map(record => record.get('s').properties);
  } finally {
    await session.close();
  }
};

const getSkillById = async (skillId) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (s:Skill {id: $skillId})
      OPTIONAL MATCH (s)-[:RELATED_TO]-(rel:Skill)
      OPTIONAL MATCH (j:Job)-[:REQUIRES]->(s)
      RETURN s, collect(DISTINCT rel) as relatedSkills, collect(DISTINCT j) as jobs
    `, { skillId });
    
    if (result.records.length === 0) return null;
    
    const record = result.records[0];
    const skill = record.get('s').properties;
    const relatedSkills = record.get('relatedSkills').map(s => s.properties);
    const jobs = record.get('jobs').map(j => j.properties);
    
    return { ...skill, relatedSkills, jobs };
  } finally {
    await session.close();
  }
};

module.exports = {
  getAllSkills,
  getSkillById
};
