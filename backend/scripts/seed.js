const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USERNAME || process.env.COGNODB_USER;
const password = process.env.COGNODB_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const seedData = async () => {
  const session = driver.session();
  try {
    console.log('Clearing existing database...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('Seeding initial data...');
    
    // Create Skills
    await session.run(`
      UNWIND [
        'Java', 'JavaScript', 'Python', 'React', 'Node.js', 
        'TypeScript', 'SQL', 'MongoDB', 'Docker', 'AWS', 
        'Git', 'REST API', 'GraphQL', 'Spring Boot', 'Express',
        'Machine Learning', 'TensorFlow', 'PyTorch', 'Flask', 'FastAPI',
        'Next.js', 'Redux', 'Testing', 'HTML', 'CSS'
      ] AS skillName
      CREATE (:Skill {id: randomUUID(), name: skillName})
    `);

    // Create Jobs
    await session.run(`
      UNWIND [
        {title: 'Frontend Engineer', level: 'Entry Level', description: 'Build modern web applications.'},
        {title: 'Backend Engineer', level: 'Mid Level', description: 'Build scalable APIs.'},
        {title: 'Full Stack Developer', level: 'Mid Level', description: 'End-to-end web development.'},
        {title: 'AI Engineer', level: 'Senior', description: 'Develop intelligent systems.'},
        {title: 'React Developer', level: 'Entry Level', description: 'Specialized React development.'},
        {title: 'Web Developer', level: 'Entry Level', description: 'General web development.'}
      ] AS jobInfo
      CREATE (:Job {id: randomUUID(), title: jobInfo.title, level: jobInfo.level, description: jobInfo.description})
    `);

    // Create Companies
    await session.run(`
      UNWIND [
        {name: 'Acme AI', industry: 'AI', location: 'Hyderabad'},
        {name: 'TechNova', industry: 'Software', location: 'Bangalore'},
        {name: 'CloudWorks', industry: 'Cloud Computing', location: 'Pune'}
      ] AS compInfo
      CREATE (:Company {id: randomUUID(), name: compInfo.name, industry: compInfo.industry, location: compInfo.location})
    `);

    // Create People
    await session.run(`
      UNWIND [
        {name: 'Alice', email: 'alice@example.com'},
        {name: 'Bob', email: 'bob@example.com'}
      ] AS personInfo
      CREATE (:Person {id: randomUUID(), name: personInfo.name, email: personInfo.email})
    `);

    // Connect Job to Skill (REQUIRES)
    const jobSkills = {
      'Frontend Engineer': ['JavaScript', 'React', 'TypeScript', 'REST API', 'Testing', 'HTML', 'CSS', 'Next.js'],
      'React Developer': ['JavaScript', 'React', 'HTML', 'CSS', 'Redux'],
      'Backend Engineer': ['Node.js', 'Express', 'SQL', 'MongoDB', 'REST API', 'Docker'],
      'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST API', 'TypeScript'],
      'AI Engineer': ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'FastAPI', 'SQL'],
      'Web Developer': ['JavaScript', 'HTML', 'CSS', 'React', 'REST API']
    };

    for (const [jobTitle, skills] of Object.entries(jobSkills)) {
      await session.run(`
        MATCH (j:Job {title: $jobTitle})
        UNWIND $skills AS skillName
        MATCH (s:Skill {name: skillName})
        MERGE (j)-[:REQUIRES]->(s)
      `, { jobTitle, skills });
    }

    // Connect Company to Job (OFFERS)
    await session.run(`
      MATCH (c:Company {name: 'Acme AI'})
      MATCH (j:Job) WHERE j.title IN ['Frontend Engineer', 'AI Engineer']
      MERGE (c)-[:OFFERS]->(j)
    `);
    
    await session.run(`
      MATCH (c:Company {name: 'TechNova'})
      MATCH (j:Job) WHERE j.title IN ['Full Stack Developer', 'React Developer', 'Web Developer']
      MERGE (c)-[:OFFERS]->(j)
    `);

    // Connect Skill to Skill (RELATED_TO)
    const relatedSkills = [
      ['JavaScript', 'TypeScript'],
      ['JavaScript', 'React'],
      ['React', 'Next.js'],
      ['React', 'Redux'],
      ['Node.js', 'Express'],
      ['Python', 'Machine Learning'],
      ['Machine Learning', 'TensorFlow'],
      ['Machine Learning', 'PyTorch']
    ];

    for (const [skill1, skill2] of relatedSkills) {
      await session.run(`
        MATCH (s1:Skill {name: $skill1}), (s2:Skill {name: $skill2})
        MERGE (s1)-[:RELATED_TO]->(s2)
        MERGE (s2)-[:RELATED_TO]->(s1)
      `, { skill1, skill2 });
    }

    // Connect Person to Skill (HAS_SKILL)
    // Let's make Alice a frontend person looking to grow
    await session.run(`
      MATCH (p:Person {name: 'Alice'})
      UNWIND ['JavaScript', 'React', 'HTML', 'CSS', 'REST API'] AS skillName
      MATCH (s:Skill {name: skillName})
      MERGE (p)-[:HAS_SKILL]->(s)
    `);

    // Let's make Bob a backend person
    await session.run(`
      MATCH (p:Person {name: 'Bob'})
      UNWIND ['Node.js', 'Express', 'SQL', 'MongoDB'] AS skillName
      MATCH (s:Skill {name: skillName})
      MERGE (p)-[:HAS_SKILL]->(s)
    `);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await session.close();
    await driver.close();
  }
};

seedData();
