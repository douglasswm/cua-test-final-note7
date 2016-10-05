var path = require("path");
var express = require("express");
var app = express();


var passport = require("passport");
var bodyParser = require("body-parser");
var flash    = require('connect-flash');
var session = require("express-session");
var cookieParser = require('cookie-parser');

const  PORT = "port";
var VERSIONS = {'Version 1': '/v1', 'Version 2': '/v2'};

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// Only if you're behind a reverse proxy (e.g., Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup)
app.enable("trust proxy");

// Initialize session
app.use(session({
    secret: "nus-stackup",
    resave: false,
    saveUninitialized: true
}));

//Initialize passport
app.use(passport.initialize());
app.use(passport.session());

require('./auth.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./routes/v1.js')(app); // load our routes and pass in our app and fully configured passport
require('./routes/v2.js')(app); // load our routes and pass in our app and fully configured passport

// Return the support versions for the REST API
app.get("/", function(req, res) {
    res.json(VERSIONS);
})

// Iterate through the routes directory and import
for (var k in VERSIONS) {
    console.info("k", k);
    require('./routes' + VERSIONS[k] + ".js")(app);
}

app.use(express.static(__dirname + "/public"));
app.use("/bower_components", express.static(__dirname + "/bower_components"));

app.set(PORT, process.argv[2] || process.env.APP_PORT || 3000);

app.listen(app.get(PORT) , function(){
    console.info("App Server started on " + app.get(PORT));
});