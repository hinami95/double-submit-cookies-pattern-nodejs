const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const uuid = require('uuid');

const app = express();

//Initializing running port of the server
const PORT = 4000;

//Applying middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

//Getting static assets
app.use(express.static('public'));

//Starting the server
app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});

//Getting the root (login page)
app.get('/', (req, res) => {
  
    let sessionID = req.cookies['session-id'];
    let csrfToken = req.cookies['csrf-token'];

    if (sessionID && csrfToken) {
        res.sendFile('public/html/home.html', {root: __dirname});
    } else {
        res.sendFile('public/html/index.html', {root: __dirname});
    }
});

//Getting the home page (transfer page)
app.post('/home', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (username === 'admin' && password === 'admin') {

        //Generating session id and csrf token using universally unique identifier
        const SESSION_ID = uuid.v1(); //timestamp
        const CSRF_TOKEN = uuid.v4(); //random

        //Setting session id and csrf-tolken to header as cookies
        res.setHeader('Set-Cookie', [`session-id=${SESSION_ID}`, `time=${Date.now()}`, `csrf-token=${CSRF_TOKEN}`]);
        res.sendFile('public/html/home.html', {root: __dirname});

    } else {
        const error = {status: 401, message: 'Invalid Credentials'};
        res.status(401).json(error);
    }
});

//Submitting the form
app.post('/transfer', (req, res) => {

    const csrfvalue = req.body.csrfToken;
    const csrfToken = req.cookies['csrf-token'];

    //Checking whether value submitted through form and the value of the cookie are equal
    if (csrfvalue === csrfToken) {
        res.sendFile('public/html/success.html', {root: __dirname});
    } else {
        res.sendFile('public/html/error.html', {root: __dirname});
    }
});

//Logging out
app.post('/logout', (req, res) => {

    //Clearing the cookies
    res.clearCookie("session-id");
    res.clearCookie("time");
    res.clearCookie("csrf-token");

    res.sendFile('public/html/index.html', {root: __dirname});
});

//Redirecting if home and logout are explicitly called
app.get('/:var(home|logout)?', (req, res) => {
    res.redirect('/');
});