const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/Users');
const Proyect = require('../models/Proyects');
const Carpeta = require('../models/Carpetas');

const controllerProyecto = require('../controllers/controllerProyecto');
const controllerCarpeta = require('../controllers/controllerCarpeta');


router.post('/proyectos/guardar', passport.authenticate('jwt'),
async function(req, res) {
    const limite = await controllerProyecto.limiteProyecto(req, res);
    if (!limite){
        let result = await controllerProyecto.CrearProyecto(req.body, req.user._id);//guardarProyecto(req.body, req.user._id);
        //console.log(result);

        if(result && req.body.carpeta){
            
                let newResult = await controllerCarpeta.CrearCarpeta(req.body.carpeta, req.user._id, result);
                if(newResult){
                    let nResult = await controllerCarpeta.Carpeta_a_CarpetaRaiz(newResult._id, req.user.nickname);
                    if(nResult){
                        return res.send({status: true, id: result._id, message:`proyecto guardado en ${newResult.nombre}`});
                    }else{
                        return res.send({status: true, id: result._id, message:`proyecto guardado en carpeta nueva carpeta`});
                    }
                }else{
                    return res.send({status: false, message:'Error al crear la carpeta'});
                }

        } else if(req.body.folder && result){

            let newResult = await controllerCarpeta.Proyecto_a_Carpeta(result, req.body.folder);
            if(newResult){
                return res.send({status: true, id: result._id, message:`proyecto guardado en carpeta existente`});
            }else{
                return res.send({status: false, message:'Error al guardar en carpeta'});
            }

        } else if(result){

                let newResult = await controllerCarpeta.Proyecto_a_CarpetaRaiz(result, req.user.nickname);
                if(newResult){
                    return res.send({status: true, id: result._id, message:`proyecto guardado en carpeta raiz: ${req.user.nickname}`});
                }else{
                    return res.send({status: false, message:'Error al guardar en carpeta raiz'});
                }

        } else {
            return res.send({status: false, message:'proyecto no guardado'});
        }
    }else{
        return res.send({status:false, message: 'Has alcanzado el limite de proyectos, actualiza tu plan para crear mas proyectos'});

    }
});




router.get('/proyectos/creador', passport.authenticate('jwt'), async function(req, res) {
    if(req.user){
        const proyects = await Proyect.find({creador: req.user._id}).populate({path:'colaboradores._id', select:'nickname'});
        if(!proyects){
                res.send({
                    status:false,
                    message: 'Not proyects like creator'
                });
            } else{
            
                res.send({status:true, proyectos: proyects});
            }
    } else {
        res.send({
            status:false, 
            message:'user not authorized'
        });
    }
});




router.get('/proyectos/colaborador', passport.authenticate('jwt'), async function(req, res) {
    if(req.user){
        const proyects = await Proyect.find({'colaboradores._id':req.user._id}).populate({path:'creador', select:'nickname'});
        if(proyects.length > 0){
            let arreglo =[];
            let tempItem;
            proyects.forEach(async element => {
                tempItem = await Carpeta.findOne({"proyectos._id":element._id});
                if(!tempItem){
                    arreglo.push(tempItem);
                }
            });
            if(arreglo.length > 0){
                res.send({status:true, proyectos: arreglo});
            } else {
                return res.send({status:false, menssage:"Los proyectos en colaboracion se encuantran dentro de las carpetas"})
            }
        }else{
            res.send({
                status:false,
                message: 'Not proyects like collaborator'
            });
        }
    } else {
        res.send({
            status:false, 
            message:'user not authorized'
        });
    }
});




router.post('/proyectos/compartir', passport.authenticate('jwt'), async function(req, res) {

    //console.log(req.body);
    if(req.user){
        
        const result = await controllerProyecto.CompartirProyecto(req.body.colaborador, req.body.idProyecto);

        return res.send(result)
        
    } else {
        res.send({
            status:false, 
            message:'user not authorized'
        });
    }
});




router.post('/proyecto', passport.authenticate('jwt'), function(req, res){
    if(req.user){
        Proyect.findOne({'_id':req.body.idProyecto}, function(err, proyecto) {
            if (err) {
                return res.send({status:false, mensaje: 'error'});
            }else if (!proyecto) {
                return res.send({status:false, mensaje:'no encontrado'});
            }else {
                return res.send({status:true,proyecto});
            }
        });
    } else{
        return res.send({status:false, mensaje:'unathorized'});
    }
});




router.post('/proyectos/actualizar', passport.authenticate('jwt'), async function(req, res){
    if(req.user){
        const proyecto = await Proyect.findByIdAndUpdate(req.body.idProyecto, 
            {$set:{html:req.body.html, css:req.body.css, js:req.body.js}}, 
            { new: true });
        
        if(proyecto){
            return res.send({status:true, proyecto})
        } else {
            return res.send({status:false})
        }
    }
});


router.post('/proyectos/borrar', passport.authenticate('jwt'), async function(req, res){
    if(req.user){
        const proyecto = await Proyect.findByIdAndRemove(req.body.idProyecto);

        await Carpeta.updateMany({"proyectos._id":req.body.idProyecto}, {$pull:{"proyectos":req.body.idProyecto}}, (err, result)=>{
            if(err){
                return res.send({status:false, message:"Error on remove proyect"})
            }
        });
        
        if(proyecto){
            return res.send({status:true, proyecto})
        } else {
            return res.send({status:false})
        }
    }
});


module.exports = router;