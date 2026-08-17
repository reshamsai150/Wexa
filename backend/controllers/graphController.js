const graphService = require('../services/graphService');

const getJobGraph = async (req, res, next) => {
  try {
    const data = await graphService.getJobGraph(req.params.jobId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getSkillGraph = async (req, res, next) => {
  try {
    const data = await graphService.getSkillGraph(req.params.skillId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getFullGraph = async (req, res, next) => {
  try {
    const data = await graphService.getFullGraph();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobGraph,
  getSkillGraph,
  getFullGraph
};
