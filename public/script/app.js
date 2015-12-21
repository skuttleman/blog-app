function loadBlogs() {
  $.get(server + 'blogs').done(function(blogs) {
    blogs.forEach(function(blog) {
      blog.summary = blog.body.length > 50 ? blog.body.substring(0, 50) + '...' : blog.body;
    });
    var template = Handlebars.compile(Handlebars.partials.blogsview);
    $('.main').html(template({ blogs: blogs, compareId: localStorage.templateId }));
  });
  loading();
}

function loadBlog(id) {
  Promise.all([
    $.get(server + 'blogs/' + id),
    $.get(server + 'blogs/' + id + '/comments')
  ]).then(function(data) {
    var elements = data[1].concat(data[0]), usersNeeded = [];
    elements.forEach(function(element) {
      element.updated_at = formatDate(element.updated_at);
      var userId = Number(element.user_id);
      element.compareId = localStorage.templateId;
      if (!usersNeeded[userId]) {
        usersNeeded[userId] = new Promise(function(success, failure) {
          $.get(server + 'users/' + userId).done(function(user) {
            success(user);
          });
        });
      }
    });
    var template = Handlebars.compile(Handlebars.partials.blogview);
    var commentStack = stack(data[1]);
    Promise.all(usersNeeded).then(function(users) {
      elements.concat(data[0]).forEach(function(element) {
        var userId = Number(element.user_id);
        element.user = users[userId];
      });
      $('.main').html(template({ blogs: [data[0]], comments: commentStack }));
    });
  });
  loading();
}

function newBlog() {
  editBlog('undefined', 'Create Blog', 'postBlog');
}

function editBlog(id, submitText, method) {
  var template = Handlebars.compile(Handlebars.partials.blogform);
  var $modular = $('.modular');
  var title = $('.blog-title').text(), body = $('.blog-content').text();
  $modular.html(template({
    title: title, body: body, submitText: submitText || 'Update Blog', method: method || 'putBlog',
    params: id
  }));
  $('#title').val(title);
  $modular.removeClass('hidden');
}

function postBlog(event) {
  event.preventDefault();
  var formdata = getFormData('form');
  $.ajax({
    url: server + 'blogs/',
    method: 'post',
    data: formdata
  }).done(function(data) {
    loadBlogs();
  });
  $('.modular').html('').addClass('hidden');
}

function putBlog(event, blogId) {
  event.preventDefault();
  var formdata = getFormData('form');
  $.ajax({
    url: server + 'blogs/' + blogId,
    method: 'put',
    data: formdata
  }).done(function(data) {
    loadBlog(blogId);
  });
  $('.modular').html('').addClass('hidden');
}

function deleteBlog(id) {
  var template = Handlebars.compile(Handlebars.partials.modularform);
  var $modular = $('.modular');
  $modular.html(template({
    prompt: 'Are you sure you want to delete this blog post (this process cannot be undone)?',
    method: 'deleteBlogConfirmed', params: id
  }));
  $modular.removeClass('hidden');
}

function deleteBlogConfirmed(event, blogId) {
  event.preventDefault();
  $.ajax({
    url: server + 'blogs/' + blogId,
    method: 'delete'
  }).done(function(data) {
    loadBlogs();
  });
}

function addComment(blogId, parentId, submitText, method, commentSelector) {
  var template = Handlebars.compile(Handlebars.partials.commentform);
  var $modular = $('.modular');
  var params = [blogId];
  if (parentId) params.push(parentId);
  var body = commentSelector ? $(commentSelector).text() : '';
  $modular.html(template({
    submitText: submitText || 'Add Comment', method: method || 'postComment',
    params: params.join(), body: body || ''
  }));
  $modular.removeClass('hidden');
}

function postComment(event, blogId, parentId) {
  event.preventDefault();
  var formdata = getFormData('form');
  if (parentId) formdata.commentId = parentId;
  $.ajax({
    url: server + 'blogs/' + blogId + '/comments',
    method: 'post',
    data: formdata
  }).done(function(data) {
    loadBlog(blogId);
  });
  $('.modular').html('').addClass('hidden');
}

function editComment(commentId) {
  addComment(commentId, undefined, 'Update Comment', 'putComment', '.comment-body--' + commentId);
}

function putComment(event, commentId) {
  event.preventDefault();
  var formdata = getFormData('form');
  var blogId = $('.blog-title').data().blog;
  $.ajax({
    url: server + 'blogs/' + blogId + '/comments/' + commentId,
    method: 'put',
    data: formdata
  }).done(function(data) {
    loadBlog(blogId);
  });
  $('.modular').html('').addClass('hidden');
}

function deleteComment(id) {
  var template = Handlebars.compile(Handlebars.partials.modularform);
  var $modular = $('.modular');
  $modular.html(template({
    prompt: 'Are you sure you want to delete this comment (this process cannot be undone)?',
    method: 'deleteCommentConfirmed', params: id
  }));
  $modular.removeClass('hidden');
}

function deleteCommentConfirmed(event, commentId) {
  event.preventDefault();
  var blogId = $('.blog-title').data().blog;
  $.ajax({
    url: server + 'blogs/' + blogId + '/comments/' + commentId,
    method: 'delete'
  }).done(function(data) {
    console.log(data);
    loadBlog(blogId);
  });
}

function promisifyPartial(partial) {
  return new Promise(function(success, failure) {
    $.get(partial.file).done(function(text) {
      Handlebars.registerPartial(partial.name, text);
      success(true);
    }).fail(function(err) {
      failure(err);
    });
  });
}

function promiseToLoad() {
  return new Promise(function(success) {
    $(document).ready(function() {
      success(true);
    });
  });
}

Promise.all([
  // pieces
  promisifyPartial({ name: 'blog', file: '/templates/blog.hbs' }),
  promisifyPartial({ name: 'comment', file: '/templates/comment.hbs' }),
  promisifyPartial({ name: 'summary', file: '/templates/summary.hbs' }),
  // views
  promisifyPartial({ name: 'blogview', file: '/templates/blog-view.hbs'}),
  promisifyPartial({ name: 'blogsview', file: '/templates/blogs-view.hbs'}),
  // forms
  promisifyPartial({ name: 'blogform', file: '/templates/blog-form.hbs'}),
  promisifyPartial({ name: 'commentform', file: '/templates/comment-form.hbs'}),
  promisifyPartial({ name: 'modularform', file: '/templates/modular-form.hbs'}),
  promisifyPartial({ name: 'loginform', file: '/templates/login-form.hbs'}),
  // Document Ready?
  promiseToLoad()
]).then(loadBlogs);

Handlebars.registerHelper('compare', function(val1, val2, options) {
  if (val1 == val2) return options.fn(this);
  else return options.inverse(this);
});

// Recursive Comment stack
function stack(comments, parent, level) {
  var ret = comments.filter(function(comment) {
    return comment.comment_id == parent;
  });
  ret.forEach(function(comment) {
    comment.level = level || 0;
    comment.subcomments = stack(comments, comment.id, comment.level + 1);
  });
  return ret;
}

function loading() {
  $('.main').html('<p class="loading">Loading...</p>');
}

function cancel(event) {
  event.preventDefault();
  $('.modular').addClass('hidden');
}

function logOut() {
  localStorage.clear();
  $.get(server + 'auth/logout').done(function(data) {
    window.location.reload(true);
  });
}

function sendLogIn(event) {
  event.preventDefault();
  var formdata = getFormData('form');
  if (formdata.email && formdata.password) {
    $.ajax({
      url: server + 'auth/login',
      method: 'post',
      data: formdata
    }).done(function(data) {
      if (data.success) {
        localStorage.templateId = data.userId;
        window.location.reload(true);
      } else {
        console.log(data);
      }
    });
  }
  $('.modular').html('').addClass('hidden');
}

function logIn() {
  var template = Handlebars.compile(Handlebars.partials.loginform);
  var $modular = $('.modular');
  $modular.html(template({ method: 'sendLogIn', submitText: 'Log In' }));
  $modular.removeClass('hidden');
}

function sendSignUp(event) {
  event.preventDefault();
  var formdata = getFormData('form');
  if (formdata.handle && formdata.email && formdata.password) {
    $.ajax({
      url: server + 'auth/signup',
      method: 'post',
      data: formdata
    }).done(function(data) {
      if (data.success) {
        $.ajax({
          url: server + 'auth/login',
          method: 'post',
          data: formdata
        }).done(function(data) {
          if (data.success) {
            localStorage.templateId = data.userId;
            window.location.reload(true);
          } else {
            console.log(data);
          }
        });
      } else {
        console.log(data);
      }
    });
  }
  $('.modular').html('').addClass('hidden');
}

function signUp(event) {
  if (event) event.preventDefault();
  var template = Handlebars.compile(Handlebars.partials.loginform);
  var $modular = $('.modular');
  $modular.html(template({ method: 'sendSignUp', submitText: 'Sign Up', needsHandle: true }));
  $modular.removeClass('hidden');
}

function getFormData(selector) {
  var ret = {};
  Array.prototype.forEach.call($(selector).children(), function(element) {
    if (element.tagName === 'INPUT') ret[element.id] = element.value;
    else if (element.tagName === 'TEXTAREA') ret[element.id] = element.value || element.innerHTML;
  });
  return ret;
}

function formatDate(string) {
  var date = new Date(string);
  var year = String(date.getYear() + 1900), month = zeroPad(date.getMonth() + 1, 2),
    day = zeroPad(date.getDate(), 2), hour = date.getHours(),
    minute = zeroPad(date.getMinutes(), 2), second = zeroPad(date.getSeconds(), 2);
  var ret = [[year, month, day].join('-')].concat([hour, minute, second].join(':')).join(' ');
  return ret;
}

function zeroPad(number, minLength) {
  var ret = String(number);
  while (ret.length < minLength) ret = '0' + ret;
  return ret;
}

var server = '/';

$(document).ready(function() {
  if(document.cookie.split('userId=').length > 1) {
    $('.logo').append('<button class="nav-button log-out" onclick="logOut();">Log Out</button>');
  } else {
    $('.logo').append('<button class="nav-button log-in" onclick="logIn();">Log In</button>');
    $('.logo').append('<button class="nav-button sign-up" onclick="signUp();">Sign Up</button>');
  }
});

