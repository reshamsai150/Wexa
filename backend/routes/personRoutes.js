const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');

router.get('/', personController.getAllPersons);
router.get('/:personId', personController.getPersonById);
router.get('/:personId/skill-gaps', personController.getSkillGap);
router.get('/:personId/recommendations', personController.getRecommendations);
router.post('/:personId/skills', personController.addSkill);

module.exports = router;
