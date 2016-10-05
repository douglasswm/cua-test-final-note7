
var LocalStrategy = require("passport-local").Strategy;
var models = require('./models/index');
var bcrypt   = require('bcrypt-nodejs');

var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/config.json')[env];


//Setup local strategy
module.exports = function (app, passport) {
    function authenticate(username, password, done) {

        models.users.findOne({
            where: {
                email: username
            }
        }).then(function(result) {
            if(!result){
                return done(null, false);
            }else{
                if(bcrypt.compareSync(password , result.encrypted_password)){
                    return done(null, result);
                }else{
                    return done(null, false);
                }
            }
        }).catch(function(err){
            return done(err, false);
        });


    }

    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, authenticate));

    passport.serializeUser(function (user, done) {
        console.info("serial to session");
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        models.users.findOne({
            where: {
                email: user.email
            }
        }).then(function(result) {
            if(result){
                done(null, user);
            }
        }).catch(function(err){
            done(err, user);
        });
    });

};