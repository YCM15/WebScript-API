const express = require('express');
const passport = require('passport');
const router = express.Router();

const User = require('../models/Users');
const configPassport = require('../config/passport');

const userController = require('../controllers/controllerUsuario');

router.post('/signUp', userController.postSignup);

router.post('/signUp/Facebook', userController.postSignupFB);

router.post('/logIn', userController.postLogin);

router.post('/logIn/Facebook', userController.postLoginFB);

router.post('/change_password', passport.authenticate('jwt'), userController.change_password);

router.get('/autenticated', passport.authenticate('jwt'),
	function(req, res) {
		if (!req.user){
			return res.send({status:false});
		}
		const tempUser = 
		{
			"_id": req.user._id,
			"nombre": req.user.nombre,
			"apellido": req.user.apellido,
			"nickname": req.user.nickname,
			"mail": req.user.mail,
			"plan": req.user.plan,
			"admin": req.user.admin
		}
		return res.send({status:true, user:tempUser});	
		
	}
);
 
router.post('/usuario/actualizar', passport.authenticate('jwt'), async (req, res) => {
	if(!req.user){
		return res.send({status:false});
	}
	const { nombre, apellido, mail, plan } = req.body;
	
	await User.findByIdAndUpdate(req.user._id, {$set:{nombre, apellido, mail, plan}}, { new: true }, 
		(err, user)=>{

			if(err){
				if(err.keyPattern.mail){
					return res.send({status:false, message:`${err.keyValue.mail} ya esta en uso`});
				}
				else{
					return res.send({status:false, message:"error en el servidor"})
				}
			}

			if(!user){
				return res.send({status:false})
			}
			
			return res.send({status:true, user})

		}
	);
});

module.exports = router;
