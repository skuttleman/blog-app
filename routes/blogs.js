var route = require('express').Router();
var comments = require('./comments');
var dbAccess = require('../dbConnection/pgController');


//crud routes
route.use('/:id', function(req, res, next) {
  req.commentParent = {
    key: 'blog_id',
    value: req.params.id
  };
  next();
});

route.use('/:id/comments', comments);

// CREATE
route.post('/', function(req, res) {
  var userId = req.signedCookies.userId;
  if (!userId) {
    res.json({ success: false, message: 'You  must be logged in to preform this action.' });
    return;
  } else if (!req.body.title || !req.body.body) {
    res.json({ success: false, message: 'Blog posts must have a title and a body.' });
    return;
  }
  dbAccess.create({
    table: 'blogs',
    params: {
      title: req.body.title,
      user_id: userId,
      body: req.body.body
    }
  }).then(function() {
    res.json({ success: true });
  }).catch(function(err) {
    console.error(err);
    res.json({ success: false, message: err });
  });
});

// READ
route.get('/', function(req, res) {
  dbAccess.readAll({
    table: 'blogs',
    params: req.blogParent,
    orderBy: {
      column: 'created_at',
      direction: 'desc'
    }
  }).then(function(blogs) {
    res.json(blogs || []);
  }).catch(function(err){
    console.error(err);
    res.json ({ success: false, message: err });
  });
});

route.get('/:id', function(req,res) {
  var id = req.params.id;
  var params = { id: id };
  if (req.blogParent) params.user_id = req.blogParent.user_id;
  dbAccess.readOne({
    table: 'blogs',
    params: params
  }).then(function(blog) {
    res.json(blog || {});
  }).catch(function(err) {
    console.error(err);
    res.json ({ success: false, message: err });
  });
});

// UPDATE
route.put('/:id', function(req, res) {
  var id = req.params.id;
  var userId = req.signedCookies.userId;
  if (!userId) {
    res.json({ success: false, message: 'You  must be logged in to preform this action.' });
    return;
  }
  var params = {};
  if (req.body.title) params.title = req.body.title;
  if (req.body.body) params.body = req.body.body;
  dbAccess.update({
    table: 'blogs',
    id: id,
    userId: userId,
    params: params
  }).then(function() {
    res.json ({ success: true });
  }).catch(function(err) {
    console.error(err);
    res.json({ success: false, message: err });
  });
});

// DELETE
route['delete']('/:id', function(req, res){
  var id = req.params.id;
  var userId = req.signedCookies.userId;
  if (!userId) {
    res.json({ success: false, message: 'You  must be logged in to preform this action.' });
    return;
  }
  dbAccess['delete']({
    table: 'blogs',
    id: id,
    userId: userId
  }).then(function() {
    res.json ({ success: true });
  }).catch(function(err) {
    console.error(err);
    res.json({ success: false, message: err });
  });
});

module.exports = route;
