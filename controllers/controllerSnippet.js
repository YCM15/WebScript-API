const User = require('../models/Users');
const Snippet = require('../models/Snippets');
const Carpeta = require('../models/Carpetas');


exports.CrearSnippet = async function(snippet, idUsuario){
    const newSnippet = new Snippet({
        nombre: snippet.nombre,
        creador: idUsuario,
        codigo:snippet.codigo,
        lenguaje:snippet.lenguaje
    });    
    const snp = await newSnippet.save();

    if(snp){
        return snp._id;
    } else{
        return false;
    }
}


exports.limiteSnippet = async function(req, res){
    if(req.user){
        let plan = req.user.plan;
        let cantidadP = await Snippet.countDocuments({creador: req.user._id});
        let limite;
        switch(plan){
            case '2':
                limite = (cantidadP<5)? false: true;
                break;

            case '3':
                limite = (cantidadP<10)? false: true;
                break;

            default:
                limite = true;
                break;
        }

        return limite;
    } else {
        return false;
    }
    
}