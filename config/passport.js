const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/Users');

var options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = 'supersecret'; 

passport.serializeUser((user, done)=>{
    done(null, user._id);
});

passport.deserializeUser((id, done)=>{
    User.findById(id, (err, user)=>{
        done(err, user); 
    });
});


passport.use('local', new localStrategy({usernameField:'nickname'}, (nickname, password, done) => {
    User.findOne({nickname: nickname}, (err, user) => {
        if(err){
            return done(err, false, {message:'internal server error'});
        }
        if(!user){
            return done(null, false, {message:'Usuario no encontrado'});
        }else{
            user.matchPassword(password, (error, sonIguales)=>{
                if(sonIguales){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Contraseña incorrecta'});
                }
            });
            
        }
    });
}));

passport.use(new JwtStrategy(options, function(jwtPayload, done) {
    User.findById(jwtPayload.sub, function(err, user) {
        if (err) {
            return done(null, false);
        }

        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    })
}));

exports.estaAutenticado = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    res.send({status:false, message:'no esta logeado'});
}