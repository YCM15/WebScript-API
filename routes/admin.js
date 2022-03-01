const express = require('express');
const passport = require('passport');
const router = express.Router();

const User = require('../models/Users');
const Proyect = require('../models/Proyects');
const Carpeta = require('../models/Carpetas');
const Snippet = require('../models/Snippets');


router.get('/admin/statistics', passport.authenticate('jwt'), async (req, res)=>{
    if(!req.user){
        return res.send({status:false, message:"unauthorized"});
    }

    if(!req.user.admin){
        return res.send({status:false, message:"unauthorized"});
    }

    let users = await User.countDocuments();

    let proyectos = await Proyect.countDocuments();
    let carpetas = await Carpeta.countDocuments();
    let snippets = await Snippet.countDocuments();

    return res.send({status:true, statistics:{users, proyectos, carpetas, snippets}});

});

router.get('/admin/statistics-snippets', passport.authenticate('jwt'), async (req, res)=>{
    if(!req.user){
        return res.send({status:false, message:"unauthorized"});
    }

    if(!req.user.admin){
        return res.send({status:false, message:"unauthorized"});
    }
    let snippets = await Snippet.aggregate([
        {
            $group:{
                "_id":"$lenguaje",
                "snippets":"$nombre"
            }
        }
    ]);

    return res.send({status:true, statistics:snippets});

});



module.exports = router;