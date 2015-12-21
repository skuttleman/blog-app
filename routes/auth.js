var route = require('express').Router();
var dbAccess = require('../dbConnection/pgController');
var bcrypt = require('bcrypt');
var knex = require('knex')({
  dialect: 'pg',
  connection: process.env.DATABASE_URL
});


route.post('/signup', function(req, res) {
  var message = isValid(req.body.email || '', req.body.password || '');
  if (!message.email || !message.password) {
    res.json({ success: false, email: message.email, password: message.password });
    return;
  } else if (!req.body.handle) {
    res.json({ success: false, message: 'You must select a handle name' });
    return;
  }
  knex('user_login').where('email', req.body.email).first()
  .then(function(user) {
    if (!user) {
      var hash = bcrypt.hashSync(req.body.password, 8);
      var dateTime = new Date();
      return knex('users').returning('id').insert({
        handle: req.body.handle,
        created_at: dateTime,
        updated_at: dateTime
      }).then(function(id) {
        return knex('user_login').insert({
          id: id[0],
          email: req.body.email,
          password_hash: hash
        });
      });
    } else {
      return Promise.reject('User name already exists');
    }
  }).then(function() {
    res.json({ success: true });
  }).catch(function(err) {
    console.error(err);
    res.json({ success: false, message: err });
  });
});

route.post('/login', function(req, res) {
  knex('user_login').where('email', req.body.email).first()
  .then(function(user) {
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password_hash)) {
        return Promise.resolve(user.id);
      } else {
        return Promise.reject('User email or password does not match');
      }
    } else {
      return Promise.reject('User email or password does not match');
    }
  }).then(function(userId) {
    res.cookie('userId', userId, { signed: true, httpOnly: false });
    res.json({ success: true, userId: userId });
  }).catch(function(err) {
    console.error(err);
    res.json({ success: false, message: err });
  });
});

route.get('/logout', function(req, res) {
  res.clearCookie('userId', { signed: true });
  res.json({ success: true });
});

module.exports = route;

function isValid(email, password) {
  var ret = {};
  if (email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)) ret.email = true;
  else ret.email = false;
  if (password.match(/.{8,}/)) ret.password = true;
  else ret.password = false;
  return ret;
}
