const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/Users');
const Proyect = require('../models/Proyects');
const Carpeta = require('../models/Carpetas');
const controllerProyecto = require('../controllers/controllerProyecto');
const controllerCarpeta = require('../controllers/controllerCarpeta');


router.post('/carpetas/contenido', passport.authenticate('jwt'),async function(req, res){
    if(!req.user){
        return res.send({status:false, message:'unauthorized'});
    }
    if(req.body.idCarpeta){
        const idCarpeta = (req.body.idCarpeta.length < 12)? "123456789012":req.body.idCarpeta;
        const folder = await Carpeta.findOne({$and:[{_id:idCarpeta}, {$or:[{creador: req.user._id},{colaboradores: req.user._id}]}]})
        .populate('proyectos')
        .populate('carpetas')
        .populate('Snippets')
        .populate('colaboradores', 'nickname');
        if (folder==null){
            return res.send({status:false, message:'carpeta no encontrada'});
        }
        return res.send({status:true, message:'correcto', folder, raiz:false});
        
    } else {
        const folder = await Carpeta.findOne({nombre: req.user.nickname, creador: req.user._id})
        .populate('proyectos')
        .populate('carpetas')
        .populate('Snippets')
        .populate('colaboradores', 'nickname');
        
        if (folder==null){
            return res.send({status:false, message:'carpeta no encontrada'});
        }
        return res.send({status:true, message:'correcto', folder, raiz:true});
        
    }
});

router.get('/carpetas', passport.authenticate('jwt'),async function(req, res){
    if(req.user){
        const folders = await Carpeta.find({creador: req.user._id}, "_id nombre")
        if (folders){
            return res.send({status:true, message:'correcto', folders});
        }else{
            return res.send({status:false, message:'carpeta no encontrada'});
        }
    }else{
        return res.send({status:false, message:'unauthorized'});
    }
});

router.post('/carpetas/crear',passport.authenticate('jwt'), async function(req, res){
    const limite = await controllerCarpeta.LimiteCarpetas(req.user._id);
    if(!limite){
        const carpetaVacia = await controllerCarpeta.CrearCarpetaVacia(req.body.carpeta, req.user._id);
        if (carpetaVacia){
            const carpetaExistente = await controllerCarpeta.Carpeta_a_Carpeta(carpetaVacia._id, req.body.idCarpeta);
            if(carpetaExistente){
                return res.send({status:true, message:'correcto', folder:carpetaVacia});
            } else {
                return res.send({status:false, message:'carpeta no creada'});    
            }
        }else{
            return res.send({status:false, message:'carpeta no creada'});
        }
    }else{
        return res.send({status:false, message:'Limite de carpetas alcanzado'});
    }
});


router.post('/carpetas/borrar', passport.authenticate('jwt'), async function(req, res){
    if(req.user){
        await Carpeta.updateMany({"carpetas._id":req.body.idCarpeta},{$pull:{"carpetas":req.body.idCarpeta}},
        function(err, carpeta){
            if(err){
                return res.send({status:false, message:"Error on remove folder"})
            }
        })
        const folder = await Carpeta.findById(req.body.idCarpeta);
        
        if (folder){

            folder.proyectos.forEach(async element => {
                await Proyect.findByIdAndRemove(element._id);
            });

            folder.carpetas.forEach(async element =>{
                await Carpeta.findByIdAndRemove(element._id);
            });

            await Carpeta.findByIdAndRemove(req.body.idCarpeta)

            return res.send({status:true, message:'correcto', folder, raiz:false});
        }else{
            return res.send({status:false, message:'carpeta no encontrada'});
        }
        
    }else{
        return res.send({status:false, message:'unauthorized'});
    }
});



router.post('/carpetas/compartir', passport.authenticate('jwt'), async function(req, res) {

    
    if(req.user){
        
        const result = await controllerCarpeta.CompartirCarpeta(req.body.colaborador, req.body.idCarpeta);

        return res.send(result)
        
    } else {
        res.send({
            status:false, 
            message:'user not authorized'
        });
    }
});



router.get('/carpetas/colaborador', passport.authenticate('jwt'),async function(req, res){
    if(req.user){
            let folder = await Carpeta.find({colaboradores:req.user._id}).populate({path:'creador', select:'nickname'});
            
            let proyects = await Proyect.find({colaboradores:req.user._id}).populate({path:'creador', select:'nickname'});

            return res.send({status:true, message:'correcto', carpetas:folder, proyectos:proyects});
        
    }else{
        return res.send({status:false, message:'unauthorized'});
    }
});

module.exports = router;