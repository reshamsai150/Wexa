const personService = require('../services/personService');

const getPersonById = async (req, res, next) => {
  try {
    const person = await personService.getPersonById(req.params.personId);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    res.json(person);
  } catch (error) {
    next(error);
  }
};

const getSkillGap = async (req, res, next) => {
  try {
    const { personId, jobId } = req.params;
    // Actually the PRD asks for /api/person/:personId/skill-gaps
    // Usually we pass target job in query params, e.g., ?jobId=...
    const targetJobId = req.query.jobId;
    if (!targetJobId) {
      return res.status(400).json({ message: 'Missing target jobId in query parameters' });
    }
    const gaps = await personService.getSkillGap(personId, targetJobId);
    res.json(gaps);
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await personService.getRecommendations(req.params.personId);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

const getAllPersons = async (req, res, next) => {
  try {
    const persons = await personService.getAllPersons();
    res.json(persons);
  } catch (error) {
    next(error);
  }
};

const addSkill = async (req, res, next) => {
  try {
    const { personId } = req.params;
    const { skillName } = req.body;
    if (!skillName) {
      return res.status(400).json({ message: 'Missing skillName in body' });
    }
    await personService.addSkillToPerson(personId, skillName);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPersonById,
  getSkillGap,
  getRecommendations,
  getAllPersons,
  addSkill
};
