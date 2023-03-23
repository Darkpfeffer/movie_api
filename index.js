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

// require CORS
const cors= require('cors');

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) {
            return callback(null, true)
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

//CREATE

//Add a user
/* Expected JSON format
{
    (ID: Will be automatically generated)
    Username: String, (required)
    Password: String, (required)
    Email: String, (required)
    Birthday: Date (required)

} */
app.post('/users', passport.authenticate('jwt', {session: false }),
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

// Add a movie to the users favorite list
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
            res.status(200).json({Username: updatedUser.Username, FavoriteMovies: updatedUser.FavoriteMovies});
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: '+ err)
        });
    }
});

//READ

//Main page
app.get('/', (req,res) => {
    res.send('Welcome to my movies API!')
})

// READ all movies
app.get('/movies', passport.authenticate('jwt', {session: false }), (req,res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies)
        });
})

// READ a specific movie by title
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

// READ data about a genre by name
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

// READ data about a director by name
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

// Allow users to update user info by ID
/* Expected format in the request body:
{
    Username: String,
    (required)
    Password: String,
    (required)
    Email: String,
    (required)
    Birthday: Date
    (required)
} */
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

// Allow users to remove a movie from their list of favorites
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
        ).then( (user) => {
            res.status(200).json({Username: user.Username, FavoriteMovies: user.FavoriteMovies});
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: '+ err)
        });
    }
});

//DELETE

// Allow users to deregister
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