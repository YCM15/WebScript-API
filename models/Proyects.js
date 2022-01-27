const { Schema, model } = require('mongoose');

const ProyectSchema = new Schema({

    nombre:String,
    creador: {type: Schema.Types.ObjectId, ref: 'User'},
    html:String,
    css:String,
    js:String,
    colaboradores:[{type: Schema.Types.ObjectId, ref: 'User'}]
},{
    timestamps: true
});

module.exports = model('Proyect', ProyectSchema);