/** 
 * Movie API Documentation 
 * The API URL is: https://myflix-5sws.onrender.com
*/

// required frameworks, packages
const express= require("express"),
    morgan= require("morgan"),
    fs= require('fs'),
    path= require('path'),
    bodyParser= require('body-parser'),
    uuid= require('uuid'),
    mongoose= require('mongoose');

const app= express();

const {check, validationResult}= require('express-validator');

// use of body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/** 
 * The API is CORS protected. The only origins it allows are:
 *
 *  - 'https://darkpfeffer-myflix.netlify.app',
 *  - 'https://darkpfeffer.github.io',
 *  - 'http://localhost:1234',
 *  - 'http://localhost:4200'
 */
const cors= require('cors');
const allowedOrigins= [
    'https://darkpfeffer-myflix.netlify.app',
    'https://darkpfeffer.github.io', 
    'http://localhost:1234',
    'http://localhost:4200'
]

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) {
            return callback(null, true)
        };
        if(allowedOrigins.indexOf(origin) === -1) {
            let message= `The CORS policy for this application doesn't allow access from origin` + origin;
            return callback(new Error(message), false)
        };
        return callback(null, true)
    }
}))

// import auth.js file
let auth= require('./auth')(app); //This ensures that Express is available in "auth.js"

//import Passport
const passport= require('passport');
require('./passport');

// add Schemas to the API
const Models= require('./models.js');

const Movies= Models.Movie;
const Users= Models.User;

mongoose.connect( process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect('mongodb://127.0.0.1:27017/moviedbnosql', {useNewUrlParser: true, useUnifiedTopology: true});

// logging with 'morgan'
const accessLogStream= fs.createWriteStream(path.join('./log.txt'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

// use 'express.static('public'))' to reach the public folder through the port

app.use(express.static('public'));

/** 
 * API Endpoints 
 * */
//CREATE

/** @function Add a user 
* @summary Adds a new user to the database.
*
* - Endpoint URL: '/users'
* - Method type: 'POST'
* - Format of data expected in the body of the request: 'JSON'
* - Format of the response data: 'JSON'
* 
* Expected JSON format:
*
* {
* 
*     (ID: Will be automatically generated)
*     Username: String, (required, minimum five characters long)
*     Password: String, (required)
*     Email: String, (required)
*     Birthday: Date (required)
* } 
*
* The password will be hashed and stored in the database that way.
* 
* @example Request body:
* 
* {
* 
*       "Username": "Mary",
*       "Password": "example456!",
*       "Email": "mary@example.com",
*       "Birtday": "2001-10-24"
* 
* }
* 
* @example Response:
* { "Username": "Mary2", "Password": "$2b$10$Qzj0VgzghovcMDB1c7QyU.w39n2jAMH6rw6FRzZLeeX4WArti2OO2", "Email": "mary@example.com", "Birthday": "2001-10-24T00:00:00.000Z", "FavoriteMovies": [], "_id": "64130ea893504592c757550f", "__v": 0 }
*/
app.post('/users',
    // Validation logic for request
    [
        // Username should be required and should be minimum 5 characters long
        check('Username', 'Username is required and has to be minimum five characters long').isLength({min: 5}),
        // Username should be only alphanumeric characters
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        // Password is required
        check('Password', 'Password is required').not().isEmpty(),
        // Email is required and should be valid
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
        // check the validation object for errors
        let errors= validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array() });
        }
    
    // Add a user to database
    let hashedPassword= Users.hashPassword(req.body.Password)
    Users.findOne({ Username: req.body.Username})
        .then((user) => {
            if(user) {
                return res.status(400).send(req.body.Username + ' already exists');
            }else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {res.status(201).json(user)})
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: '+ error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: '+ error);
        });
});


/** @function Add a movie to the users favorite list 
 * 
 * @summary
 *  - Endpoint URL: '/users/:userID/movies/:movieID'
 *  - ':userId' must be replaced with the ID of the user.
 *  - ':movieId' must be replaced with the ID of the movie
 * 
 *  - Method type: 'POST'
 *  - Authentication required: 'JWT Bearer Token'
 *  - Format of data expected in the body of the request: 'JSON'
 *  - Format of the response data: 'JSON'
 * 
 * @example Request URL endpoint:
 *  'users/64130ea893504592c757550f/movies/640c72cf274958af87029bdf'
 * 
 * @example Response:
 *  '{ "Username": "Mary2", "Password": "$2b$10$Qzj0VgzghovcMDB1c7QyU.w39n2jAMH6rw6FRzZLeeX4WArti2OO2", "Email": "mary@example.com", "Birthday": "2001-10-24T00:00:00.000Z", "FavoriteMovies": [640c72cf274958af87029bdf], "_id": "64130ea893504592c757550f"}
*/
app.post('/users/:userId/movies/:movieId', passport.authenticate('jwt', {session: false }), (req, res) => {
    const{ userId, movieId}= req.params;

    let user= Users.findOne({_id: userId });
    let movie= Movies.findOne({_id: movieId });

    if (!user) {
        res.status(400).send('User not found');
    } else if (!movie) {
        res.status(400).send('Movie not found')
    } else {
        Users.findOneAndUpdate({_id: req.params.userId},{
            $addToSet: {
                FavoriteMovies: req.params.movieId
            },
        },
        {new: true}) //Returns updated object /*
        .then( (updatedUser) => {
            res.status(200).json(updatedUser);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: '+ err)
        });
    }
});

//READ

/** @function API's Main page 
 * @summary 
 *  - Endpoint URL: '/'
 *  - Method type: 'GET'
 *  - Format of the response data: Text
 *
 * @example Response:
 * Welcome to my movies API!
*/
app.get('/', (req,res) => {
    res.send('Welcome to my movies API!')
})

/** @function Get the list of all movies
 *  @summary 
 *  - Endpoint URL: '/movies'
 *  - Method type: 'GET'
 *  - Authentication required: 'JWT Bearer Token'
 *  - Format of the response data: 'JSON'
 * 
 *  @example Response:
 *  [ { "title": "Hitman", "description": "A gun-for-hire known only as Agent 47 hired by a group known only as 'The Organization' is ensnared in a political conspiracy, which finds him pursued by both Interpol and the Russian military as he treks across Russia and Eastern Europe.", "genre": { "name": "action", "description": "Action films are built around a core set of characteristics: spectacular physical action; a narrative emphasis on fights, chases, and explosions; and a combination of state-of-the-art special effects and stunt-work." }, "releaseDate": "2007", "director": { "name": "Xavier Gens", "bio": "He was born in Dunkerque, Nord, France. He is a director and assistant director, known for Frontière(s) (2007), The Divide (2011) and Cell (2016). He has been married to Mounia Meddour since 2005.", "birthYear": "1975", "deathYear": "" }, }, ... ]
 * */
app.get('/movies', passport.authenticate('jwt', {session: false }), (req,res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies)
        });
})

/** @function Get a specific movie by title
 * @summary
 *  - Endpoint URL: '/movies/:title'
 *  - ':title' must be repaced with the title of the movie.
 *  - Method type: 'GET'
 *  - Authentication required: 'JWT Bearer Token'
 *  - Format of the response data: 'JSON'
 *
 *  @example Request URL endpoint:
 *  '/movies/Inception'
 *
 *  @example Response:
 *  [ { "Genre": { "Name": "Action", "Description": "Action films are built around a core set of characteristics: spectacular physical action; a narrative emphasis on fights, chases, and explosions; and a combination of state-of-the-art special effects and stunt-work." }, "Director": { "Name": "Christopher Nolan", "Bio": "He is best known for his cerebral, often nonlinear, storytelling, acclaimed writer-director was born in London, England. Over the course of 15 years of filmmaking, Nolan has gone from low-budget independent films to working on some of the biggest blockbusters ever made.", "Birthyear": 1970 }, "Actors": [], "_id": "640c6890274958af87029bd7", "Title": "Inception", "Description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O but his tragic past may doom the project and his team to disaster.", "Release_date": "2010", "ImageURL": "https://de.web.img2.acsta.net/newsv7/19/08/09/19/16/2096534.jpg" } ]
 * */ 
app.get('/movies/:title', passport.authenticate('jwt', {session: false }), (req,res) => {
    const { title}= req.params;
    const movie= Movies.find({Title: title});

    if ( movie) {
        movie.then((specificMovie) => {
            res.status(200).json(specificMovie)
        })
    } else {
        res.status(400).send('Invalid movie title')
    }
})

/** @function Get data about a genre by name 
 * @summary
 *  - Endpoint URL: '/movies/genre/:genreName'
 *  - ':genreName' must be replaced with the name of the genre.
 *
 *  - Method type: 'GET'
 *  - Authentication required: 'JWT Bearer Token'
 *  - Format of the response data: 'JSON'
 *
 *  @example Request URL endpoint: '/movies/genre/Action'
 *
 *  @example Response:
 *  { "Name": "Action", "Description": "Action films are built around a core set of characteristics: spectacular physical action; a narrative emphasis on fights, chases, and explosions; and a combination of state-of-the-art special effects and stunt-work." }*/ 
app.get('/movies/genre/:genreName', passport.authenticate('jwt', {session: false }), (req, res) => {
    const{ genreName}= req.params;
    
    const genreByName= Movies.find({"Genre.Name": genreName});
    
    if( genreByName) {
        genreByName.then((genreInfo) => {
        res.status(200).json(genreInfo[0].Genre);
        })
    }else {
        res.status(400).send('Invalid genre')
    }    
})

/** @function Get data about a director by name
 * @summary
 *  - Endpoint URL: '/movies/directors/:directorName'
 *  ':directorName' must be replaced with the full name of the director.
 *
 *  - Method type: 'GET'
 *  - Authentication required: 'JWT Bearer Token'
 *  - Format of the response data: 'JSON'
 *
 *  @example Request URL endpoint: '/movies/directors/Nick%20Cassavetes'
 * 
 *  @example Response:
 *  { "Name": "Nick Cassavetes", "Bio": "He was born in New York City, the son of actress Gena Rowlands and Greek-American actor and film director John Cassavetes. As a child, he appeared in two of his father's films: Husbands (1970) and A Woman Under the Influence (1974). After spending so much of his youth surrounded by the film industry Cassavetes initially decided he did not want to go into the field. He instead attended Syracuse University on a basketball scholarship. His athletic career was effectively ended by an injury, and he decided to rethink his aspirations, ultimately deciding to attend his parents' alma mater, the American Academy of Dramatic Arts in New York.", "Birthyear": 1959 }
 * */ 
app.get('/movies/directors/:directorName', passport.authenticate('jwt', {session: false }), (req, res) => {
    const{ directorName}= req.params;
    
    const directorByName= Movies.find({"Director.Name": directorName});
    
    if(directorByName) {
        directorByName.then((directorInfo) => {
            res.status(200).json(directorInfo[0].Director);
            });
    }else {
        res.status(400).send('Invalid director')
    }    
})

// UPDATE

/** @function Update user info by username
 * @summary
 *  - Endpoint URL: '/users/:Username'
 *  - ':Username' must be replaced with the username of the user
 *
 *  - Method type: 'PUT'
 *  - Authentication required: 'JWT Bearer Token'
 *  - Format of data expected in the body of the request: 'JSON'
 *  - Format of the response data: 'JSON'
 * 
 * Expected format in the request body:
 * {
 * 
 *    Username: String, (required)
 * 
 *    Password: String, (required)
 * 
 *    Email: String, (required)
 * 
 *    Birthday: Date (required)
 * 
 * }
 * 
 *  @example Request URL endpoint:'/users/Mary'
 * 
 *  @example Request body:
 *  {
 *      
 *      "Username": "UpdatedMary",
 * 
 *      "Password": "example456!",
 * 
 *      "Email": "mary@example.com",
 * 
 *      "Birthday": "2001-10-24"
 * 
 *  }
 * 
 *  @example Response:
 *  { "_id": "641309dbd3d6abe814c76a1c", "Username": "UpdatedMary", "Password": "$2b$10$Qzj0VgzghovcMDB1c7QyU.w39n2jAMH6rw6FRzZLeeX4WArti2OO2", "Email": "mary@example.com", "Birthday": "2001-10-24T00:00:00.000Z", "FavoriteMovies": [], "__v": 0 }
 */
app.put('/users/:Username', passport.authenticate('jwt', {session: false }), [
    // Username should be required and should be minimum 5 characters long
    check('Username', 'Username is required and has to be minimum five characters long').isLength({min: 5}),
    // Username should be only alphanumeric characters
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    // Password is required
    check('Password', 'Password is required').not().isEmpty(),
    // Email is required and should be valid
    check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
    // check the validation object for errors
    let errors= validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array() });
    }

    //Update user info
    let hashedPassword= Users.hashPassword(req.body.Password)

    Users.findOneAndUpdate({Username: req.params.Username }, { $set:
            {
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
        {new: true}
    ).then((updatedUser) => {
            res.status(200).json(updatedUser)
    }).catch((err) => {
        if(err) {
            res.status(400).send('User couldn\'t be updated: ' + err)
        } 
    })
})

/** @function Remove a movie from the user's list of favorites 
 * @summary
 *  - Endpoint URL: '/users/:userId/movies/:movieId'
 *  - ':userId' must be replaced with the user's ID.
 *  - ':movieId' must be replaced with the ID of the movie.
 *
 *  - Method type: 'PUT'
 *  - Authentication required: 'JWT Bearer Token'
 *  - Format of the response data: 'JSON'
 *
 *  @example Request URL endpoint: '/users/64130ea893504592c757550f/movies/640c72cf274958af87029bdf'
 * 
 * @example Response:
 *  '{ "updatedUser": { "Username": "Mary2", "Password": "$2b$10$Qzj0VgzghovcMDB1c7QyU.w39n2jAMH6rw6FRzZLeeX4WArti2OO2", "Email": "mary@example.com", "Birthday": "2001-10-24T00:00:00.000Z", "FavoriteMovies": [], "_id": "64130ea893504592c757550f"} }
*/
app.put('/users/:userId/movies/:movieId', passport.authenticate('jwt', {session: false }), (req, res) => {
    const{ userId, movieId}= req.params;

    let user= Users.findOne({_id: userId });
    let movie= Movies.findOne({_id: movieId });
    
    if (!user) {
        res.status(400).send('User not found');
    } else if (!movie) {
        res.status(400).send('Movie not found')
    } else {
        Users.findOneAndUpdate({_id: req.params.userId},{
            $pull: {
            FavoriteMovies: req.params.movieId
            }
        },
        {new: true}
        ).then( (updatedUser) => {
            res.status(200).json({updatedUser});
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: '+ err)
        });
    }
});

//DELETE

/** @function Deregister user 
 * @summary
 * 
 *  - Endpoint URL: '/users/:id'
 *  - ':id' must be replaced with the user's ID.
 *
 *  - Method type: 'DELETE'
 *  - Authentication required: 'JWT Bearer Token'
 *  - Format of the response data: Text
 *
 *  @example Request URL endpoint: '/users/64130ea893504592c757550f'
 *
 *  @example Response:
 *  user 64130ea893504592c757550f has been deleted
*/
app.delete('/users/:id', passport.authenticate('jwt', {session: false }), (req, res) => {
    const{ id}= req.params;

    let user= Users.find({_id: id});

    Users.findOneAndRemove({_id: id}).then(user => {
        if ( user) {
        res.status(200).send(`user ${id} has been deleted`);
        } else{
        res.status(400).send('User not found')
        }
    })
})

//Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!')
})

//listen for requests
const port= process.env.PORT || 8080;
app.listen (port, '0.0.0.0', () => {
    console.log('Listening on Port '+ port)
});