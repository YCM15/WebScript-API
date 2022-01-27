const User = require('../models/Users');
const Proyect = require('../models/Proyects');
const Carpeta = require('../models/Carpetas');

exports.CarpetaPadre = async function CarpetaPadre(carpeta, idUsuario){
    const newCarpeta = Carpeta({
        nombre: carpeta,
        creador: idUsuario
    });
    const carp = await newCarpeta.save();
    if(carp){
        return carp._id;
    } else {
        return false;
    }
}

exports.CrearCarpeta = async function crearCarpeta(carpeta, idUsuario, idProyecto){
    const newCarpeta = Carpeta({
        nombre: carpeta,
        creador: idUsuario,
        proyectos: {_id:idProyecto}
    });
    const carp = await newCarpeta.save();
    if(carp){
        return carp;
    } else {
        return false;
    }
}

exports.CrearCarpetaVacia = async function crearCarpetaVacia(carpeta, idUsuario){
    const newCarpeta = Carpeta({
        nombre: carpeta,
        creador: idUsuario
    });
    const carp = await newCarpeta.save();
    if(carp){
        return carp;
    } else {
        return false;
    }
}

exports.Proyecto_a_Carpeta = async function proyectoAcarpeta(proyecto, idCarpeta){
	    const result = await Carpeta.updateOne({'_id':idCarpeta}, {
            $push:{
                proyectos: {_id:proyecto}
            }
        }, {new: true});

        if (result){
            return true;
            
        } else {
            return false;
        }
}

exports.Proyecto_a_CarpetaRaiz = async function proyectoAcarpetaRaiz(proyecto, idCarpeta){
	    const result = await Carpeta.updateOne({'nombre':idCarpeta}, {
            $push:{
                proyectos: {_id:proyecto}
            }
        });

        if (result.n){
            return true;
            
        } else {
            return false;
        }
}

exports.Snippet_a_Carpeta = async function(snippet, idCarpeta){
    const result = await Carpeta.updateOne({'_id':idCarpeta}, {
        $push:{
            Snippets: {_id:snippet}
        }
    }, {new: true});

    if (result){
        return true;
        
    } else {
        return false;
    }
}

exports.Snippet_a_CarpetaRaiz = async function(snippet, idCarpeta){
    const result = await Carpeta.updateOne({'nombre':idCarpeta}, {
        $push:{
            Snippets: {_id:snippet}
        }
    });

    if (result.n){
        return true;
        
    } else {
        return false;
    }
}


exports.Colaborador_a_Carpeta = async function colaboradorAcarpeta(colaborador, idCarpeta){
	    const result = await Carpeta.updateOne({'_id':idCarpeta}, {
            $push:{
                colaboradores: {_id:colaborador}
            }
        });

        if (result.n){
            return true;
            
        } else {
            return false;
        }
}


exports.Carpeta_a_Carpeta = async function carpetaAcarpeta(carpeta, idCarpeta){
	    const result = await Carpeta.updateOne({'_id':idCarpeta}, {
            $push:{
                carpetas: {_id:carpeta}
            }
        });

        if (result.n){
            return true;
            
        } else {
            return false;
        }
}

exports.Carpeta_a_CarpetaRaiz = async function carpetaAcarpetaRaiz(carpeta, idCarpeta){
        const result = await Carpeta.updateOne({'nombre':idCarpeta}, {
            $push:{
                carpetas: {_id:carpeta}
            }
        });

        if (result.n){
            return true;
            
        } else {
            return false;
        }
}


exports.CompartirCarpeta = async function compartirCarpeta(colaborador, idCarpeta){
    
    const resColaborador = await User.findOne({ $or: [ {nickname: colaborador}, {mail: colaborador} ]});

        if(!resColaborador){
            return {
                status:false,
                message: 'Colaborator not Found'
            };
        }

        const result = await Carpeta.updateOne({'_id':idCarpeta}, {
            $push:{
                colaboradores: {_id:resColaborador._id}
            }
        });

        if (result.n){
            return {status:true, message:'carpeta shared', nombre:resColaborador.nickname}; 
            
        } else {
            return {
                status:false,
                message: 'Mongo server save error'
            };
        }
}

exports.LimiteCarpetas = async function limiteCarpetas(idUser){
    const carpetas = Carpeta.countDocuments({creador:idUser});
    return (carpetas < 4)? true:false;
}