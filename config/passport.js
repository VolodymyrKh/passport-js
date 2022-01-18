const JwtStrategy = require('passport-jwt').Strategy;
// const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const { secretOrKey } = require('../config/keys');

const cookieTokenExtractor = req => {
  let token;
  if(req.cookies && req.cookies.token) {
    token = req.cookies['token'];
  }
  return token;
};

const opts = {};

opts.jwtFromRequest = cookieTokenExtractor;
opts.secretOrKey = secretOrKey;

const authenticate = (passport) => {
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.sub)
      .then(user => {
        if(!!user) {          
          return done(null, user);
        }
        return done(null, false);
      })
      .catch(err => console.log(err));
  }));
};

module.exports = authenticate;