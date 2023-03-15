// required frameworks, packages

const express= require("express"),
    morgan= require("morgan"),
    fs= require('fs'),
    path= require('path'),
    bodyParser= require('body-parser'),
    uuid= require('uuid');

const app= express();

// add Schemas to the API
const mongoose= require('mongoose');
const Models= require('./models.js');

const Movies= Models.Movie;
const Users= Models.User;

mongoose.connect('mongodb://localhost:27017/moviedbnosql', {useNewUrlParser: true, useUnifiedTopology: true});

// use of body-parser
app.use(bodyParser.json());

// my movies database (Descriptions and director bio is used from IMDB)

let users= [
    {
        id: 1,
        name: "Kim",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "Joe",
        favoriteMovies: ["Inception"]
    }
]

let movies= [
    {
        "title": "Hitman",
        "description": "A gun-for-hire known only as Agent 47 hired by a group known only as 'The Organization' is ensnared in a political conspiracy, which finds him" + 
            " pursued by both Interpol and the Russian military as he treks across Russia and Eastern Europe.",
        "genre":
            {
                "name":"action",
                "description": "Action films are built around a core set of characteristics: spectacular physical action; a narrative emphasis on fights, chases, and" +
                    " explosions; and a combination of state-of-the-art special effects and stunt-work."
            },
        "releaseDate": "2007",
        "director":
            {
            "name": "Xavier Gens",
            "bio": "He was born in Dunkerque, Nord, France. He is a director and assistant director, known for Frontière(s) (2007), The Divide (2011) and Cell (2016)."+
                " He has been married to Mounia Meddour since 2005.",
            "birthYear": "1975",
            "deathYear": ""
            },
        "imageURL": "https://m.media-amazon.com/images/M/MV5BMDlmMmZhZjQtZDhlMi00MzU0LWIwYjMtNDRhOGE5YzczYjBmXkEyXkFqcGdeQXVyNDQ2MTMzODA@._V1_.jpg"
    },
    {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.,"+
            " but his tragic past may doom the project and his team to disaster.",
        "genre":
            {
                "name":"action",
                "description": "Action films are built around a core set of characteristics: spectacular physical action; a narrative emphasis on fights, chases, and explosions;"+
                    " and a combination of state-of-the-art special effects and stunt-work."
            },
        "releaseDate": "2010",
        "director": 
            {
                "name": "Christopher Nolan",
                "bio": "He is best known for his cerebral, often nonlinear, storytelling, acclaimed writer-director was born in London, England. Over the course of 15 years"+
                    " of filmmaking, Nolan has gone from low-budget independent films to working on some of the biggest blockbusters ever made.",
                "birthYear": "1970",
                "deathYear": ""
            },
        "imageURL": "https://de.web.img2.acsta.net/newsv7/19/08/09/19/16/2096534.jpg"
    },
    {
        "title": "Prince of Persia: The Sands of Time",
        "description": "A young fugitive prince and princess must stop a villain who unknowingly threatens to destroy the world with a special dagger that enables the magic"+
            " sand inside to reverse time.",
        "genre":
            {
                "name":"action",
                "description": "Action films are built around a core set of characteristics: spectacular physical action; a narrative emphasis on fights, chases, and explosions;"+
                    " and a combination of state-of-the-art special effects and stunt-work."
            },
        "releaseDate": "2010",
        "director": 
            {
                "name": "Mike Newell",
                "bio": "Three year training course at Granada Television, with intention of going into theatre. Graduated to directing TV plays, building strong reputation"+
                    " for work with David Hare, David Edgar, Hohn, John Osborne, Jack Rosenthal.",
                "birthYear": "1942",
                "deathYear": ""
            },
        "imageURL": "https://www.sobrosnetwork.com/wp-content/uploads/2021/04/prince-of-persia-sands-of-time-1200x675-1.png"
    },
    {
        "title": "The Karate Kid",
        "description": "Work causes a single mother to move to China with her young son; in his new home, the boy embraces kung fu, taught to him by a master.",
        "genre":
            { 
                "name": "martial arts",
                "description": "Martial arts films commonly include hand-to-hand combat along with other types of action, such as stuntwork, chases, and gunfights."+
                    " Sub-genres of martial arts films include kung fu films, wuxia, karate films, and martial arts action comedy films, while related genres include"+
                    " gun fu, jidaigeki and samurai films."
            },
        "releaseDate": "2010",
        "director": 
            {
            "name": "Harald Zwart",
            "bio": "Harald Zwart was born in Leiden, Netherlands, and his family moved to Norway where he grew up. He made his first film when he was 8 years and was active"+
                " with Super8 and stop motion animation for years. He was accepted into the highly acclaimed Dutch Film Academy in Amsterdam, NL, where he spent 4 years,"+
                " specializing in Directing, Script and Editing. He met his wife and partner Veslemoey Ruud Zwart and they've worked together since. She started managing his"+
                " deals and started the company Zwart Arbeid A/S",
            "birthYear": "1965",
            "deathYear": ""
            },
        "imageURL": "https://images.moviesanywhere.com/92e403194d518b12a4c5a1e1ee0bb454/5b1c7797-5122-4ee1-98bb-b6ffbcc49ade.jpg"
    },
    {
        "title": "The Lord of the Rings: The Fellowship of the Ring",
        "description": "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
        "genre":
            {
                "name": "fantasy",
                "description": "By definition, fantasy is a genre that typically features the use of magic or other supernatural phenomena in the plot, setting, or theme."+
                    " Magical or mythological creatures often feature, as well as races other than humans, such as elves, dwarves, or goblins."
            },
        "releaseDate": "2001",
        "director": 
            {
                "name": "Sir Peter Jackson",
                "bio": "He made history with The Lord of the Rings trilogy, becoming the first person to direct three major feature films simultaneously. The Fellowship of the"+
                    " Ring, The Two Towers and The Return of the King were nominated for and collected a slew of awards from around the globe, with The Return of the King"+
                    " receiving his most impressive collection of awards. This included three Academy Awards® (Best Adapted Screenplay, Best Director and Best Picture),"+
                    " two Golden Globes (Best Director and Best Motion Picture-Drama), three BAFTAs (Best Adapted Screenplay, Best Film and Viewers' Choice), a Directors"+
                    " Guild Award, a Producers Guild Award and a New York Film Critics Circle Award.",
                "birthYear": "1961",
                "deathYear": ""
            },
        "imageURL": "https://sothebys-md.brightspotcdn.com/69/b5/e7fd127c47e389aab5c566111a69/110.%20LORD%20OF%20THE%20RINGS%20FELLOWSHIP.jpg"
    },
    {
        "title": "The Lord of the Rings: The Two Towers",
        "description": "While Frodo and Sam edge closer to Mordor with the help of the shifty Gollum, the divided fellowship makes a stand against Sauron's new ally,"+
            " Saruman, and his hordes of Isengard.",
        "genre":
            {
                "name": "fantasy",
                "description": "By definition, fantasy is a genre that typically features the use of magic or other supernatural phenomena in the plot, setting, or theme."+
                    " Magical or mythological creatures often feature, as well as races other than humans, such as elves, dwarves, or goblins."
            },
        "releaseDate": "2002",
        "director": 
            {
                "name": "Sir Peter Jackson",
                "bio": "He made history with The Lord of the Rings trilogy, becoming the first person to direct three major feature films simultaneously. The Fellowship"+
                    " of the Ring, The Two Towers and The Return of the King were nominated for and collected a slew of awards from around the globe, with The Return of the"+
                    " King receiving his most impressive collection of awards. This included three Academy Awards® (Best Adapted Screenplay, Best Director and Best Picture),"+
                    " two Golden Globes (Best Director and Best Motion Picture-Drama), three BAFTAs (Best Adapted Screenplay, Best Film and Viewers' Choice), a Directors Guild"+
                    " Award, a Producers Guild Award and a New York Film Critics Circle Award.",
                "birthYear": "1961",
                "deathYear": ""
            },
        "imageURL": "https://cdn.shopify.com/s/files/1/0037/8008/3782/products/lord_of_the_rings_the_two_towers_NG06275_B-159226.jpg?v=1611688137"
    },
    {
        "title": "The Lord of the Rings: The Return of the King",
        "description": "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
        "genre":
            {
                "name": "fantasy",
                "description": "By definition, fantasy is a genre that typically features the use of magic or other supernatural phenomena in the plot, setting, or theme."+
                    " Magical or mythological creatures often feature, as well as races other than humans, such as elves, dwarves, or goblins."
            },
        "releaseDate": "2003",
        "director": 
            {
                "name": "Sir Peter Jackson",
                "bio": "He made history with The Lord of the Rings trilogy, becoming the first person to direct three major feature films simultaneously. The Fellowship of the"+
                    " Ring, The Two Towers and The Return of the King were nominated for and collected a slew of awards from around the globe, with The Return of the King"+
                    " receiving his most impressive collection of awards. This included three Academy Awards® (Best Adapted Screenplay, Best Director and Best Picture), two"+
                    " Golden Globes (Best Director and Best Motion Picture-Drama), three BAFTAs (Best Adapted Screenplay, Best Film and Viewers' Choice), a Directors Guild"+
                    " Award, a Producers Guild Award and a New York Film Critics Circle Award.",
                "birthYear": "1961",
                "deathYear": ""
            },
        "imageURL": "https://cdn.shopify.com/s/files/1/0037/8008/3782/products/lord_of_the_rings_the_return_of_the_king_advance_JC12594_C_1_2_framed1-451007.jpg?v=1611688139"
    },
    {
        "title": "The Matrix",
        "description": "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate"+
            " deception of an evil cyber-intelligence.",
        "genre":
            {
                "name": "science fiction",
                "description": "Science fiction is a genre of fiction in which the stories often tell about science and technology of the future. It is important to note that"+
                    " science fiction has a relationship with the principles of science—these stories involve partially true- partially fictitious laws or theories of science."
            },
        "releaseDate": "1999",
        "director": 
            {
                "name": "The Wachowskis",
                "bio": "They are American film and television directors, writers and producers. have worked as a writing and directing team through most of their careers."+
                    " They made their directing debut in 1996 with Bound and achieved fame with their second film, The Matrix (1999).",
                "birthYear": ["1965", "1967"],
                "deathYear": ""
            },
        "imageURL": "https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
    },
    {
        "title": "The Matrix Reloaded",
        "description": "Freedom fighters Neo, Trinity and Morpheus continue to lead the revolt against the Machine Army, unleashing their arsenal of extraordinary skills and"+
            " weaponry against the systematic forces of repression and exploitation.",
        "genre":
            {
                "name": "science fiction",
                "description": "Science fiction is a genre of fiction in which the stories often tell about science and technology of the future. It is important to note that"+
                    " science fiction has a relationship with the principles of science—these stories involve partially true- partially fictitious laws or theories of science."
            },
        "releaseDate": "2003",
        "director": 
            {
                "name": "The Wachowskis",
                "bio": "They are American film and television directors, writers and producers. have worked as a writing and directing team through most of their careers."+
                    " They made their directing debut in 1996 with Bound and achieved fame with their second film, The Matrix (1999).",
                "birthYear": ["1965", "1967"],
                "deathYear": ""
            },
        "imageURL": "https://e1.pxfuel.com/desktop-wallpaper/1014/2/desktop-wallpaper-the-matrix-reloaded-movie-hq-the-matrix-reloaded-the-matrix-reloaded.jpg"
    },
    {
        "title": "The Notebook",
        "description": "A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom, but they are soon separated because of their social"+
            " differences.",
        "genre":
            { 
                "name": "romantic",
                "description": "A romance novel or romantic novel generally refers to a type of genre fiction novel which places its primary focus on the relationship and"+
                    " romantic love between two people, and usually has an emotionally satisfying and optimistic ending."
            },
        "releaseDate": "2004",
        "director": 
            {
                "name": "Nick Cassavetes",
                "bio": "He was born in New York City, the son of actress Gena Rowlands and Greek-American actor and film director John Cassavetes. As a child, he appeared in"+
                    " two of his father's films: Husbands (1970) and A Woman Under the Influence (1974). After spending so much of his youth surrounded by the film industry,"+
                    " Cassavetes initially decided he did not want to go into the field. He instead attended Syracuse University on a basketball scholarship. His athletic career"+
                    " was effectively ended by an injury, and he decided to rethink his aspirations, ultimately deciding to attend his parents' alma mater, the American Academy"+
                    " of Dramatic Arts in New York.",
                "birthYear": "1959",
                "deathYear": ""
            },
        "imageURL": "https://m.media-amazon.com/images/M/MV5BMTk3OTM5Njg5M15BMl5BanBnXkFtZTYwMzA0ODI3._V1_FMjpg_UX1000_.jpg"
    }
]

// logging with 'morgan'
const accessLogStream= fs.createWriteStream(path.join('./log.txt'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

// use 'express.static('public'))' to reach the public folder through the port

app.use(express.static('public'));

//CREATE

//Add a user
app.post('/users', (req, res) => {
    const newUser= req.body;

    if (newUser.name) {
        newUser.id= uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('Username required')
    }
})

// Add a movie to the users favorite list
app.post('/users/:id/:movieTitle', (req, res) => {
    const{ id, movieTitle}= req.params;

    let user= users.find( user=> user.id== id);

    if ( user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s favorite list`);
    } else{
        res.status(400).send('User not found')
    }
})

//READ

//Main page
app.get('/', (req,res) => {
    res.send('Welcome to my movies API!')
})

// READ all movies
app.get('/movies', (req,res) => {
    res.status(200).json(movies);
})

// READ a specific movie by title
app.get('/movies/:title', (req,res) => {
    const { title}= req.params;
    const movie= movies.find( movie => movie.title=== title);

    if ( movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('Invalid movie title')
    }
})

// READ data about a genre by name
app.get('/movies/genre/:genreName', (req, res) => {
    const{ genreName}= req.params;
    
    const genre= movies.find( movie=> movie.genre.name=== genreName).genre;
    
    if( genre) {
        res.status(200).json(genre);
    }else {
        res.status(400).send('Invalid genre')
    }    
})

// READ data about a director by name
app.get('/movies/directors/:directorName', (req, res) => {
    const{ directorName}= req.params;
    
    const director= movies.find( movie=> movie.director.name=== directorName).director;
    
    if(director) {
        res.status(200).json(director);
    }else {
        res.status(400).send('Invalid director')
    }    
})

// UPDATE

// Allow users to change username
app.put('/users/:id', (req, res) => {
    const{ id}= req.params;
    const updatedUser= req.body;

    let user= users.find( user=> user.id== id);

    if ( user) {
        user.name= updatedUser.name;
        res.status(200).json(user);
    } else{
        res.status(400).send('User not found')
    }
})

//DELETE

// Allow users to remove a movie from their list of favorites
app.delete('/users/:id/:movieTitle', (req, res) => {
    const{ id, movieTitle}= req.params;

    let user= users.find( user=> user.id== id);

    if ( user) {
        user.favoriteMovies = user.favoriteMovies.filter( title=> title!== movieTitle)
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else{
        res.status(400).send('User not found')
    }
})

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