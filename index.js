var express = require('express');
var app = express();
require('dotenv').load();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SECRET));
app.use(express.static(__dirname + '/public'));


var blogs = require('./routes/blogs');
var auth = require('./routes/auth');
var users = require('./routes/users');

app.use('/blogs', blogs);
app.use('/auth', auth);
app.use('/users', users);



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
