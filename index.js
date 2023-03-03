// required frameworks, packages

const express= require("express"),
    morgan= require("morgan"),
    fs= require('fs'),
    path= require('path'),
    bodyParser= require('body-parser'),
    uuid= require('uuid');

const app= express();

// use of body-parser
app.use(bodyParser.json());

// my movies database

let myTopMovies= [
    {
        position: "1st",
        title: "The Lord of the Rings: The Fellowship of the Ring",
        genre: ["adventure", "epic", "fantasy"],
        releaseDate: "2001",
        director: "Peter Jackson"
    },
    {
        position: "2nd",
        title: "The Lord of the Rings: The Two Towers",
        genre: ["adventure", "epic", "fantasy"],
        releaseDate: "2002",
        director: "Peter Jackson"
    },
    {
        position: "3rd",
        title: "The Lord of the Rings: The Return of the King",
        genre: ["adventure", "epic", "fantasy"],
        releaseDate: "2003",
        director: "Peter Jackson"
    },
    {
        position: "4th",
        title: "The Matrix",
        genre: ["action", "science fiction"],
        releaseDate: "1999",
        director: "The Wachowskis"
    },
    {
        position: "5th",
        title: "The Karate Kid",
        genre: ["drama", "martial arts"],
        releaseDate: "2010",
        director: "Harald Zwart"
    },
    {
        position: "6th",
        title: "The Notebook",
        genre: ["drama", "romantic"],
        releaseDate: "2004",
        director: "Nick Cassavetes"
    },
    {
        position: "7th",
        title: "Prince of Persia: The Sands of Time",
        genre: ["action", "fantasy"],
        releaseDate: "2010",
        director: "Mike Newell"
    },
    {
        position: "8th",
        title: "Inception",
        genre: ["action", "science fiction"],
        releaseDate: "2010",
        director: "Christopher Nolan"
    },
    {
        position: "9th",
        title: "Hitman",
        genre: ["action", "thriller"],
        releaseDate: "2007",
        director: "Xavier Gens"
    },
    {
        position: "10th",
        title: "The Matrix Reloaded",
        genre: ["action", "science fiction"],
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