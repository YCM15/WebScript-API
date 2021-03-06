const { Schema, model } = require('mongoose');
const Proyect = require('./Proyects');
const Snippet = require('./Snippets');
const Carpeta = require('./Carpetas');

const CarpetaSchema = new Schema({
    nombre:String,
    creador: {type: Schema.Types.ObjectId, ref: 'User'},
    proyectos: [{type: Schema.Types.ObjectId, ref:'Proyect'}],
    carpetas: [{type: Schema.Types.ObjectId, ref:'Carpeta'}],
    colaboradores:[{type: Schema.Types.ObjectId, ref: 'User'}],
    Snippets:[{type: Schema.Types.ObjectId, ref: 'Snippet'}]
},{
    timestamps: true
});

module.exports = model('Carpeta', CarpetaSchema);