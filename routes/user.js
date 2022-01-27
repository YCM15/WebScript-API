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

router.get('/autenticated', passport.authenticate('jwt'),
	function(req, res) {
		if (req.user){
			const tempUser = 
			{
				"_id": req.user._id,
				"nombre": req.user.nombre,
				"apellido": req.user.apellido,
				"nickname": req.user.nickname,
				"mail": req.user.mail,
				"plan": "3",
				"admin": false
			}
			return res.send({status:true, user:tempUser});	
		}else{
			return res.send({status:false});
		}
	}
);

router.post('/logOut', configPassport.estaAutenticado, userController.postLogout);

router.get('/userInfo', passport.authenticate('jwt'),
function(req, res) {
	if (req.user){
		res.status(200).send({status:true, user:req.user});	
	}else{res.send({status:false});}
}
);
 
router.post('/usuario/actualizar', passport.authenticate('jwt'), async (req, res) => {
	if(req.user){
		const { nombre, apellido, mail, plan } = req.body;
		
		await User.findByIdAndUpdate(req.user._id, 
			{$set:{nombre, apellido, mail, plan}}, 
			{ new: true }, (err, user)=>{
				if(err){
					if(err.keyPattern.mail){
						return res.send({status:false, message:`${err.keyValue.mail} ya esta en uso`});
					}
					else{
						return res.send({status:false, message:"error en el servidor"})
					}
				} else if(user){
					return res.send({status:true, user})
				} else {
					return res.send({status:false})
				}

			});
		
		
	} else {
		return res.send({status:false});
	}
	

	
});
module.exports = router;
