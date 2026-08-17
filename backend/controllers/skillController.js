const skillService = require('../services/skillService');

const getAllSkills = async (req, res, next) => {
  try {
    const skills = await skillService.getAllSkills();
    res.json(skills);
  } catch (error) {
    next(error);
  }
};

const getSkillById = async (req, res, next) => {
  try {
    const skill = await skillService.getSkillById(req.params.skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json(skill);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  getSkillById
};
