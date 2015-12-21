var route = require('express').Router();
var comments = require('./comments');
var blogs = require('./blogs');
var dbAccess = require('../dbConnection/pgController');


//crud routes
route.use('/:id', function(req, res, next) {
  req.commentParent = {
    key: 'user_id',
    value: req.params.id
  };
  req.blogParent = { user_id: req.params.id };
  next();
});

route.use('/:id/comments', comments);
route.use('/:id/blogs', blogs);

// CREATE

// READ
route.get('/', function(req, res) {
  dbAccess.readAll({
    table: 'users',
    orderBy: {
      column: 'created_at',
      direction: 'desc'
    }
  }).then(function(users) {
    res.json(users);
  }).catch(function(err){
    console.error(err);
    res.json ({ success: false, message: err });
  });
});

route.get('/:id', function(req,res) {
  var id = req.params.id;
  dbAccess.readOne({
    table: 'users',
    params: { id: id }
  }).then(function(user) {
    res.json(user);
  }).catch(function(err) {
    console.error(err);
    res.json ({ success: false, message: err });
  });
});

module.exports = route;
