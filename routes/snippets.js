const express = require('express');
const router = express.Router();
const passport = require('passport');
const Snippet = require('../models/Snippets');
const controllerSnippet = require('../controllers/controllerSnippet');
const controllerCarpeta = require('../controllers/controllerCarpeta');


router.post('/snippets/guardar', passport.authenticate('jwt'),
async function(req, res) {
    const limite = await controllerSnippet.limiteSnippet(req, res);
    if (!limite){
        let result = await controllerSnippet.CrearSnippet(req.body, req.user._id);

        if(req.body.folder && result){

            let newResult = await controllerCarpeta.Snippet_a_Carpeta(result, req.body.folder);
            if(newResult){
                return res.send({status: true, id: result._id, message:`Snippet guardado`});
            }else{
                return res.send({status: false, message:'Error al guardar en carpeta'});
            }

        } else if(result){

                let newResult = await controllerCarpeta.Snippet_a_CarpetaRaiz(result, req.user.nickname);
                if(newResult){
                    return res.send({status: true, id: result._id, message:`Snippet guardado`});
                }else{
                    return res.send({status: false, message:'Error al guardar en carpeta'});
                }

        } else {
            return res.send({status: false, message:'Snippet no guardado'});
        }
    }else{
        return res.send({status:false, message: 'Has alcanzado el limite de snippets a almacenar en tu plan'});

    }
});



router.post('/snippets/actualizar', passport.authenticate('jwt'), async function(req, res){
    if(req.user){
        const snippet = await Snippet.findByIdAndUpdate(req.body.idSnippet, 
            {$set:{lenguaje:req.body.lenguaje, codigo:req.body.codigo}}, 
            { new: true });
        
        if(snippet){
            return res.send({status:true, snippet})
        } else {
            return res.send({status:false})
        }
    }
});


router.post('/snippets/borrar', passport.authenticate('jwt'), async function(req, res){
    if(req.user){
        const snippet = await Snippet.findByIdAndRemove(req.body.idSnippet);

        await Carpeta.findOne({"Snippets._id":req.body.idSnippet}, {$pull:{"Snippets":req.body.idSnippet}}, 
        (err, result)=>{
            if(err){
                return res.send({status:false, message:"error on remove snippets"});
            }
        });
        
        if(snippet){
            return res.send({status:true, snippet})
        } else {
            return res.send({status:false})
        }
    }
});


router.post('/snippets', passport.authenticate('jwt'), function(req, res){
    if(req.user){
        Snippet.findOne({'_id':req.body.idSnippet}, function(err, snippet) {
            if (err) {
                return res.send({status:false, mensaje: 'error'});
            }else if (!snippet) {
                return res.send({status:false, mensaje:'no encontrado'});
            }else {
                return res.send({status:true,snippet});
            }
        });
    } else{
        return res.send({status:false, mensaje:'unathorized'});
    }
});

module.exports = router;