/**
* @fileoverview Entry point of the myFlix application backend.
* @module app
* @requires mongoose
* @requires ./models.js
* @requires express-validator
* @requires find-config
* @requires dotenv
* @requires fs
* @requires path
* @requires body-parser
* @requires uuid
* @requires cors
* @requires ./auth
* @requires passport
* @requires ./passport
*/

const express = require('express'), 
      fs = require("fs"),
      path = require("path"),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      uuid = require('uuid');
const app = express();
const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

/**
* connect to online database using enviormental variable
*/
//mongoose.connect('mongodb://127.0.0.1:27017/MyMovieApp');
mongoose.set('strictQuery', true);
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());


let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


// Middlewares
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
app.use(morgan('common', {
    stream: accessLogStream
}));
app.use(express.static('public'));

/**
Sends a welcome message on the main page.
* @function
* @method GET to endpoint '/'
* @name welcome
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - The HTTP response object with a welcome message
*/

app.get('/', (req, res) => {
  res.send('Welcome to MyMovieApp!!!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

/**
Retrieves a list of all movies.
* @function
* @method GET to endpoint '/movies'
* @name getMovies
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - The HTTP response object with a list of movies
*/

//get all movies 
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({}).then(movies => {
    res.status(200).send(movies);
  }).catch(e => {
    console.error('Error getting movies from Database', e)
  })
});

/**
Retrieves information about a movie by title.
* @function
* @method GET to endpoint '/movies/:title'
* @name getMovieByTitle
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - The HTTP response object with information about one movie
*/

//return data on movies by title 
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const title = req.params.title;
  const result = await Movies.findOne({Title: title})
  if (result) {
    return res.status(200).send(result);
  }
  return res.status(404).send("The movie you are looking for is not found!")
});

/**
Retrieves information about a genre.
* @function
* @method GET to endpoint '/movies/genres/:Name'
* @name getGenreByName
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - The HTTP response object with information about one genre
*/

//return data about genre
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({"Genre.Name": req.params.Name}).then(movies => {
    res.status(200).send(movies.Genre);
  }).catch(e => {
    console.error('Error getting movies by Genre Name from DB', e)
  })
});


/**
Retrieves information about a movie director by their name.
* @function
* @method GET to endpoint '/movies/directors/:directorName'
* @name getDirectorByName
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - The HTTP response object with information about one movie director
*/

//return data about director
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({"Director.Name": req.params.directorName}).then(movies => {
    res.status(200).send(movies.Director);
  }).catch(e => {
    console.error('Error getting movies by Director Name from DB', e)
  })
});

/**
* Allows new users to register. 
* Checks if all the required fields are filled in correctly.
* Hashes the password before storing it in the database.
* Checks if the user already exists in the database.
* @function
* @method POST to endpoint '/users'
* @name addUser
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - A JSON object holding the data of the newly created user
*/

//Add a user
app.post('/users',
    [
      check('Username', 'Username is required').isLength({min: 5}),
      check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
      check('Password', 'Password is required').not().isEmpty(),
      check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
      let errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      Users
        .create({
          Username: req.body.Username,
          Password: hashedPassword, 
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        .then((user) =>{res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

/**
Retrieves a list of all users.
* @function
* @method GET to endpoint '/users'
* @name getUsers
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - The HTTP response object with a list of users
*/

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
* Retrieves information about a specific user by the username.
* @function
* @method GET to endpoint '/users/:Username'
* @name getUserByUsername
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - A JSON object holding the data of the user
*/

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
* Allows users to update their data. 
* @function
* @method PUT to endpoint '/users/:Username'
* @name updateUser
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - A JSON object holding the updated data of the user
*/

//allow users to update their user info
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
    [
      check('Username', 'Username is required').isLength({min: 5}),
      check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
      check('Password', 'Password is required').not().isEmpty(),
      check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => { 
      let errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
  const hashedPassword = Users.hashPassword(req.body.Password);    
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, 
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

/**
Allows users to add a new movie to their favorite movies array
* @function
* @method POST to endpoint /users/:Username/movies/:MovieID'
* @name addFavoriteMovie
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - A JSON object holding the updated data of the user
*/

//allow users to add movie to favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, 
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

/**
* Allows users to remove a movie from their favorite movies array
* @function
* @method DELETE to endpoint /users/:Username/movies/:MovieID'
* @name removeFavoriteMovie
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {object} - A JSON object holding the updated data of the user
*/

//allow users to remove movie from favorites list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
}); 

/**
Allows users to delete their account from the database (deregister)
* @function
* @method DELETE to endpoint /users/:Username'
* @name deleteUser
* @param {object} request - The HTTP request object
* @param {object} response - The HTTP response object
* @returns {string} -  A message about the successful deletion
*/

//allow users to deregister
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Error 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is not working, oops!');
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});