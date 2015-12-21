DROP TABLE if EXISTS user_login;
DROP TABLE if EXISTS comments;
DROP TABLE if EXISTS blogs;
DROP TABLE if EXISTS users;

CREATE TABLE users (
  id serial primary key,
  handle varchar(255) UNIQUE,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE blogs (
  id serial primary key,
  title varchar(255),
  user_id int references users(id) on delete cascade,
  body text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE comments (
  id serial primary key,
  body text,
  user_id int references users(id) on delete cascade,
  blog_id int references blogs(id) on delete cascade,
  comment_id int references comments(id) on delete cascade,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE user_login (
  id int primary key references users(id) on delete cascade,
  email varchar(255) UNIQUE,
  password_hash varchar(255)
);
