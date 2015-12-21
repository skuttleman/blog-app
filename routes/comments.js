var route = require('express').Router();
var dbAccess = require('../dbConnection/pgController');

// CREATE
route.post('/', function(req, res) {
  var userId = req.signedCookies.userId;
  if (!userId) {
    res.json({ success: false, message: 'You  must be logged in to preform this action.' });
    return;
  } else if (!req.body.body) {
    res.json({ success: false, message: 'Comments must have a body.' });
    return;
  } else if (req.commentParent.key === 'user_id') {
    res.json({ success: false, message: 'Comments cannot be posted to a user' });
    return;
  }

  dbAccess.create({
    table: 'comments',
    params: {
      user_id: userId,
      body: req.body.body,
      [req.commentParent.key]: req.commentParent.value,
      comment_id: req.body.commentId
    }
  }).then(function() {
    res.json({ success: true });
  }).catch (function(err) {
    console.error(err);
    res.json ({ success: false, message: err });
  });
});

// READ
route.get('/', function(req, res) {
  dbAccess.readAll({
    table: 'comments',
    params: {
      [req.commentParent.key]: req.commentParent.value
    },
    orderBy: {
      column: 'created_at',
      direction: 'desc'
    }
  }).then(function(comments) {
    res.json(comments || []);
  }).catch(function(err) {
    console.error(err);
    res.json ({ success: false, message: err });
  });
});

// route.get('/filter-by-parent/:parent', function(req, res) {
//   var parentId = req.params.parent === 'NULL' ? null : req.params.parent;
//   dbAccess.readAll({
//     table: 'comments',
//     params: {
//       [req.commentParent.key]: req.commentParent.value,
//       blog_id: parentId
//     },
//     orderBy: {
//       column: 'updated_at',
//       direction: 'desc'
//     }
//   }).then(function(comments) {
//     res.json(comments);
//   }).catch(function(err) {
//     console.error(err);
//     res.json ({ success: false, message: err });
//   });
// });

route.get('/:id', function(req, res) {
  var id = req.params.id
  dbAccess.readOne({
    table: 'comments',
    params: { id: id }
  }).then(function(comment) {
    res.json(comment || {});
  }).catch(function(err) {
    console.error(err);
    res.json ({ success: false, message: err });
  });
});

// UPDATE
route.put('/:id', function(req,res) {
  var id = req.params.id;
  var userId = req.signedCookies.id;
  if (!userId) {
    res.json({ success: false, message: 'You  must be logged in to preform this action.' });
    return;
  }
  dbAccess.update({
    table: 'comments',
    id: id,
    userId: userId,
    params: {
      body: req.body.body
    }
  }).then(function() {
    res.json ({ success: true });
  }).catch(function(err) {
    console.error(err);
    res.json({ success: false, message: err });
  });
});

// DELETE
route['delete']('/:id', function(req, res) {
  var id = req.params.id;
  var userId = req.signedCookies.userId;
  if (!userId) {
    res.json({ success: false, message: 'You  must be logged in to preform this action.' });
    return;
  }
  dbAccess['delete']({
    table: 'comments',
    id: id,
    userId: userId
  }).then(function() {
    res.json({ success: true });
  }).catch(function(err) {
    console.error(err);
    res.json({ success: false, message: err });
  });
});

module.exports = route;
