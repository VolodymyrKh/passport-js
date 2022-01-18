const express = require('express');
const router = express.Router();
const { DateTime, Duration } = require('luxon');
const { v4: uuid } = require('uuid');
const passport = require('passport');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = require('../../config/keys').secretOrKey;


// User model
const User = require('../../models/User');

// @route GET api/users/register
// @desc Register users
// @access Public
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
        if (!!user) {
          return res.status(400).json({msg: `User with ${req.body.email} email already exists.`});
        } else {
            const avatar = gravatar.url(req.body.email, {
              s: '200', // Size
              r: 'pg',  // Rating
              d: 'mm'   // Default
            })

            const newUser = new User({
              name: req.body.name,
              email: req.body.email,
              avatar,
              password: req.body.password  
            });

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) {throw err};
                newUser.password = hash;
                newUser.save()
                  .then(user => res.json(user))
                  .catch(err =>console.log(err));
              })  
            })
        }
    });
});

// @route GET api/users/login
// @desc Login users / Return JWT Token
// @access Public
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  User.findOne({ email })
    .then(user => {
      if(!user) {
        return res.status(404).json({msg: `User with ${req.body.email} email is not found.`});  
      }
      // Check password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if(isMatch) {
            // User exists and password matched  
            const payload = { 
              jti: uuid(),
              sub: user.id,  
              exp: Math.round(DateTime.now().plus(Duration.fromISO('PT1M')).toSeconds())
             };
            // Sign Token
            jwt.sign(payload, secret, (err, token) => {
              res.cookie('token', token).json({
                success: true,
                token
              });
            });
             
          } else {
              return res.status(400).json({ msg: 'Password incorrect.' })
          } 
        });
    });
});

// @route GET api/users/current
// @desc Return current user
// @access Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { id, name, email } = req.user;
  res.json({ id, name, email });
});

module.exports = router;