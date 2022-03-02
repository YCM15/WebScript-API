const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const controllerCarpeta = require('./controllerCarpeta');

exports.postSignup = (req, res, next) => {
	const user = new User({
		nombre: req.body.nombre,
		apellido: req.body.apellido,
		nickname: req.body.nickname,
		password: req.body.password,
		mail: req.body.mail,
		plan: req.body.plan,
		admin:false
	});

	User.findOne({nickname: req.body.nickname}, (err, userExist)=>{
		if(userExist){
			return res.send({status:false, message:`El usuario ${req.body.nickname} ya existe`});
		}
		user.save( async (err)=>{
			if(err){
				if(err.keyPattern.mail){
					return res.send({status:false, message:`${err.keyValue.mail} ya esta en uso`});
				}
				else{
					return res.send({error:"error en el servidor"})
				}
			}
			req.logIn(user, (err)=>{
				if(err){
					//next(err);
					return res.send({ status: false, message:'Error en el servidor', error: err}); 
				}
				//res.send({status:true, message:'Successful registration'});
				
			});
			const payload = {
				username: user.nickname,
				email: user.mail
			}
			const options = {
				subject: `${user.id}`,
				expiresIn: "10h"
			}
			const token = jwt.sign(payload, 'supersecret', options);

			const tempUser = 
			{
				"_id": user._id,
				"nombre": user.nombre,
				"apellido": user.apellido,
				"nickname": user.nickname,
				"mail": user.mail,
				"plan": user.plan,
				"admin": user.admin
			}

			await controllerCarpeta.CarpetaPadre(user.nickname, user._id);
			
			return res.send({status:true, token:token, user:tempUser});
		  });
	});

	
}


exports.postLogin = (req, res, next) => {
	passport.authenticate('local', (err, user, info)=>{
		if (err) { return next(err); }

        if ( ! user) {
            return res.send({status: false,message:info});
        }

        const payload = {
            username: user.nickname,
            email: user.email
        }
        const options = {
            subject: `${user.id}`,
            expiresIn: "10h"
        }
        const token = jwt.sign(payload, 'supersecret', options);

		const tempUser = 
			{
				"_id": user._id,
				"nombre": user.nombre,
				"apellido": user.apellido,
				"nickname": user.nickname,
				"mail": user.mail,
				"plan": user.plan,
				"admin": user.admin
			}
        
        return res.send({status:true, token, user:tempUser});
	})(req, res, next);
}

exports.postLogout = (req, res) => {
	req.logOut();
	res.send({status:true, message:'LogOut complete'});
}



exports.postSignupFB = (req, res, next) => {
	const {nombre, apellido, nickname, mail, plan, FB_ID} = req.body;
	const user = new User({ nombre, apellido, nickname, mail, plan, FB_ID});

	User.findOne({nickname: nickname}, (err, userExist)=>{
		if(userExist){
			return res.send({status:false, message:`El usuario ${nickname} ya existe`});
		}
		user.save( async (err)=>{
			if(err){
				if(err.keyPattern.mail){
					return res.send({status:false, message:`${err.keyValue.mail} ya esta en uso`});
				}
				else{
					return res.send({error:"error en el servidor"})
				}
			}
			req.logIn(user, (err)=>{
				if(err){
					//next(err);
					return res.send({ status: false, message:'Error en el servidor', error: err}); 
				}
				//res.send({status:true, message:'Successful registration'});
				
			});
			const payload = {
				username: user.nickname,
				email: user.mail
			}
			const options = {
				subject: `${user.id}`,
				expiresIn: "10h"
			}
			const token = jwt.sign(payload, 'supersecret', options);

			await controllerCarpeta.CarpetaPadre(user.nickname, user._id);
			
			return res.send({status:true, token:token});
		  });
	});

	
}


exports.postLoginFB = (req, res) => {
	User.findOne({FB_ID: req.body.FB_ID}, (err, user) => {
        if(err){
            return res.send({status:false, message:'internal server error'});
        }
        if(!user){
            return res.send({status:false, message:'Usuario no encontrado'});
        }else{
            
            const payload = {
	            username: user.nickname,
	            email: user.email
	        }
	        const options = {
	            subject: `${user.id}`,
	            expiresIn: "10h"
	        }
	        const token = jwt.sign(payload, 'supersecret', options);
	        
	        return res.send({status:true, token});
            
        }
    });
}

exports.change_password = (req, res)=>{
	const {password, newPassword} = req.body;
    if(!password || !newPassword){
		return res.send({status:false, message:'Password is missing'});
	}

	User.findById(req.user._id, (err, user) => {
		if(err){
			return res.send({status:false, message:'internal server error'});
		}
		if(!user){
			return res.send({status:false, message:'User not found'});
		}

		user.matchPassword(password, (error, equals)=>{
			if(!equals){
				return res.send({status:false, message: 'Password incorrect'});
			}

			user.password = newPassword;
			user.save((err)=>{
				if(err){
					return res.send({status:false, message:'internal server error'});
				}

				return res.send({status:true, message:'Password changed successfully'});
			});
			
		});
			
		
	});
}