const express = require('express');
const router = express.Router();
const School = require("../controllers/school");

const school = new School();

router.get('/', (req, res) => school.getSchools(req, res));

router.post('/', (req, res) => school.addNewSchool(req, res));

module.exports = router;