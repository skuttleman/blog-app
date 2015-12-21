var knex = require('knex')({
  dialect: 'pg',
  connection: process.env.DATABASE_URL
});

module.exports = {
  create: function(args){
    var dateTime = new Date();
    args.params.created_at = dateTime;
    args.params.updated_at = dateTime;
    return knex(args.table).insert(args.params);
  },
  readOne: function(args) {
    return knex(args.table).where(args.params).first();
  },
  readAll: function(args) {
    return knex(args.table).where(args.params || {}).orderBy(args.orderBy.column, args.orderBy.direction);
  },
  update: function(args) {
    var dateTime = new Date();
    return knex(args.table).where('id', args.id).first()
    .then(function(data) {
      args.params.updated_at = dateTime;
      if (data.user_id == args.userId) {
        return knex(args.table).where('id', args.id).update(args.params);
      } else {
        return Promise.reject('User id does not match entry id');
      }
    });
  },
  'delete': function(args) {
    return knex(args.table).where('id', args.id).first()
    .then(function(data) {
      if (data.user_id == args.userId) {
        return knex(args.table).where('id', args.id).del();
      } else {
        return Promise.reject('User id does not match entry id');
      }
    });
  }
}
