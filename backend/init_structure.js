const fs = require('fs');
const path = require('path');

const dirs = ['routes', 'controllers', 'services'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

const entities = ['job', 'skill', 'person', 'graph'];

entities.forEach(entity => {
  // route
  const routeContent = `const express = require('express');\nconst router = express.Router();\nconst ${entity}Controller = require('../controllers/${entity}Controller');\n\nmodule.exports = router;\n`;
  fs.writeFileSync(path.join(__dirname, 'routes', `${entity}Routes.js`), routeContent);

  // controller
  const controllerContent = `const ${entity}Service = require('../services/${entity}Service');\n\nmodule.exports = {};\n`;
  fs.writeFileSync(path.join(__dirname, 'controllers', `${entity}Controller.js`), controllerContent);

  // service
  const serviceContent = `const { getSession } = require('../config/db');\n\nmodule.exports = {};\n`;
  fs.writeFileSync(path.join(__dirname, 'services', `${entity}Service.js`), serviceContent);
});

console.log('Structure initialized');
