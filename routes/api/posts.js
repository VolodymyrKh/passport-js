const express = require('express');
const router = express.Router();

// @route GET api/posts
// @desc '/' posts route
// @access Public
router.get('/', (req, res) => res.json({msg: 'Posts route works.'}))

module.exports = router;