const bcrypt = require('bcrypt-nodejs');
const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    nombre:String,
    apellido: String,
    nickname:{
    	type: String,
    	unique: true
    },
    password:String,
    mail: {
    	type: String,
    	unique: true
    },
    plan:String,
    FB_ID:{
        type: String
    },
    admin: Boolean
}, {
    timestamps: true
});

UserSchema.pre('save', function(next){
    const usuario = this;
    if(usuario.password){
        if(!usuario.isModified('password')){
            next();
        }
        bcrypt.genSalt(10, (err, salt)=>{
            if(err){
                next(err);
            }
            bcrypt.hash(usuario.password, salt, null, (err, hash)=>{
                if(err){
                    next(err);
                }
                usuario.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

UserSchema.methods.matchPassword = function(password, cb){
    bcrypt.compare(password, this.password, (err, sonIguales)=>{
        if(err){
            return cb(err);
        }
        cb(null, sonIguales);
    });
}

module.exports = model('User', UserSchema);