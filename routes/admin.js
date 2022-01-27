const express = require('express');
const passport = require('passport');
const router = express.Router();

const User = require('../models/Users');
const Proyect = require('../models/Proyects');
const Carpeta = require('../models/Carpetas');
const Snippet = require('../models/Snippets');


router.get('/admin/estadisticas', passport.authenticate('jwt'), async (req, res)=>{
    if(!req.user){
        return res.send({status:false, message:"unauthorized"});
    }

    let usuarios = await User.countDocuments();
    let Fb = await User.countDocuments({ FB_ID : { $ne: null } });
    let totalUsuarios = {
        total: usuarios,
        nativos: usuarios-Fb,
        Fb: Fb
    }

    let proyectos = await Proyect.countDocuments();
    let carpetas = await Carpeta.countDocuments();
    let snippets = await Snippet.countDocuments();

    let archivos = {
        proyectos: proyectos,
        carpetas: carpetas,
        snippets: snippets
    }

    return res.send({status:true, estadisticas:{totalUsuarios, archivos}});

});



module.exports = router;