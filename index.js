// required frameworks, packages

const express= require("express"),
    morgan= require("morgan"),
    fs= require('fs'),
    path= require('path');

const app= express();

// my movies database

let myTopMovies= [
    {
        position: "1st",
        title: "The Lord of the Rings: The Fellowship of hte Ring",
        releaseDate: "2001",
        director: "Peter Jackson"
    },
    {
        position: "2nd",
        title: "The Lord of the Rings: The Two Towers",
        releaseDate: "2002",
        director: "Peter Jackson"
    },
    {
        position: "3rd",
        title: "The Lord of the Rings: The Return of the King",
        releaseDate: "2003",
        director: "Peter Jackson"
    },
    {
        position: "4th",
        title: "The Matrix",
        releaseDate: "1999",
        director: "The Wachowskis"
    },
    {
        position: "5th",
        title: "The Karate Kid",
        releaseDate: "2010",
        director: "Harald Zwart"
    },
    {
        position: "6th",
        title: "The Notebook",
        releaseDate: "2004",
        director: "Nick Cassavetes"
    },
    {
        position: "7th",
        title: "Prince of Persia: The Sands of Time",
        releaseDate: "2010",
        director: "Mike Newell"
    },
    {
        position: "8th",
        title: "Inception",
        releaseDate: "2010",
        director: "Christopher Nolan"
    },
    {
        position: "9th",
        title: "Hitman",
        releaseDate: "2007",
        director: "Xavier Gens"
    },
    {
        position: "10th",
        title: "The Matrix Reloaded",
        releaseDate: "2003",
        director: "The Wachowskis"
    }
]


// logging with 'morgan'
const accessLogStream= fs.createWriteStream(path.join('./log.txt'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

// use 'express.static('public'))' to reach the public folder through the port

app.use(express.static('public'));

//GET requests
app.get('/', (req,res) => {
    res.send('Welcome to my movies API!')
})

app.get('/movies', (req,res) => {
    res.json(myTopMovies);
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