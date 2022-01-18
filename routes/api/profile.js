const express = require('express');
const router = express.Router();

// @route GET api/prifile/
// @desc '/' profile route
// @access Public
router.get('/', (req, res) => res.json({msg: 'Profile route works.'}))

module.exports = router;