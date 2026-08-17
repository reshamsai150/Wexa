const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graphController');

router.get('/job/:jobId', graphController.getJobGraph);
router.get('/skill/:skillId', graphController.getSkillGraph);
router.get('/', graphController.getFullGraph);

module.exports = router;
