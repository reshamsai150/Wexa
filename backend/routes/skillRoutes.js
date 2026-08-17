const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

router.get('/', skillController.getAllSkills);
router.get('/:skillId', skillController.getSkillById);

module.exports = router;
