const { getSession } = require('../config/db');

const mapNode = (node, label) => ({
  id: node.properties.id,
  label: label || node.labels[0],
  properties: node.properties
});

const getJobGraph = async (jobId) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (j:Job {id: $jobId})
      OPTIONAL MATCH (c:Company)-[r1:OFFERS]->(j)
      OPTIONAL MATCH (j)-[r2:REQUIRES]->(s:Skill)
      OPTIONAL MATCH (s)-[r3:RELATED_TO]-(s2:Skill)
      RETURN j, c, s, s2, r1, r2, r3
    `, { jobId });
    
    const nodes = new Map();
    const edges = new Map();
    
    result.records.forEach(record => {
       const j = record.get('j'); if(j) nodes.set(j.properties.id, mapNode(j, 'Job'));
       const c = record.get('c'); if(c) nodes.set(c.properties.id, mapNode(c, 'Company'));
       const s = record.get('s'); if(s) nodes.set(s.properties.id, mapNode(s, 'Skill'));
       const s2 = record.get('s2'); if(s2) nodes.set(s2.properties.id, mapNode(s2, 'Skill'));
       
       if (c && j) edges.set(`${c.properties.id}-${j.properties.id}`, {id:`${c.properties.id}-${j.properties.id}-OFFERS`, source:c.properties.id, target:j.properties.id, type:'OFFERS'});
       if (j && s) edges.set(`${j.properties.id}-${s.properties.id}`, {id:`${j.properties.id}-${s.properties.id}-REQUIRES`, source:j.properties.id, target:s.properties.id, type:'REQUIRES'});
       if (s && s2) {
           const id1 = s.properties.id; const id2 = s2.properties.id;
           const edgeId = [id1,id2].sort().join('-') + '-RELATED_TO';
           edges.set(edgeId, {id:edgeId, source:id1, target:id2, type:'RELATED_TO'});
       }
    });
    return { nodes: Array.from(nodes.values()), edges: Array.from(edges.values()) };
  } finally {
    await session.close();
  }
};

const getSkillGraph = async (skillId) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (s:Skill {id: $skillId})
      OPTIONAL MATCH (s)-[:RELATED_TO]-(s2:Skill)
      OPTIONAL MATCH (j:Job)-[:REQUIRES]->(s)
      OPTIONAL MATCH (c:Company)-[:OFFERS]->(j)
      RETURN s, s2, j, c
    `, { skillId });
    
    const nodes = new Map();
    const edges = new Map();
    
    result.records.forEach(record => {
       const s = record.get('s'); if(s) nodes.set(s.properties.id, mapNode(s, 'Skill'));
       const s2 = record.get('s2'); if(s2) nodes.set(s2.properties.id, mapNode(s2, 'Skill'));
       const j = record.get('j'); if(j) nodes.set(j.properties.id, mapNode(j, 'Job'));
       const c = record.get('c'); if(c) nodes.set(c.properties.id, mapNode(c, 'Company'));
       
       if (s && s2) {
           const id1 = s.properties.id; const id2 = s2.properties.id;
           const edgeId = [id1,id2].sort().join('-') + '-RELATED_TO';
           edges.set(edgeId, {id:edgeId, source:id1, target:id2, type:'RELATED_TO'});
       }
       if (j && s) edges.set(`${j.properties.id}-${s.properties.id}`, {id:`${j.properties.id}-${s.properties.id}-REQUIRES`, source:j.properties.id, target:s.properties.id, type:'REQUIRES'});
       if (c && j) edges.set(`${c.properties.id}-${j.properties.id}`, {id:`${c.properties.id}-${j.properties.id}-OFFERS`, source:c.properties.id, target:j.properties.id, type:'OFFERS'});
    });
    return { nodes: Array.from(nodes.values()), edges: Array.from(edges.values()) };
  } finally {
    await session.close();
  }
};

const getFullGraph = async () => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m
    `);
    
    const nodes = new Map();
    const edges = new Map();
    
    result.records.forEach(record => {
      const n = record.get('n');
      if (n) nodes.set(n.properties.id, mapNode(n, n.labels[0]));
      
      const m = record.get('m');
      if (m) nodes.set(m.properties.id, mapNode(m, m.labels[0]));
      
      const r = record.get('r');
      if (n && m && r) {
        const sourceId = n.properties.id;
        const targetId = m.properties.id;
        let edgeId = `${sourceId}-${targetId}-${r.type}`;
        if (r.type === 'RELATED_TO') {
           edgeId = [sourceId, targetId].sort().join('-') + '-RELATED_TO';
        }
        edges.set(edgeId, {
            id: edgeId,
            source: sourceId,
            target: targetId,
            type: r.type
        });
      }
    });

    return { nodes: Array.from(nodes.values()), edges: Array.from(edges.values()) };
  } finally {
    await session.close();
  }
};

module.exports = {
  getJobGraph,
  getSkillGraph,
  getFullGraph
};
