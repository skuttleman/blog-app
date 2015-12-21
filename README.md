# blogTown

This is my first full stack app. It's a simple blogging platform complete with comment trees and user creation/authentication

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

You will need to seed a db with db/schema.sql
and set environment variables:
DATABASE_URL - pointed to your database
SECRET - any string of characters used for hashing passwords stored in the database

```sh
$ git clone git@github.com:skuttleman/blog-app.git # or clone your own fork
$ cd blog-app
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).
