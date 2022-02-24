const User = require('../models/Users');
const Proyect = require('../models/Proyects');
const Carpeta = require('../models/Carpetas');

exports.CrearProyecto = async function guardarProyecto(proyecto, idUsuario){
    const newProyect = new Proyect({
        nombre: proyecto.nombre,
        creador: idUsuario,
        html:proyecto.html,
        css:proyecto.css,
        js:proyecto.js
    });    
    const pro = await newProyect.save();
    console.log(pro)
    if(pro){
        return pro._id;
    } else{
        return false;
    }
} 

exports.CompartirProyecto = async function compartirProyecto(colaborador, idProyecto){
	
	const resColaborador = await User.findOne({ $or: [ {nickname: colaborador}, {mail: colaborador} ]});

        if(!resColaborador){
            return {
                status:false,
                message: 'Colaborator not Found'
            };
        }

        const result = await Proyect.updateOne({'_id':idProyecto}, {
            $push:{
                colaboradores: {_id:resColaborador._id}
            }
        });

        const tempColaborador = {
            "_id": resColaborador._id,
            "nombre": resColaborador.nombre,
            "apellido": resColaborador.apellido,
            "nickname": resColaborador.nickname,
            "mail": resColaborador.mail,
            "plan": resColaborador.plan,
            "admin": false
        }

        if (result.n){
            return {status:true, message:'proyect shared', colaborador:tempColaborador}; 
            
        } else {
            return {
                status:false,
                message: 'Mongo server save error'
            };
        }
}


exports.limiteProyecto = async function(req, res){
    if(req.user){
        let plan = req.user.plan;
        let cantidadP = await Proyect.countDocuments({creador: req.user._id});
        let limite;
        switch(plan){
            case '1':
                limite = (cantidadP<1)? false: true;
                break;

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