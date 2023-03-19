// required frameworks, packages

const express= require("express"),
    morgan= require("morgan"),
    fs= require('fs'),
    path= require('path'),
    bodyParser= require('body-parser'),
    uuid= require('uuid'),
    mongoose= require('mongoose');

const app= express();

// use of body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// add Schemas to the API
const Models= require('./models.js');

const Movies= Models.Movie;
const Users= Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/moviedbnosql', {useNewUrlParser: true, useUnifiedTopology: true})

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
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username})
        .then((user) => {
            if(user) {
                return res.status(400).send(req.body.Username + ' already exists');
            }else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
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
app.post('/users/:userId/movies/:movieId', (req, res) => {
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
                }
        }).then( (user) => {
            res.status(200).json({Username: user.Username, FavoriteMovies: user.FavoriteMovies});
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
app.get('/movies', (req,res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies)
        });
})

// READ a specific movie by title
app.get('/movies/:title', (req,res) => {
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
app.get('/movies/genre/:genreName', (req, res) => {
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
app.get('/movies/directors/:directorName', (req, res) => {
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
app.put('/users/:Username', (req, res) => {

    Users.findOneAndUpdate({Username: req.params.Username })
        .then( { $set:
            {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        }).then((updatedUser) => {
                res.status(200).json(updatedUser)
        }).catch((err) => {
            if(err) {
                res.status(400).send('User couldn\'t be updated: ' + err)
            } 
        })
})

//DELETE

// Allow users to remove a movie from their list of favorites
app.put('/users/:userId/movies/:movieId', (req, res) => {
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
        }).then( (user) => {
            res.status(200).json({Username: user.Username, FavoriteMovies: user.FavoriteMovies});
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: '+ err)
        });
    }
});

// Allow users to deregister
app.delete('/users/:id', (req, res) => {
    const{ id}= req.params;

    let user= users.find( user=> user.id== id);

    if ( user) {
        users = users.filter( user=> user.id!= id)
        res.status(200).send(`user ${id} has been deleted`);
    } else{
        res.status(400).send('User not found')
    }
})

//Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!')
})

//listen for requests
app.listen (8080, () => {
    console.log('Your app is listening on port 8080.')
});