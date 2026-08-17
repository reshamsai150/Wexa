const { getSession } = require('../config/db');

const getPersonById = async (personId) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (p:Person {id: $personId})
      OPTIONAL MATCH (p)-[:HAS_SKILL]->(s:Skill)
      RETURN p, collect(s) as skills
    `, { personId });
    
    if (result.records.length === 0) return null;
    
    const record = result.records[0];
    const person = record.get('p').properties;
    const skills = record.get('skills').map(s => s.properties);
    
    return { ...person, skills };
  } finally {
    await session.close();
  }
};

const getSkillGap = async (personId, jobId) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (j:Job {id: $jobId})-[:REQUIRES]->(s:Skill)
      WHERE NOT EXISTS {
        MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s)
      }
      RETURN s
    `, { personId, jobId });
    
    return result.records.map(record => record.get('s').properties);
  } finally {
    await session.close();
  }
};

const getRecommendations = async (personId) => {
  const session = getSession();
  try {
    // Multi-hop AI recommendation up to 2 relationship hops
    const result = await session.run(`
      MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s1:Skill)
      MATCH (s1)-[:RELATED_TO*0..2]-(s2:Skill)
      MATCH (j:Job)-[:REQUIRES]->(s2)
      RETURN DISTINCT j.id AS id, j.title AS title, j.level AS level, count(DISTINCT s2) as score
      ORDER BY score DESC LIMIT 10
    `, { personId });
    
    return result.records.map(record => ({
      id: record.get('id'),
      title: record.get('title'),
      level: record.get('level'),
      score: record.get('score')
    }));
  } finally {
    await session.close();
  }
};

const getAllPersons = async () => {
  const session = getSession();
  try {
    const result = await session.run(`MATCH (p:Person) RETURN p`);
    return result.records.map(record => record.get('p').properties);
  } finally {
    await session.close();
  }
};

const addSkillToPerson = async (personId, skillName) => {
  const session = getSession();
  try {
    await session.run(`
      MATCH (p:Person {id: $personId})
      MATCH (s:Skill {name: $skillName})
      MERGE (p)-[:HAS_SKILL]->(s)
    `, { personId, skillName });
    return true;
  } finally {
    await session.close();
  }
};

module.exports = {
  getPersonById,
  getSkillGap,
  getRecommendations,
  getAllPersons,
  addSkillToPerson
};
